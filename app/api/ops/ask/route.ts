/**
 * API Endpoint: POST /api/ops/ask
 * Q&A endpoint for AI Ops - answers questions using RAG
 * Can optionally generate plans or apply fixes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { askQuestion, requiresInfrastructureAction, extractActionType } from '@/ops/lib/rag';

/**
 * Verify admin access
 */
async function isAdmin(request: NextRequest): Promise<{ isAdmin: boolean; userId?: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  // Get session token from request
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { isAdmin: false };
  }

  const token = authHeader.substring(7);
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Verify token and check admin role
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return { isAdmin: false };
  }

  // Check if user has admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return { 
    isAdmin: profile?.role === 'admin',
    userId: user.id
  };
}

/**
 * Log audit entry
 */
async function logAudit(
  operation: string,
  userId: string | null,
  metadata: any,
  result: any,
  success: boolean,
  error?: string
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  await supabase.from('ops_audit_log').insert({
    operation,
    operation_type: 'question_answer',
    user_id: userId,
    metadata,
    result,
    success,
    error_message: error,
  });
}

export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const { isAdmin: admin, userId } = await isAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { 
      question,
      generatePlan = false,
      applyDirectly = false,
      maxResults = 10,
      similarityThreshold = 0.7
    } = body;

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    console.log('Processing question:', question);

    // Get answer using RAG
    const ragResponse = await askQuestion(question, {
      maxResults,
      similarityThreshold,
      includeKeywordSearch: true,
    });

    // Detect if infrastructure action is needed
    const needsAction = requiresInfrastructureAction(question);
    const actionType = needsAction ? extractActionType(question) : null;

    // Prepare response
    const response: any = {
      answer: ragResponse.answer,
      confidence: ragResponse.confidence,
      sources: ragResponse.sources.map(s => ({
        path: s.source_path,
        type: s.source_type,
        similarity: s.similarity,
      })),
      metadata: {
        needs_action: needsAction,
        action_type: actionType,
        source_count: ragResponse.sources.length,
      },
    };

    // If plan generation is requested and action is needed
    if (generatePlan && needsAction) {
      response.plan = {
        type: actionType,
        status: 'plan_generated',
        message: 'Plan generation not yet implemented. Use /api/ops/plan endpoint.',
      };
    }

    // If direct apply is requested (only if OPS_ALLOW_DIRECT_APPLY=true)
    if (applyDirectly && needsAction) {
      const allowDirectApply = process.env.OPS_ALLOW_DIRECT_APPLY === 'true';
      
      if (!allowDirectApply) {
        response.apply_status = {
          error: 'Direct apply is disabled. Set OPS_ALLOW_DIRECT_APPLY=true to enable.',
        };
      } else {
        response.apply_status = {
          status: 'apply_not_implemented',
          message: 'Direct apply not yet implemented. Use /api/ops/apply endpoint.',
        };
      }
    }

    // Log audit
    await logAudit(
      'ask',
      userId || null,
      { question, generate_plan: generatePlan, apply_directly: applyDirectly },
      { answer_length: ragResponse.answer.length, confidence: ragResponse.confidence },
      true
    );

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Question processing error:', error);

    // Log audit
    await logAudit(
      'ask',
      null,
      { question: request.body },
      null,
      false,
      error.message
    );

    return NextResponse.json(
      { 
        error: 'Failed to process question', 
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// Health check
export async function GET(request: NextRequest) {
  const openaiKey = process.env.OPENAI_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return NextResponse.json({
    ready: !!(openaiKey && supabaseUrl),
    config: {
      openai: !!openaiKey,
      supabase: !!supabaseUrl,
      gpt_model: process.env.OPS_GPT_MODEL || 'gpt-4-turbo-preview',
      direct_apply_enabled: process.env.OPS_ALLOW_DIRECT_APPLY === 'true',
    },
  });
}
