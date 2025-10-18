export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sgMail from '@sendgrid/mail';

// Validate API key exists
if (!process.env.SENDGRID_API_KEY) {
  console.error('❌ SENDGRID_API_KEY is not set in environment variables');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'shehab@thecirclenetwork.org';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Shehab Salamah';
const REPLY_TO_EMAIL = process.env.SENDGRID_REPLY_TO_EMAIL || 'invite@thecirclenetwork.org';

function htmlForInvite({ invite, appUrl }) {
  const link = `${appUrl}/?invite=${invite.code || ''}&iid=${invite.id}`;
  const firstName = invite.full_name ? invite.full_name.split(' ')[0] : 'there';
  
  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:20px;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1a1a1a 0%,#000 100%);color:white;padding:32px 28px;text-align:center;">
      <div style="width:48px;height:48px;background:linear-gradient(135deg,#E5C77E,#D4AF37);border-radius:12px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;">
        👑
      </div>
      <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Circle Network</h1>
      <p style="margin:0;opacity:0.8;font-size:14px;">Invitation-only • 250 Founding Members • Launching Dec 1, 2025</p>
    </div>

    <!-- Main Content -->
    <div style="padding:32px 28px;">
      
      <p style="margin:0 0 24px 0;font-size:16px;line-height:1.6;color:#333;">Hi ${firstName},</p>
      
      <p style="margin:0 0 24px 0;font-size:16px;line-height:1.6;color:#333;">
        You've been personally selected to join <strong>Circle Network</strong>—an invitation-only community of 250 accomplished professionals who are transforming how high-achievers connect and do business.
      </p>

      <p style="margin:0 0 24px 0;font-size:16px;line-height:1.6;color:#333;">
        You're receiving this because you're among a highly selective group being invited to join during our <strong>founding member phase</strong>.
      </p>

      <p style="margin:0 0 32px 0;font-size:16px;line-height:1.6;color:#333;">
        This isn't another LinkedIn group or networking event. This is something different.
      </p>

      <!-- What is Circle Network -->
      <div style="background:#f8f9fa;border-left:4px solid #D4AF37;padding:20px;margin:0 0 24px 0;border-radius:4px;">
        <h2 style="margin:0 0 16px 0;font-size:18px;font-weight:700;color:#1a1a1a;">WHAT IS CIRCLE NETWORK?</h2>
        <p style="margin:0 0 12px 0;font-size:15px;line-height:1.6;color:#333;">
          Circle Network is a private platform where accomplished professionals leverage AI-powered tools to:
        </p>
        <ul style="margin:0;padding:0 0 0 20px;">
          <li style="margin:0 0 8px 0;font-size:15px;line-height:1.6;color:#333;">Get matched with <strong>3 high-value connections every week</strong></li>
          <li style="margin:0 0 8px 0;font-size:15px;line-height:1.6;color:#333;">Receive <strong>real-time deal flow alerts</strong> tailored to your investment criteria</li>
          <li style="margin:0 0 8px 0;font-size:15px;line-height:1.6;color:#333;">Protect your reputation with <strong>AI-powered monitoring</strong> and threat detection</li>
          <li style="margin:0 0 8px 0;font-size:15px;line-height:1.6;color:#333;">Gain <strong>competitive intelligence</strong> on market trends and opportunities</li>
        </ul>
        <p style="margin:16px 0 0 0;font-size:14px;line-height:1.6;color:#666;font-style:italic;">
          Think of it as your personal intelligence network—powered by AI, curated by humans.
        </p>
      </div>

      <!-- Core Features -->
      <div style="margin:0 0 24px 0;">
        <h2 style="margin:0 0 16px 0;font-size:18px;font-weight:700;color:#1a1a1a;">CORE FEATURES</h2>
        
        <div style="margin:0 0 16px 0;">
          <p style="margin:0 0 4px 0;font-size:15px;font-weight:700;color:#1a1a1a;">🤝 AI-Powered Strategic Introductions</p>
          <p style="margin:0;font-size:14px;line-height:1.5;color:#666;">
            Our algorithm analyzes your goals, expertise, and needs to recommend 3 high-value connections every week. Accept an intro, and we facilitate the email introduction automatically. No cold outreach. No awkward asks. Just warm, curated connections.
          </p>
        </div>

        <div style="margin:0 0 16px 0;">
          <p style="margin:0 0 4px 0;font-size:15px;font-weight:700;color:#1a1a1a;">💼 AI Deal Flow Alerts <span style="font-size:11px;background:#8B5CF6;color:white;padding:2px 6px;border-radius:3px;font-weight:600;">ELITE • Q1 2026</span></p>
          <p style="margin:0;font-size:14px;line-height:1.5;color:#666;">
            Set your investment criteria—industry, deal size, stage, geography—and our AI monitors the network and external sources to surface opportunities that match. Get notified the moment a relevant deal emerges, before it hits the broader market.
          </p>
        </div>

        <div style="margin:0 0 16px 0;">
          <p style="margin:0 0 4px 0;font-size:15px;font-weight:700;color:#1a1a1a;">🛡️ Reputation Guardian <span style="font-size:11px;background:#8B5CF6;color:white;padding:2px 6px;border-radius:3px;font-weight:600;">ELITE • Q1 2026</span></p>
          <p style="margin:0;font-size:14px;line-height:1.5;color:#666;">
            Your reputation is your most valuable asset. Our AI continuously monitors mentions of you and your company across social media, news, and forums. Get instant alerts about potential threats, negative sentiment, or emerging issues—so you can respond before they escalate.
          </p>
        </div>

        <div style="margin:0;">
          <p style="margin:0 0 4px 0;font-size:15px;font-weight:700;color:#1a1a1a;">📊 AI Competitive Intelligence <span style="font-size:11px;background:#8B5CF6;color:white;padding:2px 6px;border-radius:3px;font-weight:600;">ELITE • Q1 2026</span></p>
          <p style="margin:0;font-size:14px;line-height:1.5;color:#666;">
            Stay ahead of your competition. Our AI tracks market trends, competitor moves, funding announcements, and strategic shifts in your industry. Receive weekly intelligence reports with actionable insights you won't find anywhere else.
          </p>
        </div>
      </div>

      <!-- Founding Member Benefits -->
      <div style="background:linear-gradient(135deg,#1a1a1a 0%,#000 100%);color:white;padding:24px;margin:0 0 24px 0;border-radius:8px;">
        <h2 style="margin:0 0 16px 0;font-size:18px;font-weight:700;color:#D4AF37;">WHAT YOU GET AS A FOUNDING MEMBER</h2>
        <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;opacity:0.95;">
          You're being invited during our founding member phase, which means:
        </p>
        <ul style="margin:0 0 16px 0;padding:0 0 0 20px;">
          <li style="margin:0 0 12px 0;font-size:15px;line-height:1.5;"><strong>✓ Lifetime Founding Member Status</strong><br/>Lock in $2,497/year forever (regular pricing will be $4,997+ after January 15, 2026)</li>
          <li style="margin:0 0 12px 0;font-size:15px;line-height:1.5;"><strong>✓ ALL Elite AI Features INCLUDED—Forever</strong><br/>While future Premium members must pay $4,997-$8,994 to access AI features, you get them all at no additional cost:<br/>• AI Deal Flow Alerts (Value: $1,997/year)<br/>• Reputation Guardian (Value: $1,497/year)<br/>• AI Competitive Intelligence (Value: $1,497/year)<br/><span style="color:#D4AF37;">Total AI Features Value: $4,991/year—INCLUDED in your $2,497 membership</span></li>
          <li style="margin:0 0 12px 0;font-size:15px;line-height:1.5;"><strong>✓ Founding Member Badge</strong><br/>Displayed on your profile, showing you were part of the original 250</li>
          <li style="margin:0 0 12px 0;font-size:15px;line-height:1.5;"><strong>✓ Direct Input on Development</strong><br/>Shape the platform's future through exclusive founder surveys and feedback sessions</li>
          <li style="margin:0;font-size:15px;line-height:1.5;"><strong>✓ Unlimited Access to All Core Features</strong><br/>Strategic Intros, Member Directory, Private Messaging, and more—no paywalls, no limits</li>
        </ul>
      </div>

      <!-- Invitation Code -->
      <div style="background:#FEF3C7;border:2px solid #D4AF37;padding:20px;margin:0 0 24px 0;border-radius:8px;text-align:center;">
        <p style="margin:0 0 8px 0;font-size:14px;font-weight:600;color:#92400E;">YOUR INVITATION CODE</p>
        <p style="margin:0 0 16px 0;font-size:28px;font-weight:700;color:#1a1a1a;letter-spacing:2px;font-family:monospace;">${invite.code || 'CN-XXXX-XXXX'}</p>
        <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#E5C77E,#D4AF37);color:#000;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:16px;box-shadow:0 4px 12px rgba(212,175,55,0.3);">Request Your Invitation →</a>
        <p style="margin:12px 0 0 0;font-size:12px;color:#92400E;">This code is unique to you and expires in 14 days.</p>
      </div>

      <!-- Timeline -->
      <div style="margin:0 0 24px 0;">
        <h2 style="margin:0 0 16px 0;font-size:18px;font-weight:700;color:#1a1a1a;">THE TIMELINE</h2>
        <div style="font-size:14px;line-height:1.8;color:#333;">
          <p style="margin:0 0 8px 0;"><strong>📅 November 10, 2025:</strong> Soft Launch (Invitation-Only Early Access)<br/><span style="color:#666;">Platform goes live for founding members. Core features available immediately.</span></p>
          <p style="margin:0 0 8px 0;"><strong>📅 December 1, 2025:</strong> Official Public Launch<br/><span style="color:#666;">Full platform launch with all features. Founding member pricing still available.</span></p>
          <p style="margin:0;"><strong>📅 January 15, 2026:</strong> Founding Member Window Closes<br/><span style="color:#666;">Pricing increases to $4,997/year (Premium) or $9,997/year (Elite)</span></p>
        </div>
        <p style="margin:16px 0 0 0;font-size:14px;line-height:1.6;color:#666;font-style:italic;">
          Founding member pricing ends when we reach 250 members OR January 15, 2026—whichever comes first.
        </p>
      </div>

      <!-- CTA -->
      <div style="background:#f8f9fa;padding:20px;margin:0 0 24px 0;border-radius:8px;text-align:center;">
        <p style="margin:0 0 16px 0;font-size:16px;font-weight:600;color:#1a1a1a;">Ready to Transform Your Network?</p>
        <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#666;">Early access gives you first choice of connections, influence on features, locked-in pricing, and founding member status that lasts forever.</p>
        <a href="${link}" style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:16px;">Apply Now →</a>
      </div>

      <!-- Footer -->
      <div style="padding:20px 0;border-top:1px solid #eee;text-align:center;">
        <p style="margin:0 0 8px 0;font-size:14px;color:#666;">Questions? Just reply to this email—I read every message personally.</p>
        <p style="margin:0 0 4px 0;font-size:14px;font-weight:600;color:#1a1a1a;">Shehab Salamah</p>
        <p style="margin:0;font-size:13px;color:#999;">Founder, Circle Network</p>
        <p style="margin:12px 0 0 0;font-size:12px;color:#999;">© 2025 Circle Network. All rights reserved.</p>
      </div>

    </div>
  </div>

</body>
</html>`;
}

export async function POST(req) {
  try {
    // Validate SendGrid API key
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SendGrid API key is missing');
      return NextResponse.json(
        { error: 'Email service is not configured. Please contact administrator.' },
        { status: 500 }
      );
    }

    // Validate Supabase credentials
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase credentials are missing');
      return NextResponse.json(
        { error: 'Database service is not configured. Please contact administrator.' },
        { status: 500 }
      );
    }

    // Create authenticated client to check user permissions
    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: req.headers.get('Authorization') || ''
          }
        }
      }
    );

    // Check authentication and admin status
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - authentication required' },
        { status: 401 }
      );
    }

    // Verify user is admin
    const { data: profile, error: profileError } = await authClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden - admin access required' },
        { status: 403 }
      );
    }

    // Now use service role for bulk operations (authenticated user is admin)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thecirclenetwork.org';

    const body = await req.json();
    const campaignId = body.campaignId || null;
    const inviteId = body.inviteId || null;

    if (!campaignId && !inviteId) {
      return NextResponse.json(
        { error: 'campaignId or inviteId required' },
        { status: 400 }
      );
    }

    let invites = [];
    if (inviteId) {
      const { data, error } = await supabase
        .from('bulk_invites')
        .select('*')
        .eq('id', inviteId)
        .limit(1);

      if (error) {
        console.error('Database error fetching invite:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      invites = data || [];
    } else if (campaignId) {
      const { data, error } = await supabase
        .from('bulk_invites')
        .select('*')
        .eq('campaign_id', campaignId)
        .in('status', ['queued', 'resend'])
        .limit(10000);

      if (error) {
        console.error('Database error fetching campaign invites:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      invites = data || [];
    }

    if (!invites.length) {
      return NextResponse.json({
        success: true,
        sent: 0,
        message: 'No invites found to send'
      });
    }

    const sentIds = [];
    const errors = [];

    for (const inv of invites) {
      try {
        // Validate email
        if (!inv.email || !inv.email.includes('@')) {
          errors.push({ id: inv.id, email: inv.email, error: 'Invalid email address' });
          await supabase
            .from('bulk_invite_events')
            .insert({
              invite_id: inv.id,
              event: 'error',
              details: { message: 'Invalid email address' }
            });
          continue;
        }

        const msg = {
          to: inv.email,
          from: { email: FROM_EMAIL, name: FROM_NAME },
          replyTo: REPLY_TO_EMAIL,
          subject: `You've been selected for Circle Network`,
          html: htmlForInvite({ invite: inv, appUrl }),
          mailSettings: { bypassListManagement: { enable: true } },
          customArgs: {
            invite_id: String(inv.id),
            campaign_id: String(inv.campaign_id || '')
          }
        };

        await sgMail.send(msg);
        sentIds.push(inv.id);

        // Log success event
        await supabase
          .from('bulk_invite_events')
          .insert({
            invite_id: inv.id,
            event: 'sent',
            details: { email: inv.email }
          });

      } catch (e) {
        console.error(`Error sending to ${inv.email}:`, e);
        errors.push({ id: inv.id, email: inv.email, error: String(e) });

        await supabase
          .from('bulk_invite_events')
          .insert({
            invite_id: inv.id,
            event: 'error',
            details: { message: String(e) }
          });
      }
    }

    // Update status for successfully sent invites
    if (sentIds.length) {
      await supabase
        .from('bulk_invites')
        .update({ status: 'sent' })
        .in('id', sentIds);
    }

    return NextResponse.json({
      success: true,
      sent: sentIds.length,
      total: invites.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (e) {
    console.error('Send error:', e);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? String(e) : undefined
      },
      { status: 500 }
    );
  }
}