/**
 * POST /api/ops/audit
 * 
 * Runs infrastructure audits across configured services
 * 
 * Query params:
 * - scope: supabase|vercel|stripe|github|sendgrid|posthog|all (default: all)
 * - mode: plan|apply (default: plan)
 * 
 * Returns: JSON audit report with check results and suggested actions
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuditEngine } from '@/lib/ops/audit-engine';
import { loadDesiredState, loadConnectorConfig, verifyOpsSecret } from '@/lib/ops/config-loader';

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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const scopeParam = searchParams.get('scope') || 'all';
    const mode = searchParams.get('mode') || 'plan';

    // Parse scopes
    const scopes = scopeParam.split(',').map(s => s.trim());

    // Load configuration
    const desiredState = loadDesiredState();
    const connectorConfig = loadConnectorConfig();

    // Create audit engine
    const auditEngine = new AuditEngine(desiredState, connectorConfig);

    // Run audit
    const report = await auditEngine.runAudit(scopes);

    // Add mode to response
    return NextResponse.json({
      mode,
      ...report,
    });

  } catch (error: any) {
    console.error('Audit error:', error);
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
      message: 'Use POST to run audits' 
    },
    { status: 405 }
  );
}
