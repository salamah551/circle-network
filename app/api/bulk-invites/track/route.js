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

    // Record tracking event
    await supabaseAdmin
      .from('email_tracking')
      .insert({
        recipient_id: recipientId,
        event_type: eventType,
        event_data: { user_agent: request.headers.get('user-agent') }
      });

    // Update recipient status
    if (eventType === 'open') {
      await supabaseAdmin
        .from('bulk_invite_recipients')
        .update({ 
          status: 'opened',
          opened_at: new Date().toISOString()
        })
        .eq('id', recipientId)
        .is('opened_at', null);

      // Update campaign stats
      const { data: recipient } = await supabaseAdmin
        .from('bulk_invite_recipients')
        .select('campaign_id')
        .eq('id', recipientId)
        .single();

      if (recipient) {
        await supabaseAdmin.rpc('increment_campaign_opens', {
          campaign_id: recipient.campaign_id
        });
      }
    } else if (eventType === 'click') {
      await supabaseAdmin
        .from('bulk_invite_recipients')
        .update({ 
          status: 'clicked',
          clicked_at: new Date().toISOString()
        })
        .eq('id', recipientId);
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
