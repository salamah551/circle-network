-- ============================================================================
-- AI Ops Knowledge Base Migration
-- ============================================================================
-- This migration creates the ops_knowledge table for storing ingested
-- documentation, code, and configuration with vector embeddings for RAG.
-- ============================================================================

-- Create ops_knowledge table for storing indexed content
CREATE TABLE IF NOT EXISTS public.ops_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL, -- 'markdown', 'code', 'sql', 'config', 'yaml'
  source_path text NOT NULL, -- relative path in repo or identifier
  content text NOT NULL,
  metadata jsonb DEFAULT '{}', -- additional context (e.g., file type, tags)
  embedding vector(1536), -- OpenAI text-embedding-3-large dimension
  keywords tsvector, -- for keyword-based search
  checksum text, -- content hash for change detection
  indexed_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for efficient search
CREATE INDEX IF NOT EXISTS ix_ops_knowledge_source_type 
ON public.ops_knowledge (source_type);

CREATE INDEX IF NOT EXISTS ix_ops_knowledge_source_path 
ON public.ops_knowledge (source_path);

-- GIN index for full-text search on keywords
CREATE INDEX IF NOT EXISTS ix_ops_knowledge_keywords 
ON public.ops_knowledge USING GIN (keywords);

-- HNSW index for vector similarity search (approximate nearest neighbor)
CREATE INDEX IF NOT EXISTS ix_ops_knowledge_embedding 
ON public.ops_knowledge USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Index on checksum for fast change detection
CREATE INDEX IF NOT EXISTS ix_ops_knowledge_checksum 
ON public.ops_knowledge (checksum);

-- Enable RLS (restrict to admins only)
ALTER TABLE public.ops_knowledge ENABLE ROW LEVEL SECURITY;

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  -- Check if the user has admin role in profiles table
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policy: Only admins can read ops_knowledge
CREATE POLICY "Admins can view ops knowledge"
ON public.ops_knowledge
FOR SELECT
USING (is_admin());

-- RLS Policy: Only admins can insert/update ops_knowledge
CREATE POLICY "Admins can manage ops knowledge"
ON public.ops_knowledge
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS tr_ops_knowledge_updated_at ON public.ops_knowledge;
CREATE TRIGGER tr_ops_knowledge_updated_at
BEFORE UPDATE ON public.ops_knowledge
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- Create ops_plans table for storing plan/apply operations
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ops_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  plan_type text NOT NULL, -- 'supabase', 'storage', 'vercel', 'stripe', 'github'
  desired_state jsonb NOT NULL,
  current_state jsonb,
  diff jsonb,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'applied', 'failed'
  created_by uuid REFERENCES auth.users(id),
  approved_by uuid REFERENCES auth.users(id),
  applied_at timestamptz,
  error_message text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS ix_ops_plans_status 
ON public.ops_plans (status);

CREATE INDEX IF NOT EXISTS ix_ops_plans_created_by 
ON public.ops_plans (created_by);

-- Enable RLS on ops_plans
ALTER TABLE public.ops_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can view ops plans
CREATE POLICY "Admins can view ops plans"
ON public.ops_plans
FOR SELECT
USING (is_admin());

-- RLS Policy: Only admins can manage ops plans
CREATE POLICY "Admins can manage ops plans"
ON public.ops_plans
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS tr_ops_plans_updated_at ON public.ops_plans;
CREATE TRIGGER tr_ops_plans_updated_at
BEFORE UPDATE ON public.ops_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- Create ops_audit_log table for tracking all operations
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ops_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation text NOT NULL, -- 'ingest', 'plan', 'apply', 'ask'
  operation_type text, -- specific type within operation
  user_id uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}',
  result jsonb,
  success boolean,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS ix_ops_audit_log_operation 
ON public.ops_audit_log (operation);

CREATE INDEX IF NOT EXISTS ix_ops_audit_log_user_id 
ON public.ops_audit_log (user_id);

CREATE INDEX IF NOT EXISTS ix_ops_audit_log_created_at 
ON public.ops_audit_log (created_at DESC);

-- Enable RLS
ALTER TABLE public.ops_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can view audit log
CREATE POLICY "Admins can view ops audit log"
ON public.ops_audit_log
FOR SELECT
USING (is_admin());

-- RLS Policy: System can insert into audit log
CREATE POLICY "System can insert ops audit log"
ON public.ops_audit_log
FOR INSERT
WITH CHECK (true); -- Allow inserts from service role

-- ============================================================================
-- Helper function for vector similarity search
-- ============================================================================
CREATE OR REPLACE FUNCTION public.ops_search_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  source_type text,
  source_path text,
  content text,
  metadata jsonb,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    k.id,
    k.source_type,
    k.source_path,
    k.content,
    k.metadata,
    1 - (k.embedding <=> query_embedding) AS similarity
  FROM public.ops_knowledge k
  WHERE 1 - (k.embedding <=> query_embedding) > match_threshold
  ORDER BY k.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Helper function for keyword search
-- ============================================================================
CREATE OR REPLACE FUNCTION public.ops_search_keywords(
  query_text text,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  source_type text,
  source_path text,
  content text,
  metadata jsonb,
  rank float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    k.id,
    k.source_type,
    k.source_path,
    k.content,
    k.metadata,
    ts_rank(k.keywords, plainto_tsquery('english', query_text)) AS rank
  FROM public.ops_knowledge k
  WHERE k.keywords @@ plainto_tsquery('english', query_text)
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
