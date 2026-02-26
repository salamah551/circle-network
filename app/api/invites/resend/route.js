// app/api/invites/resend/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';



export async function POST(request) {
  // Initialize at runtime
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  try {
    const { inviteId, email, firstName, lastName, inviteCode, invitedBy } = await request.json();

    if (!inviteId || !email || !inviteCode) {
      return NextResponse.json(
        { error: 'Invite ID, email, and invite code are required' },
        { status: 400 }
      );
    }

    // Verify the caller is authenticated and owns this invite
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            try { cookieStore.set(name, value, options); } catch {}
          },
          remove(name, options) {
            try { cookieStore.set(name, '', { ...options, maxAge: 0 }); } catch {}
          },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (invitedBy && user.id !== invitedBy) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get inviter's profile
    const { data: inviterProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', invitedBy)
      .single();

    // Send invite email via SendGrid using the EXISTING invite code
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/accept?email=${encodeURIComponent(email)}&code=${inviteCode}`;
    
    const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: email }],
          subject: `Reminder: You're invited to join The Circle`
        }],
        from: {
          email: 'invite@thecirclenetwork.org',
          name: 'The Circle Network'
        },
        content: [{
          type: 'text/html',
          value: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { text-align: center; padding: 30px 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 10px; }
                .button { display: inline-block; padding: 15px 30px; background: #F59E0B; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
                .code { background: #fff; padding: 15px; border: 2px dashed #F59E0B; border-radius: 8px; font-family: monospace; font-size: 20px; text-align: center; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="color: #D4AF37;">The Circle</h1>
                  <p style="color: #666;">Reminder: Your Invitation is Waiting</p>
                </div>
                <div class="content">
                  <p>Hi ${firstName || 'there'},</p>
                  <p>Just a friendly reminder that <strong>${inviterProfile?.full_name || 'A founding member'}</strong> invited you to join <strong>The Circle</strong>.</p>
                  
                  <p><strong>What you'll get:</strong></p>
                  <ul>
                    <li>✅ Skip the vetting process</li>
                    <li>✅ Lock in founding member rate: $199/mo forever</li>
                    <li>✅ Connect with vetted, active founders</li>
                    <li>✅ Get intros, advice, and partnerships that actually happen</li>
                  </ul>

                  <p><strong>Your exclusive invite code:</strong></p>
                  <div class="code">${inviteCode}</div>

                  <div style="text-align: center;">
                    <a href="${inviteUrl}" class="button">Accept Invitation</a>
                  </div>

                  <p style="color: #666; font-size: 14px;">This invite expires soon. First 500 founding members only.</p>
                </div>
                <div class="footer">
                  <p>The Circle Network<br>
                  <a href="https://thecirclenetwork.org">thecirclenetwork.org</a></p>
                </div>
              </div>
            </body>
            </html>
          `
        }]
      })
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error('SendGrid error:', errorData);
      return NextResponse.json(
        { error: 'Failed to send invite email', details: errorData },
        { status: 500 }
      );
    }

    // Update the invite's last sent timestamp (optional)
    await supabaseAdmin
      .from('invites')
      .update({ 
        updated_at: new Date().toISOString() 
      })
      .eq('id', inviteId);

    return NextResponse.json({
      success: true,
      message: 'Invite resent successfully'
    });

  } catch (error) {
    console.error('Resend invite error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}