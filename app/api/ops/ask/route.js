// app/api/ops/ask/route.js
// POST /api/ops/ask - RAG-based Q&A over repository knowledge

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

import { searchKnowledge } from '@/lib/ops/knowledge-ingest';
import OpenAI from 'openai';

/**
 * POST /api/ops/ask
 * 
 * Answer questions using RAG over repository knowledge
 * 
 * Request body:
 * {
 *   "question": "string",
 *   "generatePlan": boolean (optional)
 * }
 */
export async function POST(request) {
  try {
    // OPS_API_TOKEN is required to use this endpoint
    const expectedToken = process.env.OPS_API_TOKEN;
    if (!expectedToken) {
      console.error('OPS_API_TOKEN is not configured');
      return Response.json(
        { error: 'Ops API is not configured' },
        { status: 503 }
      );
    }

    // Check authorization
    const authHeader = request.headers.get('authorization');
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { question, generatePlan = false } = body;
    
    if (!question) {
      return Response.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }
    
    // Search knowledge base
    const relevantDocs = await searchKnowledge(question, 5);
    
    if (relevantDocs.length === 0) {
      return Response.json({
        success: true,
        answer: 'I could not find relevant information in the knowledge base to answer this question.',
        citations: [],
        question,
        timestamp: new Date().toISOString()
      });
    }
    
    // Build context from relevant documents
    const context = relevantDocs.map((doc, idx) => 
      `[${idx + 1}] Source: ${doc.source_path}\n${doc.content}`
    ).join('\n\n---\n\n');
    
    // Generate answer using OpenAI
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'OPENAI_API_KEY not configured' },
        { status: 500 }
      );
    }
    
    const openai = new OpenAI({ apiKey });
    
    const systemPrompt = `You are an AI Ops assistant with deep knowledge of the Circle Network application. 
Answer questions based on the provided context from the codebase and documentation.
Always cite sources using [1], [2], etc. format when referencing the context.
Be concise but comprehensive.
${generatePlan ? '\nIf the question involves making changes, provide a structured plan with specific steps.' : ''}`;
    
    const userPrompt = `Context from codebase:\n\n${context}\n\nQuestion: ${question}\n\nPlease provide a detailed answer with citations.`;
    
    // Use configurable model, defaulting to gpt-4-turbo-preview
    const model = process.env.OPS_CHAT_MODEL || 'gpt-4-turbo-preview';
    
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });
    
    const answer = completion.choices[0].message.content;
    
    // Extract citations
    const citations = relevantDocs.map((doc, idx) => ({
      index: idx + 1,
      source: doc.source_path,
      type: doc.source_type,
      similarity: doc.similarity
    }));
    
    return Response.json({
      success: true,
      question,
      answer,
      citations,
      context_used: relevantDocs.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in /api/ops/ask:', error);
    return Response.json(
      { 
        error: 'Failed to answer question',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
