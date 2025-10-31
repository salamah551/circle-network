// app/api/ops/audit/route.js
// GET /api/ops/audit - Audit infrastructure against desired state

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

import { auditAll, generateChangePlan } from '@/lib/ops/audit';

/**
 * GET /api/ops/audit?scope=all|supabase|vercel|stripe&mode=plan|apply
 * 
 * Audit infrastructure and return plan or apply changes
 * 
 * Query parameters:
 * - scope: all (default), supabase, vercel, stripe
 * - mode: plan (default), apply
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
    
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || 'all';
    const mode = searchParams.get('mode') || 'plan';
    
    // Validate scope
    if (!['all', 'supabase', 'vercel', 'stripe'].includes(scope)) {
      return Response.json(
        { error: 'Invalid scope. Must be: all, supabase, vercel, or stripe' },
        { status: 400 }
      );
    }
    
    // Validate mode
    if (!['plan', 'apply'].includes(mode)) {
      return Response.json(
        { error: 'Invalid mode. Must be: plan or apply' },
        { status: 400 }
      );
    }
    
    console.log(`Running audit: scope=${scope}, mode=${mode}`);
    
    // Run audit
    const auditResults = await auditAll(scope);
    
    // Generate change plan
    const changePlan = generateChangePlan(auditResults.changes, mode);
    
    // Build response
    const response = {
      success: true,
      mode,
      scope,
      timestamp: auditResults.timestamp,
      summary: {
        total_changes: auditResults.total_changes,
        by_severity: auditResults.by_severity,
        by_scope: auditResults.by_scope,
        requires_approval: changePlan.filter(c => c.requires_approval).length,
        can_auto_apply: changePlan.filter(c => c.can_auto_apply).length
      },
      changes: changePlan.map(change => ({
        id: change.id,
        type: change.type,
        scope: change.scope,
        severity: change.severity,
        description: change.description,
        risk_level: change.risk_level,
        requires_approval: change.requires_approval,
        recommended_action: change.recommended_action,
        can_auto_apply: change.can_auto_apply,
        desired: change.desired,
        current: change.current
      }))
    };
    
    // Add guidance based on mode
    if (mode === 'plan') {
      response.next_steps = {
        message: 'Review the changes above. To apply changes, use POST /api/ops/apply with selected change IDs.',
        apply_endpoint: '/api/ops/apply',
        example_payload: {
          changeIds: changePlan.slice(0, 2).map(c => c.id),
          options: {
            generatePR: true,
            directApply: false
          }
        }
      };
    }
    
    return Response.json(response);
    
  } catch (error) {
    console.error('Error in /api/ops/audit:', error);
    return Response.json(
      { 
        error: 'Audit failed',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ops/audit
 * 
 * Trigger audit with custom parameters
 */
export async function POST(request) {
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
    
    const body = await request.json();
    const { scope = 'all', mode = 'plan', filters = {} } = body;
    
    // Run audit
    const auditResults = await auditAll(scope);
    
    // Apply filters if provided
    let filteredChanges = auditResults.changes;
    
    if (filters.severity) {
      filteredChanges = filteredChanges.filter(c => 
        filters.severity.includes(c.severity)
      );
    }
    
    if (filters.type) {
      filteredChanges = filteredChanges.filter(c => 
        filters.type.includes(c.type)
      );
    }
    
    // Generate change plan
    const changePlan = generateChangePlan(filteredChanges, mode);
    
    return Response.json({
      success: true,
      mode,
      scope,
      filters_applied: Object.keys(filters).length > 0,
      timestamp: auditResults.timestamp,
      summary: {
        total_changes: filteredChanges.length,
        by_severity: {
          high: filteredChanges.filter(c => c.severity === 'high').length,
          medium: filteredChanges.filter(c => c.severity === 'medium').length,
          low: filteredChanges.filter(c => c.severity === 'low').length
        }
      },
      changes: changePlan
    });
    
  } catch (error) {
    console.error('Error in POST /api/ops/audit:', error);
    return Response.json(
      { 
        error: 'Audit failed',
        message: error.message
      },
      { status: 500 }
    );
  }
}
