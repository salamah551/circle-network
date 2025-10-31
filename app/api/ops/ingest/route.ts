/**
 * API Endpoint: POST /api/ops/ingest
 * Ingests documentation and code into the ops_knowledge base
 * Requires admin authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ingestKnowledge } from '@/ops/lib/ingestion';
import path from 'path';

/**
 * Verify admin access
 */
async function isAdmin(request: NextRequest): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  // Get session token from request
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7);
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Verify token and check admin role
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return false;
  }

  // Check if user has admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'admin';
}

/**
 * Log audit entry
 */
async function logAudit(
  operation: string,
  userId: string | null,
  metadata: any,
  success: boolean,
  error?: string
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  await supabase.from('ops_audit_log').insert({
    operation,
    operation_type: 'knowledge_ingestion',
    user_id: userId,
    metadata,
    success,
    error_message: error,
  });
}

export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const admin = await isAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const { 
      sourcePaths, 
      sourceTypes, 
      forceReindex = false 
    } = body;

    // Get repository base path
    const basePath = path.resolve(process.cwd());

    console.log('Starting knowledge ingestion...');
    console.log('Base path:', basePath);
    console.log('Force reindex:', forceReindex);

    // Run ingestion
    const result = await ingestKnowledge(basePath, {
      sourcePaths,
      sourceTypes,
      forceReindex,
    });

    // Log audit
    await logAudit(
      'ingest',
      null, // TODO: Extract user ID from token
      {
        source_paths: sourcePaths,
        source_types: sourceTypes,
        force_reindex: forceReindex,
      },
      result.success,
      result.errors.length > 0 ? result.errors.join('; ') : undefined
    );

    return NextResponse.json({
      success: result.success,
      message: `Ingestion complete: ${result.ingested} ingested, ${result.updated} updated, ${result.skipped} skipped`,
      details: {
        ingested: result.ingested,
        updated: result.updated,
        skipped: result.skipped,
        errors: result.errors,
      },
    });
  } catch (error: any) {
    console.error('Ingestion error:', error);

    // Log audit
    await logAudit(
      'ingest',
      null,
      {},
      false,
      error.message
    );

    return NextResponse.json(
      { 
        error: 'Ingestion failed', 
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// Health check
export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  const status = {
    ready: !!(supabaseUrl && supabaseServiceKey && openaiKey),
    config: {
      supabase: !!supabaseUrl,
      serviceKey: !!supabaseServiceKey,
      openai: !!openaiKey,
      embeddings_provider: process.env.OPS_EMBEDDINGS_PROVIDER || 'openai',
      embeddings_model: process.env.OPS_EMBEDDINGS_MODEL || 'text-embedding-3-large',
    },
  };

  return NextResponse.json(status);
}
