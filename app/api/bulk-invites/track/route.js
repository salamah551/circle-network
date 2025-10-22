export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';


export async function GET(request) {
  // Initialize at runtime
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  try {
    const { searchParams } = new URL(request.url);
    const recipientId = searchParams.get('rid');
    const eventType = searchParams.get('type');

    if (!recipientId || !eventType) {
      // Return 1x1 transparent pixel even on error
      return new NextResponse(
        Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
        {
          headers: {
            'Content-Type': 'image/gif',
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
    }

    // Look up recipient in bulk_invites table
    const { data: recipient, error: recipientError } = await supabaseAdmin
      .from('bulk_invites')
      .select('id, campaign_id, email, opened_at, clicked_at')
      .eq('id', recipientId)
      .single();

    if (recipientError || !recipient) {
      console.error('Recipient not found:', recipientError);
      // Still return pixel even if recipient not found
      return new NextResponse(
        Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
        {
          headers: {
            'Content-Type': 'image/gif',
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
    }

    // Record tracking event in bulk_invite_events
    await supabaseAdmin
      .from('bulk_invite_events')
      .insert({
        invite_id: recipientId,
        event: eventType,
        details: { 
          email: recipient.email,
          user_agent: request.headers.get('user-agent'),
          timestamp: new Date().toISOString()
        }
      });

    // Update recipient status idempotently
    if (eventType === 'open' && !recipient.opened_at) {
      // Only update if not already opened (idempotent)
      await supabaseAdmin
        .from('bulk_invites')
        .update({ 
          status: 'opened',
          opened_at: new Date().toISOString()
        })
        .eq('id', recipientId)
        .is('opened_at', null);

      // Update campaign stats - increment total_opened
      const { data: campaign } = await supabaseAdmin
        .from('bulk_invite_campaigns')
        .select('total_opened')
        .eq('id', recipient.campaign_id)
        .single();

      if (campaign) {
        await supabaseAdmin
          .from('bulk_invite_campaigns')
          .update({ 
            total_opened: (campaign.total_opened || 0) + 1 
          })
          .eq('id', recipient.campaign_id);
      }
    } else if (eventType === 'click' && !recipient.clicked_at) {
      // Only update if not already clicked (idempotent)
      await supabaseAdmin
        .from('bulk_invites')
        .update({ 
          status: 'clicked',
          clicked_at: new Date().toISOString()
        })
        .eq('id', recipientId)
        .is('clicked_at', null);

      // Update campaign stats - increment total_clicked
      const { data: campaign } = await supabaseAdmin
        .from('bulk_invite_campaigns')
        .select('total_clicked')
        .eq('id', recipient.campaign_id)
        .single();

      if (campaign) {
        await supabaseAdmin
          .from('bulk_invite_campaigns')
          .update({ 
            total_clicked: (campaign.total_clicked || 0) + 1 
          })
          .eq('id', recipient.campaign_id);
      }
    }

    // Return 1x1 transparent pixel
    return new NextResponse(
      Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
      {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );

  } catch (error) {
    console.error('Tracking error:', error);
    // Still return pixel on error
    return new NextResponse(
      Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
      {
        headers: {
          'Content-Type': 'image/gif'
        }
      }
    );
  }

}
