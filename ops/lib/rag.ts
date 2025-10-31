/**
 * Retrieval Augmented Generation (RAG) for AI Ops Q&A
 * Retrieves relevant context from knowledge base and generates answers
 */

import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from './embeddings';

interface RAGOptions {
  maxResults?: number;
  similarityThreshold?: number;
  includeKeywordSearch?: boolean;
}

interface KnowledgeMatch {
  id: string;
  source_type: string;
  source_path: string;
  content: string;
  metadata: Record<string, any>;
  similarity: number;
}

interface RAGResponse {
  answer: string;
  sources: KnowledgeMatch[];
  confidence: number;
}

/**
 * Search knowledge base using vector similarity
 */
async function searchBySimilarity(
  supabase: any,
  queryEmbedding: number[],
  maxResults: number,
  threshold: number
): Promise<KnowledgeMatch[]> {
  const { data, error } = await supabase.rpc('ops_search_knowledge', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: maxResults,
  });

  if (error) {
    console.error('Vector search error:', error);
    return [];
  }

  return data || [];
}

/**
 * Search knowledge base using keyword search
 */
async function searchByKeywords(
  supabase: any,
  query: string,
  maxResults: number
): Promise<KnowledgeMatch[]> {
  const { data, error } = await supabase.rpc('ops_search_keywords', {
    query_text: query,
    match_count: maxResults,
  });

  if (error) {
    console.error('Keyword search error:', error);
    return [];
  }

  return data || [];
}

/**
 * Retrieve relevant context from knowledge base
 */
export async function retrieveContext(
  query: string,
  options: RAGOptions = {}
): Promise<KnowledgeMatch[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration missing');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const maxResults = options.maxResults || 10;
  const threshold = options.similarityThreshold || 0.7;

  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query);

  // Search using vector similarity
  let results = await searchBySimilarity(
    supabase,
    queryEmbedding,
    maxResults,
    threshold
  );

  // Optionally augment with keyword search
  if (options.includeKeywordSearch && results.length < maxResults) {
    const keywordResults = await searchByKeywords(
      supabase,
      query,
      maxResults - results.length
    );
    
    // Merge results, avoiding duplicates
    const existingPaths = new Set(results.map(r => r.source_path));
    const newKeywordResults = keywordResults.filter(
      r => !existingPaths.has(r.source_path)
    );
    
    results = [...results, ...newKeywordResults];
  }

  return results.slice(0, maxResults);
}

/**
 * Generate answer using OpenAI GPT
 */
async function generateAnswer(
  query: string,
  context: KnowledgeMatch[]
): Promise<{ answer: string; confidence: number }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Build context string from retrieved documents
  const contextString = context
    .map((doc, idx) => {
      return `[Source ${idx + 1}: ${doc.source_path}]\n${doc.content}\n`;
    })
    .join('\n---\n');

  // System prompt for ops agent
  const systemPrompt = `You are an AI Ops assistant for the Circle Network platform. You have deep knowledge of the codebase, infrastructure, and business requirements.

Your responsibilities:
- Answer questions about the platform architecture, features, and configuration
- Provide guidance on Supabase, Vercel, Stripe, and GitHub setup
- Explain onboarding flows, pricing tiers, and feature capabilities
- Suggest infrastructure improvements and identify potential issues

Use the provided context to answer questions accurately. If you can suggest actionable changes (like creating a migration or updating configuration), include those in your response.

Context from knowledge base:
${contextString}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPS_GPT_MODEL || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const answer = data.choices[0]?.message?.content || 'Unable to generate answer.';

  // Calculate confidence based on source relevance
  const avgSimilarity = context.length > 0
    ? context.reduce((sum, doc) => sum + doc.similarity, 0) / context.length
    : 0;

  return {
    answer,
    confidence: avgSimilarity,
  };
}

/**
 * Main RAG function - retrieve context and generate answer
 */
export async function askQuestion(
  query: string,
  options: RAGOptions = {}
): Promise<RAGResponse> {
  // Retrieve relevant context
  const sources = await retrieveContext(query, options);

  // Generate answer using retrieved context
  const { answer, confidence } = await generateAnswer(query, sources);

  return {
    answer,
    sources,
    confidence,
  };
}

/**
 * Determine if a query requires infrastructure changes
 */
export function requiresInfrastructureAction(query: string): boolean {
  const actionKeywords = [
    'create',
    'add',
    'update',
    'fix',
    'setup',
    'configure',
    'ensure',
    'verify',
    'migrate',
    'deploy',
  ];

  const queryLower = query.toLowerCase();
  return actionKeywords.some(keyword => queryLower.includes(keyword));
}

/**
 * Extract action type from query
 */
export function extractActionType(query: string): string | null {
  const queryLower = query.toLowerCase();

  if (queryLower.includes('supabase') || queryLower.includes('database') || queryLower.includes('table')) {
    return 'supabase';
  }
  if (queryLower.includes('storage') || queryLower.includes('bucket')) {
    return 'storage';
  }
  if (queryLower.includes('vercel') || queryLower.includes('env') || queryLower.includes('environment')) {
    return 'vercel';
  }
  if (queryLower.includes('stripe') || queryLower.includes('payment') || queryLower.includes('pricing')) {
    return 'stripe';
  }
  if (queryLower.includes('github') || queryLower.includes('pr') || queryLower.includes('pull request')) {
    return 'github';
  }

  return null;
}
