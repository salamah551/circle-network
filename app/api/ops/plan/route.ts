/**
 * API Endpoint: POST /api/ops/plan
 * Generates infrastructure change plans
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SupabaseConnector } from '@/ops/connectors/supabase';
import { StorageConnector } from '@/ops/connectors/storage';
import { VercelConnector } from '@/ops/connectors/vercel';
import { StripeConnector } from '@/ops/connectors/stripe';
import yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

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

/**
 * Load desired state configuration
 */
function loadDesiredState(): any {
  const configPath = path.join(process.cwd(), 'ops', 'config', 'desired_state.yaml');
  const fileContents = fs.readFileSync(configPath, 'utf8');
  return yaml.load(fileContents);
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
    const body = await request.json().catch(() => ({}));
    const { 
      connectors = ['supabase', 'storage', 'vercel', 'stripe'],
      saveToDatabase = true
    } = body;

    // Load desired state
    const desiredState = loadDesiredState();

    console.log('Generating plan for connectors:', connectors);

    // Run plan for each connector
    const plans = [];

    if (connectors.includes('supabase')) {
      const connector = new SupabaseConnector({});
      const plan = await connector.plan(desiredState);
      plans.push(plan);
    }

    if (connectors.includes('storage')) {
      const connector = new StorageConnector({});
      const plan = await connector.plan(desiredState);
      plans.push(plan);
    }

    if (connectors.includes('vercel')) {
      const connector = new VercelConnector({});
      const plan = await connector.plan(desiredState);
      plans.push(plan);
    }

    if (connectors.includes('stripe')) {
      const connector = new StripeConnector({});
      const plan = await connector.plan(desiredState);
      plans.push(plan);
    }

    // Combine all diffs
    const allDiffs = plans.flatMap(p => p.diffs);
    const requiresApproval = plans.some(p => p.requiresApproval);

    // Save to database if requested
    let planId = null;
    if (saveToDatabase) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data: savedPlan, error } = await supabase
        .from('ops_plans')
        .insert({
          title: `Infrastructure Plan - ${new Date().toISOString()}`,
          description: `Generated plan for ${connectors.join(', ')}`,
          plan_type: 'multi_connector',
          desired_state: desiredState,
          diff: allDiffs,
          status: requiresApproval ? 'pending' : 'approved',
          created_by: userId,
        })
        .select()
        .single();

      if (!error && savedPlan) {
        planId = savedPlan.id;
      }
    }

    return NextResponse.json({
      success: true,
      plan_id: planId,
      requires_approval: requiresApproval,
      summary: {
        total_changes: allDiffs.length,
        by_type: {
          create: allDiffs.filter(d => d.type === 'create').length,
          update: allDiffs.filter(d => d.type === 'update').length,
          delete: allDiffs.filter(d => d.type === 'delete').length,
        },
        by_risk: {
          high: allDiffs.filter(d => d.risk === 'high').length,
          medium: allDiffs.filter(d => d.risk === 'medium').length,
          low: allDiffs.filter(d => d.risk === 'low').length,
        },
      },
      plans,
    });
  } catch (error: any) {
    console.error('Plan generation error:', error);

    return NextResponse.json(
      { 
        error: 'Failed to generate plan', 
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// Get existing plans
export async function GET(request: NextRequest) {
  try {
    const { isAdmin: admin } = await isAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: plans, error } = await supabase
      .from('ops_plans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    return NextResponse.json({ plans });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch plans', message: error.message },
      { status: 500 }
    );
  }
}
