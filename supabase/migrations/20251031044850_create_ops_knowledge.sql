-- ============================================================================
-- AI Ops Control Plane: Knowledge Base Table
-- ============================================================================
-- This migration creates the ops_knowledge table to store ingested 
-- documentation and code with embeddings for RAG-based Q&A.
-- ============================================================================

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create ops_knowledge table
CREATE TABLE IF NOT EXISTS public.ops_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  embedding vector(3072), -- OpenAI text-embedding-3-large dimension
  metadata jsonb DEFAULT '{}'::jsonb,
  source_type text NOT NULL, -- 'code', 'markdown', 'config'
  source_path text NOT NULL,
  source_hash text, -- For detecting changes
  chunk_index integer DEFAULT 0, -- For large documents split into chunks
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for efficient retrieval
-- IVF-Flat index with lists=100 is suitable for small to medium datasets (<100k vectors)
-- For larger datasets, consider increasing lists to sqrt(row_count)/10
-- See: https://github.com/pgvector/pgvector#ivfflat
CREATE INDEX IF NOT EXISTS ops_knowledge_embedding_idx 
  ON public.ops_knowledge 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS ops_knowledge_metadata_idx 
  ON public.ops_knowledge 
  USING gin (metadata);

CREATE INDEX IF NOT EXISTS ops_knowledge_source_path_idx 
  ON public.ops_knowledge (source_path);

CREATE INDEX IF NOT EXISTS ops_knowledge_source_type_idx 
  ON public.ops_knowledge (source_type);

CREATE INDEX IF NOT EXISTS ops_knowledge_created_at_idx 
  ON public.ops_knowledge (created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ops_knowledge_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER ops_knowledge_updated_at
  BEFORE UPDATE ON public.ops_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION update_ops_knowledge_updated_at();

-- Grant access to service role (API will use service role key)
GRANT ALL ON public.ops_knowledge TO service_role;

-- Add comment for documentation
COMMENT ON TABLE public.ops_knowledge IS 'AI Ops Control Plane knowledge base with embeddings for RAG';
COMMENT ON COLUMN public.ops_knowledge.embedding IS 'Vector embedding (3072 dimensions for text-embedding-3-large)';
COMMENT ON COLUMN public.ops_knowledge.metadata IS 'Additional metadata: file_type, section, tags, etc.';
COMMENT ON COLUMN public.ops_knowledge.source_hash IS 'Hash of content for change detection';
COMMENT ON COLUMN public.ops_knowledge.chunk_index IS 'Index for documents split into multiple chunks';

-- Create RPC function for vector similarity search
CREATE OR REPLACE FUNCTION match_ops_knowledge(
  query_embedding vector(3072),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  source_type text,
  source_path text,
  chunk_index integer,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ops_knowledge.id,
    ops_knowledge.content,
    ops_knowledge.metadata,
    ops_knowledge.source_type,
    ops_knowledge.source_path,
    ops_knowledge.chunk_index,
    1 - (ops_knowledge.embedding <=> query_embedding) as similarity
  FROM public.ops_knowledge
  WHERE 1 - (ops_knowledge.embedding <=> query_embedding) > match_threshold
  ORDER BY ops_knowledge.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION match_ops_knowledge TO service_role;
