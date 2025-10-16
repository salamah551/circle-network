// lib/email-templates.js
// Email templates for Circle Network
// Optimized for high conversion with your HNWI audience

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://thecirclenetwork.org';

// ========================================
// INVITATION EMAIL (Cold Invite)
// ========================================
export const invitationEmail = ({ 
  recipientName, 
  inviterName = 'Shehab Salamah',
  inviteCode,
  spotsRemaining = 247
}) => ({
  subject: `${recipientName}, you've been selected for Circle Network`,
  
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Circle Network Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000; color: #ffffff;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(to bottom right, #18181b, #09090b); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 16px; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid rgba(212, 175, 55, 0.1);">
              <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #D4AF37, #C9A131); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <span style="font-size: 24px;">👑</span>
              </div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                You've Been Selected
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: rgba(255, 255, 255, 0.9);">
                Hi ${recipientName},
              </p>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: rgba(255, 255, 255, 0.9);">
                You've been personally selected to join <strong style="color: #D4AF37;">Circle Network</strong>—an invitation-only community of 250 accomplished professionals across all industries.
              </p>
              
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: rgba(255, 255, 255, 0.9);">
                This isn't a typical networking group. Circle Network is where high-achievers transform connections into tangible results: strategic partnerships, key hires, funding opportunities, and business growth.
              </p>
              
              <!-- Value Props -->
              <div style="background: rgba(212, 175, 55, 0.05); border: 1px solid rgba(212, 175, 55, 0.15); border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #D4AF37;">
                  What's Inside:
                </h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #10b981; margin-right: 8px;">✓</span>
                      <span style="color: rgba(255, 255, 255, 0.8); font-size: 15px;">AI-powered strategic introductions (3 curated matches weekly)</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #10b981; margin-right: 8px;">✓</span>
                      <span style="color: rgba(255, 255, 255, 0.8); font-size: 15px;">Direct access to 250 pre-vetted professionals (no gatekeepers)</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #10b981; margin-right: 8px;">✓</span>
                      <span style="color: rgba(255, 255, 255, 0.8); font-size: 15px;">Real-time messaging with decision-makers across industries</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #10b981; margin-right: 8px;">✓</span>
                      <span style="color: rgba(255, 255, 255, 0.8); font-size: 15px;">Exclusive events, roundtables, and expert sessions</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #10b981; margin-right: 8px;">✓</span>
                      <span style="color: rgba(255, 255, 255, 0.8); font-size: 15px;">Request board for problem-solving and expertise</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Urgency -->
              <div style="background: rgba(245, 158, 11, 0.1); border-left: 3px solid #D4AF37; padding: 16px 20px; margin-bottom: 30px; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.9);">
                  <strong style="color: #D4AF37;">Only ${spotsRemaining} founding member spots remain.</strong> Platform launches November 10, 2025. Join now to lock in founding member pricing ($2,497/year) before rates increase.
                </p>
              </div>
              
              <!-- Your Invitation Code -->
              <div style="text-align: center; margin-bottom: 30px;">
                <p style="margin: 0 0 12px; font-size: 14px; color: rgba(255, 255, 255, 0.6); text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                  Your Invitation Code
                </p>
                <div style="display: inline-block; background: rgba(212, 175, 55, 0.15); border: 2px solid rgba(212, 175, 55, 0.4); border-radius: 8px; padding: 16px 32px;">
                  <span style="font-size: 24px; font-weight: 700; color: #D4AF37; letter-spacing: 2px; font-family: 'Courier New', monospace;">
                    ${inviteCode}
                  </span>
                </div>
              </div>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${APP_URL}/apply?code=${inviteCode}" style="display: inline-block; background: linear-gradient(135deg, #D4AF37, #C9A131); color: #000000; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);">
                      Accept Your Invitation →
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Guarantee -->
              <div style="text-align: center; margin-top: 30px; padding-top: 30px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                <p style="margin: 0 0 8px; font-size: 14px; color: rgba(16, 185, 129, 0.9);">
                  <strong>30-Day Money-Back Guarantee</strong>
                </p>
                <p style="margin: 0; font-size: 13px; color: rgba(255, 255, 255, 0.6);">
                  If Circle Network doesn't deliver meaningful value, we'll refund 100%. Zero risk.
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background: rgba(0, 0, 0, 0.3); border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 8px; font-size: 13px; color: rgba(255, 255, 255, 0.6);">
                Questions? Reply to this email or visit our <a href="${APP_URL}/contact" style="color: #D4AF37; text-decoration: none;">help center</a>.
              </p>
              <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.4);">
                This invitation expires in 7 days • Circle Network © 2025
              </p>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `,
  
  text: `
Hi ${recipientName},

You've been personally selected to join Circle Network—an invitation-only community of 250 accomplished professionals across all industries.

WHAT'S INSIDE:
✓ AI-powered strategic introductions (3 curated matches weekly)
✓ Direct access to 250 pre-vetted professionals
✓ Real-time messaging with decision-makers
✓ Exclusive events and roundtables
✓ Problem-solving and expertise exchange

ONLY ${spotsRemaining} FOUNDING SPOTS REMAIN
Platform launches November 10, 2025
Lock in founding member pricing: $2,497/year

YOUR INVITATION CODE: ${inviteCode}

Accept your invitation: ${APP_URL}/apply?code=${inviteCode}

30-Day Money-Back Guarantee • Zero Risk

Questions? Reply to this email.

- ${inviterName}
Circle Network
  `
});

// ========================================
// WELCOME EMAIL (New Member)
// ========================================
export const welcomeEmail = ({ 
  firstName,
  membershipTier = 'Founding',
  loginUrl = `${APP_URL}/login`
}) => ({
  subject: `Welcome to Circle Network, ${firstName}! 🎉`,
  
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Circle Network</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000; color: #ffffff;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(to bottom right, #18181b, #09090b); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 16px; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid rgba(212, 175, 55, 0.1);">
              <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #D4AF37, #C9A131); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <span style="font-size: 32px;">🎉</span>
              </div>
              <h1 style="margin: 0 0 8px; font-size: 32px; font-weight: 700; color: #ffffff;">
                Welcome to Circle Network!
              </h1>
              <p style="margin: 0; font-size: 16px; color: rgba(212, 175, 55, 0.9);">
                You're now a ${membershipTier} Member
              </p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: rgba(255, 255, 255, 0.9);">
                Hi ${firstName},
              </p>
              
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: rgba(255, 255, 255, 0.9);">
                Welcome to Circle Network—we're thrilled to have you in our community of accomplished professionals. You're now part of an exclusive network of 250 founding members across all industries.
              </p>
              
              <!-- Quick Start -->
              <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #10b981;">
                  🚀 Quick Start Guide
                </h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 12px 0;">
                      <strong style="color: #ffffff; display: block; margin-bottom: 4px;">1. Complete Your Profile</strong>
                      <span style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">Add your bio, expertise, and what you're looking for. Great profiles get 3x more connections.</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <strong style="color: #ffffff; display: block; margin-bottom: 4px;">2. Check Your Strategic Intros</strong>
                      <span style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">Our AI has already matched you with 3 high-value connections. Review and accept them!</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <strong style="color: #ffffff; display: block; margin-bottom: 4px;">3. Browse the Directory</strong>
                      <span style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">Explore members by industry, expertise, or location. Message anyone directly.</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <strong style="color: #ffffff; display: block; margin-bottom: 4px;">4. Post a Request</strong>
                      <span style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">Need an intro, advice, or help? Post it. The community responds fast.</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #D4AF37, #C9A131); color: #000000; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);">
                      Go to Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Launch Notice -->
              <div style="background: rgba(212, 175, 55, 0.1); border-left: 3px solid #D4AF37; padding: 16px 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.9);">
                  <strong style="color: #D4AF37;">Platform Preview Access</strong><br/>
                  You have early access! Full platform launches <strong>November 10, 2025</strong>. All features unlock on launch day. Until then, enjoy Strategic Intros and profile setup.
                </p>
              </div>
              
              <!-- Support -->
              <div style="text-align: center; margin-top: 30px; padding-top: 30px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                <p style="margin: 0 0 8px; font-size: 14px; color: rgba(255, 255, 255, 0.9);">
                  Need help? We're here for you.
                </p>
                <p style="margin: 0; font-size: 13px; color: rgba(255, 255, 255, 0.6);">
                  Reply to this email or visit <a href="${APP_URL}/contact" style="color: #D4AF37; text-decoration: none;">help center</a>
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background: rgba(0, 0, 0, 0.3); border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
              <p style="margin: 0 0 8px; font-size: 13px; color: rgba(255, 255, 255, 0.9);">
                Looking forward to seeing you inside!
              </p>
              <p style="margin: 0 0 16px; font-size: 14px; color: #D4AF37; font-weight: 600;">
                — The Circle Network Team
              </p>
              <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.4);">
                Circle Network © 2025 • <a href="${APP_URL}/privacy" style="color: rgba(255, 255, 255, 0.4); text-decoration: none;">Privacy</a> • <a href="${APP_URL}/terms" style="color: rgba(255, 255, 255, 0.4); text-decoration: none;">Terms</a>
              </p>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `,
  
  text: `
Welcome to Circle Network, ${firstName}! 🎉

You're now a ${membershipTier} Member

Welcome to Circle Network—we're thrilled to have you in our community of accomplished professionals. You're now part of an exclusive network of 250 founding members.

QUICK START GUIDE:

1. Complete Your Profile
   Add your bio, expertise, and what you're looking for. Great profiles get 3x more connections.

2. Check Your Strategic Intros
   Our AI has already matched you with 3 high-value connections. Review and accept them!

3. Browse the Directory
   Explore members by industry, expertise, or location. Message anyone directly.

4. Post a Request
   Need an intro, advice, or help? Post it. The community responds fast.

GO TO DASHBOARD: ${loginUrl}

PLATFORM PREVIEW ACCESS
You have early access! Full platform launches November 10, 2025. All features unlock on launch day. Until then, enjoy Strategic Intros and profile setup.

Need help? Reply to this email or visit ${APP_URL}/contact

Looking forward to seeing you inside!
— The Circle Network Team
  `
});

