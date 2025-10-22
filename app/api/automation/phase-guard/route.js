import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { runPhaseGuard } from '@/lib/phase-guard';

/**
 * Phase Guard Automation Endpoint
 * 
 * Checks current phase and applies any necessary campaign transitions.
 * Can be called manually or by internal systems.
 * Idempotent: safe to call multiple times.
 * 
 * GET /api/automation/phase-guard
 * 
 * Returns:
 * {
 *   phase: 'founding' | 'premium' | 'elite',
 *   founders: { total, cap, remaining },
 *   tierTotals: { founding, premium, elite },
 *   actions: {
 *     pausedCampaignIds: [],
 *     pausedCampaigns: [{ id, name }],
 *     activatedCampaignIds: [],
 *     activatedCampaigns: [{ id, name }]
 *   },
 *   timestamp: ISO string
 * }
 */
export async function GET(request) {
  try {
    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Run phase guard
    const result = await runPhaseGuard(supabaseAdmin);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Phase guard endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
