export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Verify SendGrid/Twilio Email Event Webhook signature
function verifySendGridSignature(publicKey, payload, signature, timestamp) {
  try {
    if (!publicKey || !signature || !timestamp) {
      return false;
    }

    // Construct verification payload: timestamp + payload
    const timestampedPayload = timestamp + payload;
    
    // Create verifier
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(timestampedPayload);
    
    // Verify signature
    return verifier.verify(publicKey, signature, 'base64');
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

export async function POST(req) {
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  try {
    // Get signature headers
    const signature = req.headers.get('x-twilio-email-event-webhook-signature');
    const timestamp = req.headers.get('x-twilio-email-event-webhook-timestamp');
    const publicKey = process.env.SENDGRID_EVENT_PUBLIC_KEY;

    // Get raw body for signature verification
    const body = await req.text();
    
    // Verify signature if public key is configured
    if (publicKey) {
      const isValid = verifySendGridSignature(publicKey, body, signature, timestamp);
      
      if (!isValid) {
        console.error('Invalid SendGrid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
      
      console.log('✅ SendGrid webhook signature verified');
    } else {
      console.warn('⚠️  SENDGRID_EVENT_PUBLIC_KEY not configured - skipping signature verification');
    }

    // Parse events
    const events = JSON.parse(body);
    const eventArray = Array.isArray(events) ? events : [events];

    for (const ev of eventArray) {
      const type = ev.event;
      const inviteId = ev?.custom_args?.invite_id || null;
      const email = (ev.email || '').toLowerCase();

      if (inviteId) {
        await supabaseAdmin.from('bulk_invite_events').insert({ invite_id: inviteId, event: type, details: { email, url: ev.url || null } });
        if (type === 'open') await supabaseAdmin.from('bulk_invites').update({ status: 'opened' }).eq('id', inviteId);
        if (type === 'click') await supabaseAdmin.from('bulk_invites').update({ status: 'clicked' }).eq('id', inviteId);
        if (type === 'bounce' || type === 'dropped' || type === 'spamreport') {
          await supabaseAdmin.from('bulk_invites').update({ status: type }).eq('id', inviteId);
          // Add to suppression list
          await supabaseAdmin.from('bulk_invite_suppressions').upsert({ email, reason: type }, { onConflict: 'email' });
          // Also add to unsubscribes table for bounce/spam
          if (type === 'bounce' || type === 'spamreport') {
            await supabaseAdmin.from('unsubscribes').upsert({ 
              email, 
              reason: type === 'bounce' ? 'bounced' : 'spam_report',
              unsubscribed_at: new Date().toISOString()
            }, { onConflict: 'email' });
          }
        }
      }
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Webhook error', e);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