// ========================================
// AI SERVICES TEASER (Elite Members Only)
// ========================================
export const aiServicesTeaser = ({ 
  firstName,
  membershipTier = 'Elite'
}) => ({
  subject: `${firstName}, exclusive early access to our AI services 🤖`,
  
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Services - Early Access</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000; color: #ffffff;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(to bottom right, #18181b, #09090b); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 16px; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1)); border-bottom: 1px solid rgba(139, 92, 246, 0.2);">
              <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #8b5cf6, #3b82f6); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4);">
                <span style="font-size: 32px;">🤖</span>
              </div>
              <div style="display: inline-block; background: rgba(139, 92, 246, 0.2); border: 1px solid rgba(139, 92, 246, 0.4); border-radius: 20px; padding: 6px 16px; margin-bottom: 16px;">
                <span style="font-size: 12px; color: #a78bfa; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                  ${membershipTier} Member Exclusive
                </span>
              </div>
              <h1 style="margin: 0 0 8px; font-size: 32px; font-weight: 700; color: #ffffff;">
                Introducing Circle AI Services
              </h1>
              <p style="margin: 0; font-size: 16px; color: rgba(255, 255, 255, 0.7);">
                Enterprise-grade AI tools exclusively for our Elite members
              </p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: rgba(255, 255, 255, 0.9);">
                Hi ${firstName},
              </p>
              
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: rgba(255, 255, 255, 0.9);">
                As an <strong style="color: #a78bfa;">${membershipTier} Member</strong>, you get first access to something we've been quietly building: <strong>Circle AI Services</strong>—enterprise-grade AI tools designed specifically for high-net-worth professionals.
              </p>
              
              <!-- Service 1 -->
              <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.05)); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 20px;">
                <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
                  <div style="width: 48px; height: 48px; background: rgba(139, 92, 246, 0.2); border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; margin-right: 16px; flex-shrink: 0;">
                    <span style="font-size: 24px;">🎯</span>
                  </div>
                  <div>
                    <h3 style="margin: 0 0 8px; font-size: 20px; font-weight: 700; color: #ffffff;">
                      AI Competitive Intelligence
                    </h3>
                    <p style="margin: 0 0 4px; font-size: 14px; color: #a78bfa; font-weight: 600;">
                      Elite Member Price: $8,000/month (normally $10,000)
                    </p>
                  </div>
                </div>
                <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: rgba(255, 255, 255, 0.8);">
                  Know what your competitors are doing <em>before</em> they do it. Our AI monitors 10,000+ data sources 24/7, tracking pricing changes, product launches, hiring patterns, marketing campaigns, and strategic moves.
                </p>
                <div style="background: rgba(0, 0, 0, 0.3); border-radius: 8px; padding: 16px;">
                  <p style="margin: 0 0 12px; font-size: 13px; color: rgba(255, 255, 255, 0.6); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                    You Get:
                  </p>
                  <ul style="margin: 0; padding: 0 0 0 20px; list-style: none;">
                    <li style="margin: 0 0 8px; font-size: 14px; color: rgba(255, 255, 255, 0.8); position: relative; padding-left: 20px;">
                      <span style="position: absolute; left: 0; color: #10b981;">✓</span> Daily competitive intelligence briefs
                    </li>
                    <li style="margin: 0 0 8px; font-size: 14px; color: rgba(255, 255, 255, 0.8); position: relative; padding-left: 20px;">
                      <span style="position: absolute; left: 0; color: #10b981;">✓</span> Weekly strategic analysis reports
                    </li>
                    <li style="margin: 0 0 8px; font-size: 14px; color: rgba(255, 255, 255, 0.8); position: relative; padding-left: 20px;">
                      <span style="position: absolute; left: 0; color: #10b981;">✓</span> Real-time alerts for major moves
                    </li>
                    <li style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.8); position: relative; padding-left: 20px;">
                      <span style="position: absolute; left: 0; color: #10b981;">✓</span> Custom competitor monitoring dashboard
                    </li>
                  </ul>
                </div>
              </div>
              
              <!-- Service 2 -->
              <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.05)); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 20px;">
                <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
                  <div style="width: 48px; height: 48px; background: rgba(139, 92, 246, 0.2); border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; margin-right: 16px; flex-shrink: 0;">
                    <span style="font-size: 24px;">🛡️</span>
                  </div>
                  <div>
                    <h3 style="margin: 0 0 8px; font-size: 20px; font-weight: 700; color: #ffffff;">
                      AI Reputation Guardian
                    </h3>
                    <p style="margin: 0 0 4px; font-size: 14px; color: #a78bfa; font-weight: 600;">
                      Elite Member Price: $6,000/month (normally $7,000)
                    </p>
                  </div>
                </div>
                <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: rgba(255, 255, 255, 0.8);">
                  Protect your name before damage happens. 24/7 monitoring of your reputation across the entire internet, including dark web. Catch threats early, respond fast, maintain the reputation you've built.
                </p>
                <div style="background: rgba(0, 0, 0, 0.3); border-radius: 8px; padding: 16px;">
                  <p style="margin: 0 0 12px; font-size: 13px; color: rgba(255, 255, 255, 0.6); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                    You Get:
                  </p>
                  <ul style="margin: 0; padding: 0 0 0 20px; list-style: none;">
                    <li style="margin: 0 0 8px; font-size: 14px; color: rgba(255, 255, 255, 0.8); position: relative; padding-left: 20px;">
                      <span style="position: absolute; left: 0; color: #10b981;">✓</span> Real-time alerts for reputation threats
                    </li>
                    <li style="margin: 0 0 8px; font-size: 14px; color: rgba(255, 255, 255, 0.8); position: relative; padding-left: 20px;">
                      <span style="position: absolute; left: 0; color: #10b981;">✓</span> Dark web monitoring for leaked data
                    </li>
                    <li style="margin: 0 0 8px; font-size: 14px; color: rgba(255, 255, 255, 0.8); position: relative; padding-left: 20px;">
                      <span style="position: absolute; left: 0; color: #10b981;">✓</span> Sentiment analysis & trend tracking
                    </li>
                    <li style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.8); position: relative; padding-left: 20px;">
                      <span style="position: absolute; left: 0; color: #10b981;">✓</span> Automated takedown assistance
                    </li>
                  </ul>
                </div>
              </div>
              
              <!-- Service 3 -->
              <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.05)); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                <div style="display: flex; align-items: flex-start; margin-bottom: 16px;">
                  <div style="width: 48px; height: 48px; background: rgba(139, 92, 246, 0.2); border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; margin-right: 16px; flex-shrink: 0;">
                    <span style="font-size: 24px;">💎</span>
                  </div>
                  <div>
                    <h3 style="margin: 0 0 8px; font-size: 20px; font-weight: 700; color: #ffffff;">
                      Deal Flow Alert Service
                    </h3>
                    <p style="margin: 0 0 4px; font-size: 14px; color: #a78bfa; font-weight: 600;">
                      Elite Member Price: $2,000/month (normally $3,000)
                    </p>
                  </div>
                </div>
                <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: rgba(255, 255, 255, 0.8);">
                  See investment opportunities before they're public. Weekly curated deals with AI-powered analysis: pre-IPO companies, private real estate, business acquisitions, distressed luxury assets.
                </p>
                <div style="background: rgba(0, 0, 0, 0.3); border-radius: 8px; padding: 16px;">
                  <p style="margin: 0 0 12px; font-size: 13px; color: rgba(255, 255, 255, 0.6); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                    You Get:
                  </p>
                  <ul style="margin: 0; padding: 0 0 0 20px; list-style: none;">
                    <li style="margin: 0 0 8px; font-size: 14px; color: rgba(255, 255, 255, 0.8); position: relative; padding-left: 20px;">
                      <span style="position: absolute; left: 0; color: #10b981;">✓</span> Weekly curated investment opportunities
                    </li>
                    <li style="margin: 0 0 8px; font-size: 14px; color: rgba(255, 255, 255, 0.8); position: relative; padding-left: 20px;">
                      <span style="position: absolute; left: 0; color: #10b981;">✓</span> AI-powered deal analysis & scoring
                    </li>
                    <li style="margin: 0 0 8px; font-size: 14px; color: rgba(255, 255, 255, 0.8); position: relative; padding-left: 20px;">
                      <span style="position: absolute; left: 0; color: #10b981;">✓</span> Pre-public and exclusive deals
                    </li>
                    <li style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.8); position: relative; padding-left: 20px;">
                      <span style="position: absolute; left: 0; color: #10b981;">✓</span> Member-only deal commentary
                    </li>
                  </ul>
                </div>
              </div>
              
              <!-- Bundle Offer -->
              <div style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.05)); border: 2px solid rgba(212, 175, 55, 0.4); border-radius: 12px; padding: 24px; margin-bottom: 30px; text-align: center;">
                <h3 style="margin: 0 0 12px; font-size: 22px; font-weight: 700; color: #D4AF37;">
                  Elite Member Bundle
                </h3>
                <p style="margin: 0 0 16px; font-size: 15px; color: rgba(255, 255, 255, 0.8);">
                  Get all 3 AI services for <strong style="color: #ffffff;">$14,000/month</strong> (save $2,000/month)
                </p>
                <p style="margin: 0 0 20px; font-size: 14px; color: rgba(255, 255, 255, 0.6);">
                  Or prepay annually: <strong style="color: #D4AF37;">$150,000/year</strong> (save $18,000)
                </p>
                <a href="${APP_URL}/dashboard/ai-services" style="display: inline-block; background: linear-gradient(135deg, #D4AF37, #C9A131); color: #000000; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);">
                  Learn More →
                </a>
              </div>
              
              <!-- Why Elite -->
              <div style="background: rgba(139, 92, 246, 0.05); border-left: 3px solid #8b5cf6; padding: 16px 20px; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.9);">
                  <strong style="color: #a78bfa;">Why Elite Members Get Early Access:</strong><br/>
                  These AI services typically cost $10K-15K/month each. As an Elite Member, you get 20-33% discounts plus priority access before we open to the wider network. Your $9,997/year Circle membership just unlocked $62,000/year in savings.
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background: rgba(0, 0, 0, 0.3); border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
              <p style="margin: 0 0 8px; font-size: 13px; color: rgba(255, 255, 255, 0.9);">
                Questions about AI Services?
              </p>
              <p style="margin: 0 0 16px; font-size: 14px; color: #D4AF37;">
                Reply to this email or book a call: <a href="${APP_URL}/contact" style="color: #D4AF37; text-decoration: none;">Contact Us</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.4);">
                Circle Network © 2025
              </p>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `,
  
  text: `
