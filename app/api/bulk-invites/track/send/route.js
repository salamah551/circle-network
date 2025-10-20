import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Email Template Generator - All 4 Sequences Using Your Exact Format
 */
function getEmailTemplate(stage, recipient, trackingPixel, unsubscribeUrl) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thecirclenetwork.org';
  const inviteLink = `${appUrl}/?invite=${recipient.invite_code}&iid=${recipient.id}`;
  const firstName = recipient.first_name || recipient.name?.split(' ')[0] || 'there';
  const inviteCode = recipient.invite_code || 'CN-XXXX-XXXX';

  // EMAIL 1: Initial Invitation (Stage 0)
  if (stage === 0) {
    return {
      subject: "You've been selected for Circle Network",
      html: `
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
      <div style="width:48px;height:48px;background:linear-gradient(135deg,#E5C77E,#D4AF37);border-radius:12px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:24px;">
        👑
      </div>
      <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Circle Network</h1>
      <p style="margin:0;opacity:0.8;font-size:14px;">Invitation-Only • Founding Member Opportunity</p>
    </div>

    <!-- Main Content -->
    <div style="padding:32px 28px;">
      
      <p style="margin:0 0 24px 0;font-size:16px;line-height:1.6;color:#333;">Hi ${firstName},</p>
      
      <p style="margin:0 0 24px 0;font-size:16px;line-height:1.6;color:#333;">
        You've been personally selected to join <strong>Circle Network</strong>—an invitation-only community of accomplished professionals who are transforming how high-achievers connect and grow.
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
            Our algorithm analyzes your goals, expertise, and needs to recommend 3 high-value connections every week. Accept an intro, and we facilitate the email introduction automatically. No cold outreach—just warm, curated connections.
          </p>
        </div>

        <div style="margin:0 0 16px 0;">
          <p style="margin:0 0 4px 0;font-size:15px;font-weight:700;color:#1a1a1a;">💼 AI Deal Flow Alerts <span style="font-size:11px;background:#8B5CF6;color:white;padding:2px 6px;border-radius:4px;margin-left:6px;">ELITE • Q1 2026</span></p>
          <p style="margin:0;font-size:14px;line-height:1.5;color:#666;">
            Set your investment criteria—industry, deal size, stage, geography—and our AI monitors the network and external sources to surface opportunities that match. Get notified the moment relevant deals emerge.
          </p>
        </div>

        <div style="margin:0 0 16px 0;">
          <p style="margin:0 0 4px 0;font-size:15px;font-weight:700;color:#1a1a1a;">🛡️ Reputation Guardian <span style="font-size:11px;background:#8B5CF6;color:white;padding:2px 6px;border-radius:4px;margin-left:6px;">ELITE • Q1 2026</span></p>
          <p style="margin:0;font-size:14px;line-height:1.5;color:#666;">
            Your reputation is your most valuable asset. Our AI continuously monitors mentions of you and your company across social media, news, and forums. Get instant alerts about potential threats before they escalate.
          </p>
        </div>

        <div style="margin:0;">
          <p style="margin:0 0 4px 0;font-size:15px;font-weight:700;color:#1a1a1a;">📊 AI Competitive Intelligence <span style="font-size:11px;background:#8B5CF6;color:white;padding:2px 6px;border-radius:4px;margin-left:6px;">ELITE • Q1 2026</span></p>
          <p style="margin:0;font-size:14px;line-height:1.5;color:#666;">
            Stay ahead of your competition. Our AI tracks market trends, competitor moves, funding announcements, and strategic shifts in your industry. Receive weekly intelligence reports with actionable insights.
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
          <li style="margin:0 0 12px 0;font-size:15px;line-height:1.5;"><strong>✓ ALL Elite AI Features INCLUDED—Forever</strong><br/>While future Premium members must pay $4,997-$8,994 to access AI features, you get them all at no additional cost: AI Deal Flow Alerts ($1,997 value) + Reputation Guardian ($1,497 value) + AI Competitive Intelligence ($1,497 value)</li>
          <li style="margin:0 0 12px 0;font-size:15px;line-height:1.5;"><strong>✓ Founding Member Badge</strong><br/>Displayed on your profile, showing you were part of the original founding members</li>
          <li style="margin:0 0 12px 0;font-size:15px;line-height:1.5;"><strong>✓ Direct Input on Development</strong><br/>Shape the platform's future through exclusive founder surveys and feedback sessions</li>
          <li style="margin:0;font-size:15px;line-height:1.5;"><strong>✓ Unlimited Access to All Core Features</strong><br/>Strategic Intros, Member Directory, Private Messaging, and more—no paywalls, no limits</li>
        </ul>
      </div>

      <!-- Invitation Code -->
      <div style="background:#FEF3C7;border:2px solid #D4AF37;padding:20px;margin:0 0 24px 0;border-radius:8px;text-align:center;">
        <p style="margin:0 0 8px 0;font-size:14px;font-weight:600;color:#92400E;">YOUR INVITATION CODE</p>
        <p style="margin:0 0 16px 0;font-size:28px;font-weight:700;color:#1a1a1a;letter-spacing:2px;font-family:monospace;">${inviteCode}</p>
        <a href="${inviteLink}" style="display:inline-block;background:linear-gradient(135deg,#E5C77E,#D4AF37);color:#000;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:16px;">Apply Now →</a>
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
          Founding member pricing ends when we reach capacity OR January 15, 2026—whichever comes first.
        </p>
      </div>

      <!-- CTA -->
      <div style="background:#f8f9fa;padding:20px;margin:0 0 24px 0;border-radius:8px;text-align:center;">
        <p style="margin:0 0 16px 0;font-size:16px;font-weight:600;color:#1a1a1a;">Ready to Transform Your Network?</p>
        <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#666;">Early access gives you first choice of connections, influence on features, locked-in pricing, and founding member status that lasts forever.</p>
        <a href="${inviteLink}" style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:16px;">Apply Now →</a>
      </div>

      <!-- Footer -->
      <div style="padding:20px 0;border-top:1px solid #eee;text-align:center;">
        <p style="margin:0 0 8px 0;font-size:14px;color:#666;">Questions? Just reply to this email—I read every message personally.</p>
        <p style="margin:0 0 4px 0;font-size:14px;font-weight:600;color:#1a1a1a;">Shehab Salamah</p>
        <p style="margin:0 0 16px 0;font-size:13px;color:#999;">Founder, Circle Network</p>
        
        <p style="margin:16px 0 0 0;font-size:11px;color:#999;">
          Don't want to receive invitations? <a href="${unsubscribeUrl}" style="color:#999;text-decoration:underline;">Unsubscribe</a>
        </p>
        
        <p style="margin:12px 0 0 0;font-size:12px;color:#999;">© 2025 Circle Network. All rights reserved.</p>
      </div>

    </div>
  </div>
  ${trackingPixel}
</body>
</html>
      `
    };
  }

  // EMAIL 2: Day 3 Reminder (Stage 1)
  if (stage === 1) {
    return {
      subject: "Quick follow-up on your Circle Network invitation",
      html: `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:20px;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    
    <div style="background:linear-gradient(135deg,#1a1a1a 0%,#000 100%);color:white;padding:32px 28px;text-align:center;">
      <div style="width:48px;height:48px;background:linear-gradient(135deg,#E5C77E,#D4AF37);border-radius:12px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:24px;">👑</div>
      <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Circle Network</h1>
      <p style="margin:0;opacity:0.8;font-size:14px;">Invitation-Only • Founding Member Opportunity</p>
    </div>

    <div style="padding:32px 28px;">
      <p style="margin:0 0 24px 0;font-size:16px;line-height:1.6;color:#333;">Hi ${firstName},</p>
      
      <p style="margin:0 0 24px 0;font-size:16px;line-height:1.6;color:#333;">
        I sent you an invitation to join <strong>Circle Network</strong> a few days ago, and wanted to follow up in case it got buried in your inbox.
      </p>

      <p style="margin:0 0 24px 0;font-size:16px;line-height:1.6;color:#333;">
        You're among a highly selective group being invited during our <strong>founding member phase</strong>—and there are only <strong>11 days left</strong> to claim your spot at the locked-in price of $2,497/year.
      </p>

      <p style="margin:0 0 32px 0;font-size:16px;line-height:1.6;color:#333;">
        After January 15, 2026, this same membership will cost $4,997-$9,997/year.
      </p>

      <div style="background:#f8f9fa;border-left:4px solid #D4AF37;padding:20px;margin:0 0 24px 0;border-radius:4px;">
        <h2 style="margin:0 0 16px 0;font-size:18px;font-weight:700;color:#1a1a1a;">QUICK REMINDER: WHAT YOU GET</h2>
        <ul style="margin:0;padding:0 0 0 20px;">
          <li style="margin:0 0 8px 0;font-size:15px;line-height:1.6;color:#333;"><strong>AI-Powered Strategic Introductions:</strong> 3 curated connections every week</li>
          <li style="margin:0 0 8px 0;font-size:15px;line-height:1.6;color:#333;"><strong>AI Deal Flow Alerts:</strong> Real-time opportunities matching your criteria (Q1 2026)</li>
          <li style="margin:0 0 8px 0;font-size:15px;line-height:1.6;color:#333;"><strong>Reputation Guardian:</strong> 24/7 monitoring and threat detection (Q1 2026)</li>
          <li style="margin:0;font-size:15px;line-height:1.6;color:#333;"><strong>Competitive Intelligence:</strong> Weekly market insights (Q1 2026)</li>
        </ul>
        <p style="margin:16px 0 0 0;font-size:14px;line-height:1.6;color:#666;font-weight:600;">
          All Elite AI features included at no extra cost—a $4,991/year value.
        </p>
      </div>

      <div style="background:#FEF3C7;border:2px solid #D4AF37;padding:20px;margin:0 0 24px 0;border-radius:8px;text-align:center;">
        <p style="margin:0 0 8px 0;font-size:14px;font-weight:600;color:#92400E;">YOUR INVITATION CODE</p>
        <p style="margin:0 0 16px 0;font-size:28px;font-weight:700;color:#1a1a1a;letter-spacing:2px;font-family:monospace;">${inviteCode}</p>
        <a href="${inviteLink}" style="display:inline-block;background:linear-gradient(135deg,#E5C77E,#D4AF37);color:#000;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:16px;">Complete Your Application →</a>
        <p style="margin:12px 0 0 0;font-size:12px;color:#92400E;">Expires in 11 days</p>
      </div>

      <div style="padding:20px 0;border-top:1px solid #eee;text-align:center;">
        <p style="margin:0 0 8px 0;font-size:14px;color:#666;">Questions? Just reply to this email.</p>
        <p style="margin:0 0 4px 0;font-size:14px;font-weight:600;color:#1a1a1a;">Shehab Salamah</p>
        <p style="margin:0 0 16px 0;font-size:13px;color:#999;">Founder, Circle Network</p>
        <p style="margin:16px 0 0 0;font-size:11px;color:#999;">
          <a href="${unsubscribeUrl}" style="color:#999;text-decoration:underline;">Unsubscribe</a>
        </p>
        <p style="margin:12px 0 0 0;font-size:12px;color:#999;">© 2025 Circle Network. All rights reserved.</p>
      </div>
    </div>
  </div>
  ${trackingPixel}
</body>
</html>
      `
    };
  }

  // EMAIL 3: Day 7 Value Reminder (Stage 2)
  if (stage === 2) {
    return {
      subject: "The ROI of one good connection (Circle Network)",
      html: `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:20px;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    
    <div style="background:linear-gradient(135deg,#1a1a1a 0%,#000 100%);color:white;padding:32px 28px;text-align:center;">
      <div style="width:48px;height:48px;background:linear-gradient(135deg,#E5C77E,#D4AF37);border-radius:12px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:24px;">👑</div>
      <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Circle Network</h1>
      <p style="margin:0;opacity:0.8;font-size:14px;">Invitation-Only • Founding Member Opportunity</p>
    </div>

    <div style="padding:32px 28px;">
      <p style="margin:0 0 24px 0;font-size:16px;line-height:1.6;color:#333;">Hi ${firstName},</p>
      
      <p style="margin:0 0 24px 0;font-size:16px;line-height:1.6;color:#333;">Let me ask you a question:</p>

      <p style="margin:0 0 24px 0;font-size:18px;line-height:1.6;color:#1a1a1a;font-weight:600;font-style:italic;">
        What's one valuable connection worth to you?
      </p>

      <p style="margin:0 0 32px 0;font-size:16px;line-height:1.6;color:#333;">
        A strategic partnership? $250,000.<br/>
        A key hire that saves recruiting fees? $150,000.<br/>
        An introduction to the right investor? Priceless.
      </p>

      <div style="background:linear-gradient(135deg,#1a1a1a 0%,#000 100%);color:white;padding:24px;margin:0 0 24px 0;border-radius:8px;">
        <h2 style="margin:0 0 16px 0;font-size:18px;font-weight:700;color:#D4AF37;">THE MATH IS SIMPLE</h2>
        <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;opacity:0.95;">
          Circle Network costs $2,497/year as a founding member.
        </p>
        <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;opacity:0.95;">
          If just <strong style="color:#D4AF37;">ONE connection</strong> this year creates $50,000 in value (a conservative estimate), your ROI is <strong style="color:#D4AF37;">20x</strong>.
        </p>
        <p style="margin:0;font-size:14px;line-height:1.6;opacity:0.8;font-style:italic;">
          Most members make multiple valuable connections per year.
        </p>
      </div>

      <p style="margin:0 0 24px 0;font-size:16px;line-height:1.6;color:#333;">
        You have <strong>7 days left</strong> to join at founding member pricing before it increases to $4,997-$9,997/year.
      </p>

      <div style="background:#FEF3C7;border:2px solid #D4AF37;padding:20px;margin:0 0 24px 0;border-radius:8px;text-align:center;">
        <p style="margin:0 0 8px 0;font-size:14px;font-weight:600;color:#92400E;">YOUR INVITATION CODE</p>
        <p style="margin:0 0 16px 0;font-size:28px;font-weight:700;color:#1a1a1a;letter-spacing:2px;font-family:monospace;">${inviteCode}</p>
        <a href="${inviteLink}" style="display:inline-block;background:linear-gradient(135deg,#E5C77E,#D4AF37);color:#000;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:16px;">Join Now →</a>
        <p style="margin:12px 0 0 0;font-size:12px;color:#92400E;">7 days remaining</p>
      </div>

      <div style="padding:20px 0;border-top:1px solid #eee;text-align:center;">
        <p style="margin:0 0 8px 0;font-size:14px;color:#666;">Questions? Just reply to this email.</p>
        <p style="margin:0 0 4px 0;font-size:14px;font-weight:600;color:#1a1a1a;">Shehab Salamah</p>
        <p style="margin:0 0 16px 0;font-size:13px;color:#999;">Founder, Circle Network</p>
        <p style="margin:16px 0 0 0;font-size:11px;color:#999;">
          <a href="${unsubscribeUrl}" style="color:#999;text-decoration:underline;">Unsubscribe</a>
        </p>
        <p style="margin:12px 0 0 0;font-size:12px;color:#999;">© 2025 Circle Network. All rights reserved.</p>
      </div>
    </div>
  </div>
  ${trackingPixel}
</body>
</html>
      `
    };
  }

  // EMAIL 4: Day 11 Final Urgency (Stage 3)
  return {
    subject: "Last call: Your Circle Network founding member invite expires in 3 days",
    html: `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:20px;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
    
    <div style="background:linear-gradient(135deg,#8B0000 0%,#DC143C 100%);color:white;padding:32px 28px;text-align:center;">
      <div style="width:48px;height:48px;background:linear-gradient(135deg,#E5C77E,#D4AF37);border-radius:12px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:24px;">⏰</div>
      <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Your Invitation Expires Soon</h1>
      <p style="margin:0;opacity:0.9;font-size:16px;font-weight:600;">3 Days Remaining</p>
    </div>

    <div style="padding:32px 28px;">
      <p style="margin:0 0 24px 0;font-size:16px;line-height:1.6;color:#333;">${firstName},</p>
      
      <p style="margin:0 0 24px 0;font-size:16px;line-height:1.6;color:#333;">
        This is my final message about your Circle Network invitation.
      </p>

      <p style="margin:0 0 24px 0;font-size:16px;line-height:1.6;color:#333;">
        Your invitation code expires in <strong style="color:#DC143C;">72 hours</strong>, and after that, you'll miss the founding member pricing of $2,497/year—locked in for life.
      </p>

      <div style="background:#FEE2E2;border-left:4px solid #DC143C;padding:20px;margin:0 0 24px 0;border-radius:4px;">
        <h2 style="margin:0 0 16px 0;font-size:18px;font-weight:700;color:#991B1B;">WHAT YOU'RE ABOUT TO LOSE:</h2>
        <ul style="margin:0;padding:0 0 0 20px;">
          <li style="margin:0 0 8px 0;font-size:15px;line-height:1.6;color:#991B1B;"><strong>$2,500/year savings</strong> (forever)</li>
          <li style="margin:0 0 8px 0;font-size:15px;line-height:1.6;color:#991B1B;"><strong>$4,991/year</strong> in Elite AI features (included free for founding members)</li>
          <li style="margin:0 0 8px 0;font-size:15px;line-height:1.6;color:#991B1B;"><strong>Founding Member Badge</strong> and priority matching</li>
          <li style="margin:0;font-size:15px;line-height:1.6;color:#991B1B;"><strong>First choice</strong> of connections in the network</li>
        </ul>
        <p style="margin:16px 0 0 0;font-size:14px;line-height:1.6;color:#7F1D1D;font-weight:600;">
          Total value over 10 years: $74,910
        </p>
      </div>

      <p style="margin:0 0 24px 0;font-size:16px;line-height:1.6;color:#333;">
        I handpicked you for this invitation because I believe you'd be a valuable member of this community.
      </p>

      <p style="margin:0 0 32px 0;font-size:16px;line-height:1.6;color:#333;">
        But if you're not interested, that's okay too—just know that this opportunity won't come around again.
      </p>

      <div style="background:#1a1a1a;border:2px solid #DC143C;padding:20px;margin:0 0 24px 0;border-radius:8px;text-align:center;">
        <p style="margin:0 0 8px 0;font-size:14px;font-weight:600;color:#DC143C;">FINAL CALL • EXPIRES IN 72 HOURS</p>
        <p style="margin:0 0 16px 0;font-size:28px;font-weight:700;color:#fff;letter-spacing:2px;font-family:monospace;">${inviteCode}</p>
        <a href="${inviteLink}" style="display:inline-block;background:linear-gradient(135deg,#DC143C,#8B0000);color:#fff;text-decoration:none;padding:16px 40px;border-radius:8px;font-weight:700;font-size:18px;box-shadow:0 4px 12px rgba(220,20,60,0.3);">Claim Your Spot Now →</a>
      </div>

      <p style="margin:0 0 24px 0;font-size:14px;line-height:1.6;color:#666;text-align:center;font-style:italic;">
        After this email, you won't hear from me again about this opportunity.
      </p>

      <div style="padding:20px 0;border-top:1px solid #eee;text-align:center;">
        <p style="margin:0 0 4px 0;font-size:14px;font-weight:600;color:#1a1a1a;">Shehab Salamah</p>
        <p style="margin:0 0 16px 0;font-size:13px;color:#999;">Founder, Circle Network</p>
        <p style="margin:16px 0 0 0;font-size:11px;color:#999;">
          <a href="${unsubscribeUrl}" style="color:#999;text-decoration:underline;">Unsubscribe</a>
        </p>
        <p style="margin:12px 0 0 0;font-size:12px;color:#999;">© 2025 Circle Network. All rights reserved.</p>
      </div>
    </div>
  </div>
  ${trackingPixel}
</body>
</html>
    `
  };
}

