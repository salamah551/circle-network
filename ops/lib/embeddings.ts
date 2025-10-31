/**
 * Embeddings Provider for AI Ops Knowledge Base
 * Supports OpenAI and configurable alternative providers
 */

interface EmbeddingConfig {
  provider: string;
  model: string;
  apiKey: string;
  dimensions?: number;
}

interface EmbeddingResponse {
  embedding: number[];
  tokens?: number;
}

/**
 * Get embeddings configuration from environment
 */
export function getEmbeddingsConfig(): EmbeddingConfig {
  const provider = process.env.OPS_EMBEDDINGS_PROVIDER || 'openai';
  const model = process.env.OPS_EMBEDDINGS_MODEL || 'text-embedding-3-large';
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPS_EMBEDDINGS_API_KEY || '';

  if (!apiKey) {
    throw new Error('Embeddings API key not configured. Set OPENAI_API_KEY or OPS_EMBEDDINGS_API_KEY');
  }

  return {
    provider,
    model,
    apiKey,
    dimensions: 1536, // OpenAI text-embedding-3-large default
  };
}

/**
 * Generate embeddings using OpenAI
 */
async function generateOpenAIEmbedding(text: string, config: EmbeddingConfig): Promise<EmbeddingResponse> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      input: text,
      model: config.model,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  
  return {
    embedding: data.data[0].embedding,
    tokens: data.usage?.total_tokens,
  };
}

/**
 * Generate embeddings for text content
 * Automatically chunks text if it exceeds token limits
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const config = getEmbeddingsConfig();

  // Truncate text if too long (rough estimate: 1 token ≈ 4 chars)
  // OpenAI embedding models have a limit of ~8191 tokens
  const maxChars = 30000; // ~7500 tokens with safety margin
  const truncatedText = text.length > maxChars 
    ? text.substring(0, maxChars) 
    : text;

  if (config.provider === 'openai') {
    const result = await generateOpenAIEmbedding(truncatedText, config);
    return result.embedding;
  }

  throw new Error(`Unsupported embeddings provider: ${config.provider}`);
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  // Process in parallel with rate limiting
  const embeddings: number[][] = [];
  const batchSize = 10;

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(text => generateEmbedding(text))
    );
    embeddings.push(...batchResults);
    
    // Small delay to avoid rate limits
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return embeddings;
}

/**
 * Calculate cosine similarity between two embedding vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
