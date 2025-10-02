import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request) {
  try {
    const { email, invitedBy } = await request.json();

    if (!email || !invitedBy) {
      return NextResponse.json(
        { error: 'Email and invitedBy are required' },
        { status: 400 }
      );
    }

    // Get inviter's profile
    const { data: inviterProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', invitedBy)
      .single();

    // Generate unique invite code
    const inviteCode = `FOUNDING-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create invite in database
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('invites')
      .insert({
        code: inviteCode,
        email: email.toLowerCase(),
        invited_by: invitedBy,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Invite creation error:', inviteError);
      return NextResponse.json(
        { error: 'Failed to create invite' },
        { status: 500 }
      );
    }

    // Send invite email via SendGrid
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}?email=${encodeURIComponent(email)}&code=${inviteCode}`;
    
    const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: email }],
          subject: `You're invited to join The Circle`
        }],
        from: {
          email: 'noreply@thecirclenetwork.org',
          name: 'The Circle'
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
                .logo { width: 60px; height: 60px; }
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
                  <p style="color: #666;">You've Been Invited</p>
                </div>
                <div class="content">
                  <p>Hi there,</p>
                  <p><strong>${inviterProfile?.full_name || 'A founding member'}</strong> has invited you to join <strong>The Circle</strong> - an exclusive network of 1,000 ambitious founders.</p>
                  
                  <p><strong>What makes this special:</strong></p>
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

                  <p style="color: #666; font-size: 14px;">This invite expires in 7 days. First 1,000 members only.</p>
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
        { error: 'Failed to send invite email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Invite sent successfully',
      inviteCode: inviteCode
    });

  } catch (error) {
    console.error('Send invite error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
