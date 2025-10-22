import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCurrentLaunchPhase } from '@/lib/launch-phase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * Phase Guard Cron Job (Hourly)
 * Monitors launch phase transitions and performs necessary actions
 * Called hourly by Vercel Cron or can be triggered manually with CRON_SECRET
 */
export async function GET(request) {
  try {
    // Security: Verify cron secret OR x-vercel-cron header
    const authHeader = request.headers.get('authorization');
    const vercelCron = request.headers.get('x-vercel-cron');
    const cronSecret = process.env.CRON_SECRET;
    
    // Accept either CRON_SECRET or x-vercel-cron header
    const isAuthorized = (authHeader === `Bearer ${cronSecret}`) || (vercelCron === '1');
    
    if (!isAuthorized) {
      console.error('❌ Unauthorized phase-guard cron access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Phase guard cron job started at', new Date().toISOString());

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Get current launch phase
    const launchPhase = await getCurrentLaunchPhase(supabaseAdmin);
    
    console.log(`📊 Current phase: ${launchPhase.phase}`);
    console.log(`📊 Founding members: ${launchPhase.foundingMemberCount}/50`);
    console.log(`📊 Days until launch: ${launchPhase.daysUntilLaunch}`);

    const actions = [];

    // Check if founding member cap has been reached
    if (launchPhase.phase === 'founding' && launchPhase.foundingMemberCount >= 50) {
      console.log('⚠️ Founding member cap reached (50/50)');
      actions.push('Founding member cap reached');
      
      // Here you could add logic to:
      // - Notify admin
      // - Update pricing tier
      // - Trigger email campaigns
      // - Update UI flags
    }

    // Check if launch date is approaching (within 7 days)
    if (launchPhase.daysUntilLaunch <= 7 && launchPhase.daysUntilLaunch > 0) {
      console.log(`⏰ Launch approaching in ${launchPhase.daysUntilLaunch} days`);
      actions.push(`Launch in ${launchPhase.daysUntilLaunch} days`);
    }

    // Check if launch date has passed
    if (launchPhase.phase === 'launched') {
      console.log('🚀 Platform has launched');
      actions.push('Platform launched');
    }

    console.log('✅ Phase guard cron job completed');

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      phase: launchPhase.phase,
      foundingMemberCount: launchPhase.foundingMemberCount,
      daysUntilLaunch: launchPhase.daysUntilLaunch,
      actions: actions.length > 0 ? actions : ['No actions required']
    });

  } catch (error) {
    console.error('❌ Phase guard cron error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
