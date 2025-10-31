// lib/ops/embeddings.js
// Embeddings generation for AI Ops Control Plane

import OpenAI from 'openai';

/**
 * Get embeddings provider configuration from environment
 */
export function getEmbeddingsConfig() {
  return {
    provider: process.env.OPS_EMBEDDINGS_PROVIDER || 'openai',
    model: process.env.OPS_EMBEDDINGS_MODEL || 'text-embedding-3-large',
    dimension: 3072 // text-embedding-3-large dimension
  };
}

/**
 * Generate embeddings for text content
 * @param {string} text - The text to generate embeddings for
 * @returns {Promise<number[]>} - The embedding vector
 */
export async function generateEmbedding(text) {
  const config = getEmbeddingsConfig();
  
  if (config.provider !== 'openai') {
    throw new Error(`Unsupported embeddings provider: ${config.provider}`);
  }
  
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for embeddings generation');
  }
  
  const openai = new OpenAI({ apiKey });
  
  try {
    const response = await openai.embeddings.create({
      model: config.model,
      input: text,
      encoding_format: 'float'
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * @param {string[]} texts - Array of texts to generate embeddings for
 * @returns {Promise<number[][]>} - Array of embedding vectors
 */
export async function generateEmbeddings(texts) {
  const config = getEmbeddingsConfig();
  
  if (config.provider !== 'openai') {
    throw new Error(`Unsupported embeddings provider: ${config.provider}`);
  }
  
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for embeddings generation');
  }
  
  const openai = new OpenAI({ apiKey });
  
  try {
    // OpenAI API limit: 2048 inputs per request
    // See: https://platform.openai.com/docs/api-reference/embeddings
    const batchSize = 2048;
    const embeddings = [];
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const response = await openai.embeddings.create({
        model: config.model,
        input: batch,
        encoding_format: 'float'
      });
      
      embeddings.push(...response.data.map(d => d.embedding));
    }
    
    return embeddings;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error(`Failed to generate embeddings: ${error.message}`);
  }
}

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vecA - First vector
 * @param {number[]} vecB - Second vector
 * @returns {number} - Cosine similarity score (0-1)
 */
export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same dimension');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