/**
 * POST /api/bulk-invites/track/send
 * Automated cron job that sends up to daily_limit emails per campaign
 * Handles 4-email drip sequence: Day 0 → Day 3 → Day 7 → Day 11
 */
export async function POST(request) {
  try {
    const { campaignId } = await request.json();

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID required' },
        { status: 400 }
      );
    }

    console.log(`📧 Processing campaign: ${campaignId}`);

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('bulk_invite_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      console.error('Campaign error:', campaignError);
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Check daily limit (prevent duplicate sends on same day)
    const today = new Date().toISOString().split('T')[0];
    if (campaign.last_send_date === today) {
      console.log(`⏸️  Daily limit already reached for campaign ${campaignId} today`);
      return NextResponse.json(
        { 
          success: true,
          sent: 0,
          message: 'Daily limit already reached for today' 
        },
        { status: 429 }
      );
    }

    // Get recipients ready to send (respects daily_limit)
    const { data: recipients, error: recipientsError } = await supabaseAdmin
      .from('bulk_invites')
      .select('*')
      .eq('campaign_id', campaignId)
      .in('status', ['queued', 'sent'])
      .lte('next_email_scheduled', new Date().toISOString())
      .lt('sequence_stage', 4)
      .limit(campaign.daily_limit || 100);

    if (recipientsError) {
      console.error('Recipients error:', recipientsError);
      return NextResponse.json(
        { error: 'Failed to get recipients' },
        { status: 500 }
      );
    }

    if (!recipients || recipients.length === 0) {
      console.log('✅ No recipients ready to send');
      return NextResponse.json({ 
        success: true, 
        sent: 0,
        message: 'No recipients ready to send'
      });
    }

    console.log(`📨 Sending to ${recipients.length} recipients (limit: ${campaign.daily_limit || 100})`);

    // DEDUPLICATION: Remove duplicates by email
    const uniqueRecipients = [];
    const seenEmails = new Set();
    
    for (const r of recipients) {
      const emailLower = r.email.toLowerCase();
      if (!seenEmails.has(emailLower)) {
        seenEmails.add(emailLower);
        uniqueRecipients.push(r);
      }
    }

    // SUPPRESSION: Check for unsubscribes and existing members
    const emails = uniqueRecipients.map(r => r.email.toLowerCase());
    
    const { data: unsubscribed } = await supabaseAdmin
      .from('unsubscribes')
      .select('email')
      .in('email', emails);

    const unsubscribedSet = new Set(
      (unsubscribed || []).map(u => u.email.toLowerCase())
    );

    const { data: existingMembers } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .in('email', emails);

    const memberEmailsSet = new Set(
      (existingMembers || []).map(m => m.email.toLowerCase())
    );

    // Filter out suppressed emails
    const filteredRecipients = uniqueRecipients.filter(r => {
      const emailLower = r.email.toLowerCase();
      
      if (unsubscribedSet.has(emailLower)) {
        console.log(`⚠️  Suppressed ${r.email} - unsubscribed`);
        return false;
      }
      
      if (memberEmailsSet.has(emailLower)) {
        console.log(`⚠️  Suppressed ${r.email} - already a member`);
        return false;
      }
      
      return true;
    });

    console.log(`✅ Sending to ${filteredRecipients.length} after suppression`);

    // Send emails
    let sentCount = 0;
    const errors = [];

    for (const recipient of filteredRecipients) {
      try {
        const trackingPixel = `<img src="${process.env.NEXT_PUBLIC_APP_URL}/api/bulk-invites/track?rid=${recipient.id}&type=open" width="1" height="1" alt="" />`;
        const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent(recipient.email)}&token=${recipient.code}`;
        
        const emailTemplate = getEmailTemplate(
          recipient.sequence_stage || 0,
          recipient,
          trackingPixel,
          unsubscribeUrl
        );

        // Send via SendGrid
        const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            personalizations: [{
              to: [{ email: recipient.email }],
              subject: emailTemplate.subject
            }],
            from: {
              email: process.env.SENDGRID_FROM_EMAIL || 'shehab@thecirclenetwork.org',
              name: process.env.SENDGRID_FROM_NAME || 'Shehab Salamah'
            },
            reply_to: {
              email: process.env.SENDGRID_REPLY_TO_EMAIL || 'invite@thecirclenetwork.org'
            },
            content: [{
              type: 'text/html',
              value: emailTemplate.html
            }],
            tracking_settings: {
              click_tracking: { enable: true },
              open_tracking: { enable: true }
            },
            custom_args: {
              invite_id: String(recipient.id),
              campaign_id: String(campaignId),
              sequence_stage: String(recipient.sequence_stage || 0)
            }
          })
        });

        if (sendGridResponse.ok) {
          // Calculate next email time based on sequence stage
          const daysUntilNext = [3, 4, 4][recipient.sequence_stage || 0]; // Day 0→3, Day 3→7, Day 7→11
          const nextEmailScheduled = daysUntilNext 
            ? new Date(Date.now() + daysUntilNext * 24 * 60 * 60 * 1000).toISOString()
            : null;

          // Update recipient - IDEMPOTENT
          await supabaseAdmin
            .from('bulk_invites')
            .update({
              status: 'sent',
              sent: true,
              sent_at: new Date().toISOString(),
              sequence_stage: (recipient.sequence_stage || 0) + 1,
              last_email_sent: new Date().toISOString(),
              next_email_scheduled: nextEmailScheduled
            })
            .eq('id', recipient.id);

          // Log success
          await supabaseAdmin
            .from('bulk_invite_events')
            .insert({
              invite_id: recipient.id,
              event: 'sent',
              details: { 
                email: recipient.email,
                sequence_stage: recipient.sequence_stage || 0,
                sent_at: new Date().toISOString()
              }
            });

          sentCount++;
          console.log(`✅ Sent to ${recipient.email} (Stage ${recipient.sequence_stage || 0})`);
        } else {
          const errorText = await sendGridResponse.text();
          console.error(`❌ Failed to send to ${recipient.email}:`, errorText);
          errors.push({ email: recipient.email, error: errorText });
        }
      } catch (emailError) {
        console.error(`❌ Failed to send to ${recipient.email}:`, emailError);
        errors.push({ email: recipient.email, error: emailError.message });
      }
    }

    // Update campaign stats
    await supabaseAdmin
      .from('bulk_invite_campaigns')
      .update({
        sent_count: (campaign.sent_count || 0) + sentCount,
        last_send_date: today,
        last_sent_at: new Date().toISOString()
      })
      .eq('id', campaignId);

    console.log(`✅ Campaign ${campaignId}: Sent ${sentCount}/${filteredRecipients.length} emails`);

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: errors.length,
      suppressed: uniqueRecipients.length - filteredRecipients.length,
      duplicates: recipients.length - uniqueRecipients.length,
      total: recipients.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('❌ Send error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bulk-invites/track/send (Called by Vercel Cron)
 * Processes all active campaigns daily
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
      console.error('❌ Unauthorized cron access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Daily cron job started at', new Date().toISOString());

    // Get all active campaigns
    const { data: campaigns, error: campaignsError } = await supabaseAdmin
      .from('bulk_invite_campaigns')
      .select('id, name, daily_limit')
      .eq('status', 'active');

    if (campaignsError) {
      console.error('Campaigns error:', campaignsError);
      return NextResponse.json({ error: campaignsError.message }, { status: 500 });
    }

    if (!campaigns || campaigns.length === 0) {
      console.log('✅ No active campaigns');
      return NextResponse.json({ success: true, message: 'No active campaigns' });
    }

    console.log(`📧 Processing ${campaigns.length} active campaigns`);

    const results = [];

    // Process each campaign
    for (const campaign of campaigns) {
      try {
        console.log(`📨 Processing campaign: ${campaign.name} (ID: ${campaign.id})`);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/bulk-invites/track/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignId: campaign.id })
        });

        const result = await response.json();
        results.push({ campaign: campaign.name, ...result });
        
      } catch (error) {
        console.error(`❌ Error processing campaign ${campaign.id}:`, error);
        results.push({ campaign: campaign.name, error: error.message });
      }
    }

    console.log('✅ Daily cron job completed');

    return NextResponse.json({
      success: true,
      campaigns_processed: campaigns.length,
      results
    });

  } catch (error) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}