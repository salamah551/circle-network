import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * Campaign Summary Cron Job (Daily)
 * Generates daily summary of all active campaigns
 * Called daily by Vercel Cron or can be triggered manually with CRON_SECRET
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
      console.error('❌ Unauthorized campaign-summary cron access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Campaign summary cron job started at', new Date().toISOString());

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Get all campaigns (active and inactive)
    const { data: campaigns, error: campaignsError } = await supabaseAdmin
      .from('bulk_invite_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (campaignsError) {
      console.error('Error fetching campaigns:', campaignsError);
      return NextResponse.json(
        { error: 'Failed to fetch campaigns', details: campaignsError.message },
        { status: 500 }
      );
    }

    const summary = {
      timestamp: new Date().toISOString(),
      totalCampaigns: campaigns?.length || 0,
      activeCampaigns: 0,
      campaigns: []
    };

    if (campaigns && campaigns.length > 0) {
      for (const campaign of campaigns) {
        if (campaign.status === 'active') {
          summary.activeCampaigns++;
        }

        // Calculate metrics
        const openRate = campaign.total_sent > 0 
          ? ((campaign.total_opened || 0) / campaign.total_sent * 100).toFixed(1)
          : '0.0';
        
        const clickRate = campaign.total_sent > 0
          ? ((campaign.total_clicked || 0) / campaign.total_sent * 100).toFixed(1)
          : '0.0';
        
        const conversionRate = campaign.total_sent > 0
          ? ((campaign.total_converted || 0) / campaign.total_sent * 100).toFixed(1)
          : '0.0';

        summary.campaigns.push({
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          totalSent: campaign.total_sent || 0,
          totalOpened: campaign.total_opened || 0,
          totalClicked: campaign.total_clicked || 0,
          totalConverted: campaign.total_converted || 0,
          openRate: `${openRate}%`,
          clickRate: `${clickRate}%`,
          conversionRate: `${conversionRate}%`,
          lastSentAt: campaign.last_sent_at,
          dailyLimit: campaign.daily_limit
        });

        console.log(`📊 Campaign: ${campaign.name}`);
        console.log(`   Status: ${campaign.status}`);
        console.log(`   Sent: ${campaign.total_sent || 0} | Opened: ${campaign.total_opened || 0} (${openRate}%)`);
        console.log(`   Clicked: ${campaign.total_clicked || 0} (${clickRate}%) | Converted: ${campaign.total_converted || 0} (${conversionRate}%)`);
      }
    } else {
      console.log('No campaigns found');
    }

    console.log('✅ Campaign summary cron job completed');
    console.log(`📊 Total: ${summary.totalCampaigns} campaigns (${summary.activeCampaigns} active)`);

    return NextResponse.json({
      success: true,
      summary
    });

  } catch (error) {
    console.error('❌ Campaign summary cron error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
