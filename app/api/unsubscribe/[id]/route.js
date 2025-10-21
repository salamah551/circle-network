export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';


export async function GET(request, { params }) {
  // Initialize at runtime
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  try {
    const recipientId = params.id;

    // Look up recipient in bulk_invites table
    const { data: recipient, error: lookupError } = await supabaseAdmin
      .from('bulk_invites')
      .select('id, email, campaign_id')
      .eq('id', recipientId)
      .single();

    if (lookupError || !recipient) {
      console.error('Recipient not found:', lookupError);
      // Still show unsubscribe confirmation even if not found
    } else {
      // Record unsubscribe event in bulk_invite_events
      await supabaseAdmin
        .from('bulk_invite_events')
        .insert({
          invite_id: recipientId,
          event: 'unsubscribed',
          details: { 
            email: recipient.email,
            timestamp: new Date().toISOString()
          }
        });

      // Add to bulk_invite_suppressions table
      await supabaseAdmin
        .from('bulk_invite_suppressions')
        .upsert(
          {
            email: recipient.email.toLowerCase(),
            reason: 'unsubscribed'
          },
          { onConflict: 'email' }
        );

      // Update recipient status in bulk_invites (idempotent)
      await supabaseAdmin
        .from('bulk_invites')
        .update({
          status: 'unsubscribed',
          unsubscribed_at: new Date().toISOString()
        })
        .eq('id', recipientId);

      // Also add to global unsubscribes table for cross-campaign suppression
      await supabaseAdmin
        .from('unsubscribes')
        .upsert(
          {
            email: recipient.email.toLowerCase(),
            reason: 'unsubscribed',
            unsubscribed_at: new Date().toISOString()
          },
          { onConflict: 'email' }
        );
    }

    // Return simple HTML page
    return new NextResponse(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribed</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      background: #000;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 500px;
      text-align: center;
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 12px;
      padding: 40px;
    }
    h1 { color: #10b981; margin-bottom: 16px; }
    p { color: #d1d5db; line-height: 1.6; margin-bottom: 24px; }
    a { color: #F59E0B; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <h1>You've Been Unsubscribed</h1>
    <p>You won't receive any more emails from The Circle about this invitation.</p>
    <p>Changed your mind? <a href="${process.env.NEXT_PUBLIC_APP_URL}">Visit our website</a></p>
  </div>
</body>
</html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }

}
