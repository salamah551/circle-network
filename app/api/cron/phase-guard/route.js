import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { runPhaseGuard } from '@/lib/phase-guard';

/**
 * Phase Guard Cron Endpoint
 * 
 * Scheduled endpoint for Vercel Cron to check phase and apply transitions.
 * Requires CRON_SECRET for authentication.
 * 
 * GET /api/cron/phase-guard
 * Header: Authorization: Bearer <CRON_SECRET>
 * 
 * Vercel Cron configuration (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/phase-guard",
 *     "schedule": "0 * /6 * * *"
 *   }]
 * }
 */
export async function GET(request) {
  try {
    // Verify CRON_SECRET
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('CRON_SECRET not configured');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Check authorization header
    const providedSecret = authHeader?.replace('Bearer ', '');
    if (providedSecret !== cronSecret) {
      console.error('Invalid CRON_SECRET provided');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Run phase guard
    const result = await runPhaseGuard(supabaseAdmin);

    // Log for monitoring
    console.log(`[CRON] Phase guard executed: phase=${result.phase}, founders=${result.founders.total}/${result.founders.cap}`);
    if (result.actions.pausedCampaigns.length > 0) {
      console.log(`[CRON] Paused campaigns: ${result.actions.pausedCampaigns.map(c => c.name).join(', ')}`);
    }
    if (result.actions.activatedCampaigns.length > 0) {
      console.log(`[CRON] Activated campaigns: ${result.actions.activatedCampaigns.map(c => c.name).join(', ')}`);
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('[CRON] Phase guard error:', error);
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
