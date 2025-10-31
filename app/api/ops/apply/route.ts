/**
 * API Endpoint: POST /api/ops/apply
 * Applies infrastructure changes from a plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SupabaseConnector } from '@/ops/connectors/supabase';
import { StorageConnector } from '@/ops/connectors/storage';
import { VercelConnector } from '@/ops/connectors/vercel';
import { StripeConnector } from '@/ops/connectors/stripe';

/**
 * Verify admin access
 */
async function isAdmin(request: NextRequest): Promise<{ isAdmin: boolean; userId?: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { isAdmin: false };
  }

  const token = authHeader.substring(7);
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return { isAdmin: false };
  }

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
    const { plan_id, force = false } = body;

    if (!plan_id) {
      return NextResponse.json(
        { error: 'plan_id is required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch plan from database
    const { data: plan, error: fetchError } = await supabase
      .from('ops_plans')
      .select('*')
      .eq('id', plan_id)
      .single();

    if (fetchError || !plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Check if plan requires approval
    if (plan.status === 'pending' && !force) {
      return NextResponse.json(
        { 
          error: 'Plan requires approval',
          message: 'Set force=true to apply without approval (dangerous)'
        },
        { status: 403 }
      );
    }

    // Check if plan is already applied
    if (plan.status === 'applied') {
      return NextResponse.json(
        { 
          error: 'Plan already applied',
          applied_at: plan.applied_at
        },
        { status: 400 }
      );
    }

    console.log(`Applying plan ${plan_id}...`);

    // Apply changes using appropriate connectors
    const results = [];

    // Group diffs by connector
    const diffsByConnector: Record<string, any[]> = {};
    for (const diff of plan.diff || []) {
      const connector = getConnectorFromResource(diff.resource);
      if (!diffsByConnector[connector]) {
        diffsByConnector[connector] = [];
      }
      diffsByConnector[connector].push(diff);
    }

    // Apply changes for each connector
    for (const [connectorName, diffs] of Object.entries(diffsByConnector)) {
      let connector;
      let connectorPlan;

      switch (connectorName) {
        case 'supabase':
          connector = new SupabaseConnector({});
          connectorPlan = { connector: 'supabase', diffs, summary: '', requiresApproval: false };
          break;
        case 'storage':
          connector = new StorageConnector({});
          connectorPlan = { connector: 'storage', diffs, summary: '', requiresApproval: false };
          break;
        case 'vercel':
          connector = new VercelConnector({});
          connectorPlan = { connector: 'vercel', diffs, summary: '', requiresApproval: false };
          break;
        case 'stripe':
          connector = new StripeConnector({});
          connectorPlan = { connector: 'stripe', diffs, summary: '', requiresApproval: false };
          break;
        default:
          continue;
      }

      const result = await connector.apply(connectorPlan);
      results.push({
        connector: connectorName,
        ...result,
      });
    }

    // Update plan status
    const overallSuccess = results.every(r => r.success);
    const { error: updateError } = await supabase
      .from('ops_plans')
      .update({
        status: overallSuccess ? 'applied' : 'failed',
        applied_at: new Date().toISOString(),
        approved_by: userId,
        error_message: overallSuccess ? null : 'Some changes failed to apply',
      })
      .eq('id', plan_id);

    if (updateError) {
      console.error('Failed to update plan status:', updateError);
    }

    return NextResponse.json({
      success: overallSuccess,
      plan_id,
      results,
      summary: {
        total_applied: results.reduce((sum, r) => sum + r.applied, 0),
        total_failed: results.reduce((sum, r) => sum + r.failed, 0),
      },
    });
  } catch (error: any) {
    console.error('Apply error:', error);

    return NextResponse.json(
      { 
        error: 'Failed to apply plan', 
        message: error.message 
      },
      { status: 500 }
    );
  }
}

function getConnectorFromResource(resource: string): string {
  if (resource.startsWith('table:') || resource.startsWith('policy:')) {
    return 'supabase';
  }
  if (resource.startsWith('bucket:')) {
    return 'storage';
  }
  if (resource.startsWith('env:') || resource.startsWith('cron:')) {
    return 'vercel';
  }
  if (resource.startsWith('product:') || resource.startsWith('price:') || resource.startsWith('webhook:')) {
    return 'stripe';
  }
  return 'unknown';
}
