// app/api/ops/ingest/route.js
// POST /api/ops/ingest - Ingest repository knowledge into ops_knowledge table

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for ingestion

import { ingestAll } from '@/lib/ops/knowledge-ingest';

/**
 * POST /api/ops/ingest
 * 
 * Ingest repository code and documentation into knowledge base
 * 
 * Request body:
 * {
 *   "mode": "full" | "incremental" | "priority",
 *   "includeCode": boolean,
 *   "includeMarkdown": boolean
 * }
 */
export async function POST(request) {
  try {
    // Check authorization (simple API key for now)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.OPS_API_TOKEN;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const {
      mode = 'priority',
      includeCode = false,
      includeMarkdown = true
    } = body;
    
    console.log(`Starting ingestion: mode=${mode}, includeCode=${includeCode}, includeMarkdown=${includeMarkdown}`);
    
    // Determine ingestion options based on mode
    const options = {
      includeCode,
      includeMarkdown,
      priorityOnly: mode === 'priority'
    };
    
    // Run ingestion
    const result = await ingestAll(options);
    
    return Response.json({
      success: true,
      mode,
      summary: {
        total: result.total,
        success: result.success,
        failed: result.failed,
        skipped: result.skipped
      },
      results: result.results.map(r => ({
        path: r.path,
        success: r.success,
        chunks: r.chunks,
        skipped: r.skipped,
        error: r.error
      })),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in /api/ops/ingest:', error);
    return Response.json(
      { 
        error: 'Ingestion failed',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ops/ingest
 * 
 * Get ingestion status and statistics
 */
export async function GET(request) {
  try {
    // Check authorization
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.OPS_API_TOKEN;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { createClient } = await import('@supabase/supabase-js');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !key) {
      return Response.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }
    
    const supabase = createClient(url, key);
    
    // Get statistics
    const { count: totalCount } = await supabase
      .from('ops_knowledge')
      .select('*', { count: 'exact', head: true });
    
    const { data: byType } = await supabase
      .from('ops_knowledge')
      .select('source_type')
      .then(res => {
        if (!res.data) return { data: {} };
        const counts = {};
        res.data.forEach(row => {
          counts[row.source_type] = (counts[row.source_type] || 0) + 1;
        });
        return { data: counts };
      });
    
    const { data: recentDocs } = await supabase
      .from('ops_knowledge')
      .select('source_path, created_at, chunk_index')
      .order('created_at', { ascending: false })
      .limit(10);
    
    return Response.json({
      success: true,
      statistics: {
        total_chunks: totalCount || 0,
        by_type: byType || {},
        recent_ingestions: recentDocs || []
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting ingestion status:', error);
    return Response.json(
      { 
        error: 'Failed to get ingestion status',
        message: error.message
      },
      { status: 500 }
    );
  }
}