${membershipTier} MEMBER EXCLUSIVE

Introducing Circle AI Services
Enterprise-grade AI tools exclusively for our Elite members

Hi ${firstName},

As an ${membershipTier} Member, you get first access to Circle AI Services—enterprise-grade AI tools designed specifically for high-net-worth professionals.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. AI COMPETITIVE INTELLIGENCE
Elite Member Price: $8,000/month (normally $10,000)

Know what your competitors are doing BEFORE they do it. Our AI monitors 10,000+ data sources 24/7.

You Get:
✓ Daily competitive intelligence briefs
✓ Weekly strategic analysis reports
✓ Real-time alerts for major moves
✓ Custom competitor monitoring dashboard

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. AI REPUTATION GUARDIAN
Elite Member Price: $6,000/month (normally $7,000)

Protect your name before damage happens. 24/7 monitoring across the entire internet, including dark web.

You Get:
✓ Real-time alerts for reputation threats
✓ Dark web monitoring for leaked data
✓ Sentiment analysis & trend tracking
✓ Automated takedown assistance

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. DEAL FLOW ALERT SERVICE
Elite Member Price: $2,000/month (normally $3,000)

See investment opportunities before they're public. Weekly curated deals with AI analysis.

You Get:
✓ Weekly curated investment opportunities
✓ AI-powered deal analysis & scoring
✓ Pre-public and exclusive deals
✓ Member-only deal commentary

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ELITE MEMBER BUNDLE
All 3 AI services: $14,000/month (save $2,000/month)
Annual prepay: $150,000/year (save $18,000)

Learn more: ${APP_URL}/dashboard/ai-services

WHY ELITE MEMBERS GET EARLY ACCESS:
These services typically cost $10K-15K/month each. As an Elite Member, you get 20-33% discounts plus priority access. Your $9,997/year Circle membership just unlocked $62,000/year in savings.

Questions? Reply to this email.

— The Circle Network Team
  `
});

// Export all templates
export default {
  invitationEmail,
  welcomeEmail,
  aiServicesTeaser
};
