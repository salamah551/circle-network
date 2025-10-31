/**
 * POST /api/ops/apply
 * 
 * Applies infrastructure changes with approval checks
 * 
 * Request body:
 * {
 *   "changes": [
 *     {
 *       "id": "change-id",
 *       "scope": "supabase|vercel|etc",
 *       "type": "create|update|delete",
 *       "description": "Description of change",
 *       "risk": "low|medium|high|destructive",
 *       "requiresApproval": boolean,
 *       "approvalStatus": "approved|pending|rejected",
 *       "approvedBy": "user-id",
 *       "actions": [...]
 *     }
 *   ]
 * }
 * 
 * Returns: Array of apply results with success status and PR URLs
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApplyEngine } from '@/lib/ops/apply-engine';
import { loadDesiredState, loadChangePolicy, loadConnectorConfig, verifyOpsSecret } from '@/lib/ops/config-loader';
import { Change } from '@/lib/ops/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    const providedSecret = authHeader?.replace('Bearer ', '');

    if (!providedSecret || !verifyOpsSecret(providedSecret)) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing ops secret' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { changes } = body;

    if (!changes || !Array.isArray(changes)) {
      return NextResponse.json(
        { error: 'Invalid request - changes array required' },
        { status: 400 }
      );
    }

    // Validate changes
    for (const change of changes) {
      if (!change.id || !change.scope || !change.type) {
        return NextResponse.json(
          { error: 'Invalid change - id, scope, and type required' },
          { status: 400 }
        );
      }
    }

    // Load configuration
    const desiredState = loadDesiredState();
    const changePolicy = loadChangePolicy();
    const connectorConfig = loadConnectorConfig();

    // Create apply engine
    const applyEngine = new ApplyEngine(desiredState, changePolicy, connectorConfig);

    // Apply changes
    const results = await applyEngine.applyChanges(changes as Change[]);

    // Return results
    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: results.length,
        succeeded: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      },
    });

  } catch (error: any) {
    console.error('Apply error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      error: 'Method not allowed',
      message: 'Use POST to apply changes' 
    },
    { status: 405 }
  );
}
