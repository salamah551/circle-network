export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';


// Email template functions
function getEmailTemplate(sequenceStage, recipient, trackingPixel, unsubscribeUrl) {
  const templates = [
    getEmail1Template,
    getEmail2Template,
    getEmail3Template,
    getEmail4Template
  ];
  
  return templates[sequenceStage](recipient, trackingPixel, unsubscribeUrl);
}

function getEmail1Template(recipient, trackingPixel, unsubscribeUrl) {
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}?email=${encodeURIComponent(recipient.email)}&code=${recipient.invite_code}`;
  
  return {
    subject: `${recipient.first_name}, you're invited to join The Circle`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #000000; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #000000;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px;">
          
          <!-- Header -->
          <tr>
            <td style="text-align: center; padding-bottom: 40px;">
              <div style="width: 60px; height: 60px; margin: 0 auto 20px;">
                <svg width="60" height="60" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="22" stroke="#D4AF37" stroke-width="2.5" fill="none"/>
                  <circle cx="24" cy="24" r="14" stroke="#D4AF37" stroke-width="2" fill="none"/>
                  <circle cx="24" cy="24" r="7" fill="#D4AF37"/>
                </svg>
              </div>
              <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #D4AF37;">The Circle</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #9ca3af;">Where Ambitious Founders Stop Building Alone</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(139, 92, 246, 0.1)); border: 1px solid #27272a; border-radius: 16px; padding: 40px;">
              
              <p style="margin: 0 0 24px 0; font-size: 18px; line-height: 1.6; color: #ffffff;">Hi ${recipient.first_name},</p>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #d1d5db;">
                I'm reaching out because you're exactly the type of founder we're looking for.
              </p>

              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #d1d5db;">
                <strong style="color: #ffffff;">The Circle</strong> is an exclusive network of <strong style="color: #F59E0B;">500 ambitious founders</strong> who are tired of:
              </p>

              <ul style="margin: 0 0 24px 0; padding-left: 20px; color: #d1d5db; font-size: 16px; line-height: 1.8;">
                <li>Cold LinkedIn DMs that go nowhere</li>
                <li>Dead Slack groups with zero engagement</li>
                <li>Networking events where everyone's scanning for someone "more important"</li>
                <li>Building in isolation without real support</li>
              </ul>

              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #d1d5db;">
                Instead, you get:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #3f3f46;">
                    <span style="color: #10b981; font-size: 18px; margin-right: 8px;">✓</span>
                    <span style="color: #ffffff; font-weight: 600;">Warm intros that close deals</span>
                    <div style="color: #9ca3af; font-size: 14px; margin-top: 4px; margin-left: 26px;">Connect with founders who actually help</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #3f3f46;">
                    <span style="color: #10b981; font-size: 18px; margin-right: 8px;">✓</span>
                    <span style="color: #ffffff; font-weight: 600;">Responses in hours, not days</span>
                    <div style="color: #9ca3af; font-size: 14px; margin-top: 4px; margin-left: 26px;">Average response time under 2 hours</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #3f3f46;">
                    <span style="color: #10b981; font-size: 18px; margin-right: 8px;">✓</span>
                    <span style="color: #ffffff; font-weight: 600;">Curated, active community</span>
                    <div style="color: #9ca3af; font-size: 14px; margin-top: 4px; margin-left: 26px;">Every member is personally vetted</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <span style="color: #10b981; font-size: 18px; margin-right: 8px;">✓</span>
                    <span style="color: #ffffff; font-weight: 600;">Real partnerships that scale</span>
                    <div style="color: #9ca3af; font-size: 14px; margin-top: 4px; margin-left: 26px;">Investor intros, co-founders, key hires</div>
                  </td>
                </tr>
              </table>

              <!-- Founding Member Offer -->
              <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1)); border: 2px solid #F59E0B; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                <div style="text-align: center; margin-bottom: 16px;">
                  <span style="display: inline-block; background: #F59E0B; color: #000000; font-weight: bold; font-size: 12px; padding: 6px 12px; border-radius: 20px; letter-spacing: 0.5px;">FOUNDING MEMBER</span>
                </div>
                <p style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: #ffffff; text-align: center;">
                  Lock in <span style="color: #F59E0B;">$199/month forever</span>
                </p>
                <p style="margin: 0; font-size: 14px; color: #d1d5db; text-align: center;">
                  First 500 founding members only • Regular price: $249/mo<br/>
                  <strong style="color: #10b981;">Save $600/year for life</strong>
                </p>
              </div>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #F59E0B, #D97706); color: #000000; text-decoration: none; font-weight: bold; font-size: 18px; padding: 18px 48px; border-radius: 12px; box-shadow: 0 10px 40px rgba(245, 158, 11, 0.3);">
                      Claim Your Founding Spot →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 1.6; color: #9ca3af; text-align: center;">
                Your exclusive invite code: <strong style="color: #F59E0B; font-family: monospace;">${recipient.invite_code}</strong>
              </p>

            </td>
          </tr>

          <!-- Social Proof -->
          <tr>
            <td style="padding: 40px 0 0 0;">
              <div style="background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 24px;">
                <p style="margin: 0 0 16px 0; font-size: 14px; color: #9ca3af; font-style: italic; line-height: 1.6;">
                  "Made a post about struggling with CAC. Three founders shared their exact playbooks. Cut our acquisition cost by 40% in 6 weeks."
                </p>
                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                  <strong style="color: #ffffff;">— John Chen</strong>, E-commerce Founder
                </p>
              </div>
            </td>
          </tr>

          <!-- Why Now -->
          <tr>
            <td style="padding: 40px 0;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: bold; color: #ffffff;">Why This Matters</h2>
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #d1d5db;">
                We're limiting The Circle to <strong style="color: #F59E0B;">500 founding members</strong> who lock in $199/mo forever.
              </p>
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #d1d5db;">
                After that? Regular members pay <strong>$249/mo</strong> with no price lock guarantee.
              </p>
              <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #d1d5db;">
                This isn't artificial scarcity. It's intentional curation to keep the community intimate, active, and valuable.
              </p>
            </td>
          </tr>

          <!-- Final CTA -->
          <tr>
            <td style="text-align: center; padding: 20px 0 40px 0;">
              <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; padding: 14px 32px; border-radius: 8px;">
                Join The Circle Now
              </a>
              <p style="margin: 16px 0 0 0; font-size: 13px; color: #6b7280;">
                30-day money-back guarantee • Cancel anytime
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid #27272a; padding: 32px 0; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #ffffff; font-weight: 600;">The Circle Network</p>
              <p style="margin: 0 0 16px 0; font-size: 13px; color: #6b7280;">
                13114 Willow Stream Lane<br/>
                Fairfax, VA 22033
              </p>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                <a href="${unsubscribeUrl}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
  ${trackingPixel}
</body>
</html>
    `
  };
}

function getEmail2Template(recipient, trackingPixel, unsubscribeUrl) {
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}?email=${encodeURIComponent(recipient.email)}&code=${recipient.invite_code}`;
  
  return {
    subject: `${recipient.first_name}, 387 founders have already joined`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #000000; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #000000;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px;">
          
          <!-- Header -->
          <tr>
            <td style="text-align: center; padding-bottom: 30px;">
              <div style="width: 50px; height: 50px; margin: 0 auto 16px;">
                <svg width="50" height="50" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="22" stroke="#D4AF37" stroke-width="2.5" fill="none"/>
                  <circle cx="24" cy="24" r="14" stroke="#D4AF37" stroke-width="2" fill="none"/>
                  <circle cx="24" cy="24" r="7" fill="#D4AF37"/>
                </svg>
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #D4AF37;">The Circle</h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 0 0 40px 0;">
              
              <p style="margin: 0 0 24px 0; font-size: 17px; color: #ffffff;">Hi ${recipient.first_name},</p>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #d1d5db;">
                Quick update: <strong style="color: #F59E0B;">387 founders</strong> have already claimed their founding member spots in The Circle.
              </p>

              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #d1d5db;">
                That leaves <strong style="color: #10b981;">113 spots</strong> at the locked $199/mo rate.
              </p>

              <!-- Urgency Box -->
              <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1)); border: 2px solid #ef4444; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                <p style="margin: 0 0 12px 0; font-size: 18px; font-weight: bold; color: #ef4444; text-align: center;">
                  ⏰ The Math is Simple
                </p>
                <p style="margin: 0; font-size: 15px; color: #d1d5db; text-align: center; line-height: 1.6;">
                  Once we hit 500 founding members, the rate jumps to $249/mo.<br/>
                  That's <strong style="color: #ffffff;">$600/year more</strong> if you wait.
                </p>
              </div>

              <!-- What's Happening Inside -->
              <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: bold; color: #ffffff;">What's Happening Inside Right Now</h2>
              
              <div style="background: #18181b; border-left: 3px solid #10b981; padding: 16px 20px; margin-bottom: 16px; border-radius: 4px;">
                <p style="margin: 0 0 8px 0; font-size: 15px; color: #ffffff; font-weight: 600;">Sarah K. just got funded</p>
                <p style="margin: 0; font-size: 14px; color: #9ca3af; line-height: 1.5;">
                  Posted about needing investor intros on Monday. Connected with the right VC by Wednesday. Term sheet by Friday.
                </p>
              </div>

              <div style="background: #18181b; border-left: 3px solid #8b5cf6; padding: 16px 20px; margin-bottom: 16px; border-radius: 4px;">
                <p style="margin: 0 0 8px 0; font-size: 15px; color: #ffffff; font-weight: 600;">Marcus T. solved his hiring problem</p>
                <p style="margin: 0; font-size: 14px; color: #9ca3af; line-height: 1.5;">
                  Posted a hiring question at 9am. Had 8 qualified responses by lunch. Made the hire by Friday.
                </p>
              </div>

              <div style="background: #18181b; border-left: 3px solid #F59E0B; padding: 16px 20px; margin-bottom: 32px; border-radius: 4px;">
                <p style="margin: 0 0 8px 0; font-size: 15px; color: #ffffff; font-weight: 600;">Lisa R. found her co-founder</p>
                <p style="margin: 0; font-size: 14px; color: #9ca3af; line-height: 1.5;">
                  Met at a Circle dinner. Started working together. Closed their seed round 6 months later.
                </p>
              </div>

              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #d1d5db;">
                This is what happens when founders <strong style="color: #ffffff;">actually show up for each other.</strong>
              </p>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #F59E0B, #D97706); color: #000000; text-decoration: none; font-weight: bold; font-size: 18px; padding: 18px 48px; border-radius: 12px; box-shadow: 0 10px 40px rgba(245, 158, 11, 0.3);">
                      Lock In $199/Mo Forever →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 1.6; color: #9ca3af; text-align: center;">
                Your invite code: <strong style="color: #F59E0B; font-family: monospace;">${recipient.invite_code}</strong>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid #27272a; padding: 32px 0; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #ffffff; font-weight: 600;">The Circle Network</p>
              <p style="margin: 0 0 16px 0; font-size: 13px; color: #6b7280;">
                13114 Willow Stream Lane, Fairfax, VA 22033
              </p>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                <a href="${unsubscribeUrl}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
  ${trackingPixel}
</body>
</html>
    `
  };
}

function getEmail3Template(recipient, trackingPixel, unsubscribeUrl) {
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}?email=${encodeURIComponent(recipient.email)}&code=${recipient.invite_code}`;
  
  return {
    subject: `Final call: Your founding member spot expires soon`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #000000; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #000000;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px;">
          
          <!-- Header -->
          <tr>
            <td style="text-align: center; padding-bottom: 30px;">
              <div style="width: 50px; height: 50px; margin: 0 auto 16px;">
                <svg width="50" height="50" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="22" stroke="#ef4444" stroke-width="2.5" fill="none"/>
                  <circle cx="24" cy="24" r="14" stroke="#ef4444" stroke-width="2" fill="none"/>
                  <circle cx="24" cy="24" r="7" fill="#ef4444"/>
                </svg>
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #ef4444;">Last Chance</h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 0 0 40px 0;">
              
              <p style="margin: 0 0 24px 0; font-size: 17px; color: #ffffff;">${recipient.first_name},</p>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #d1d5db;">
                I'll be direct: <strong style="color: #ef4444;">This is your last email about The Circle.</strong>
              </p>

              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #d1d5db;">
                We're down to <strong style="color: #F59E0B;">less than 50 founding member spots</strong> at the locked $199/mo rate.
              </p>

              <!-- Urgency Box -->
              <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2)); border: 3px solid #ef4444; border-radius: 12px; padding: 32px; margin-bottom: 32px; text-align: center;">
                <p style="margin: 0 0 16px 0; font-size: 28px; font-weight: bold; color: #ef4444;">
                  $600/Year Savings
                </p>
                <p style="margin: 0 0 20px 0; font-size: 16px; color: #ffffff;">
                  Once we hit 500 founding members, this offer disappears forever.
                </p>
                <div style="background: rgba(0,0,0,0.5); border-radius: 8px; padding: 16px;">
                  <table width="100%" cellpadding="8" cellspacing="0" border="0" style="text-align: left;">
                    <tr style="border-bottom: 1px solid #3f3f46;">
                      <td style="color: #9ca3af; font-size: 14px;">Founding Member:</td>
                      <td style="color: #10b981; font-size: 16px; font-weight: bold; text-align: right;">$199/mo locked forever</td>
                    </tr>
                    <tr>
                      <td style="color: #9ca3af; font-size: 14px; padding-top: 12px;">Regular Member:</td>
                      <td style="color: #ef4444; font-size: 16px; font-weight: bold; text-align: right; padding-top: 12px;">$249/mo (no lock)</td>
                    </tr>
                  </table>
                </div>
              </div>

              <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: bold; color: #ffffff;">What You're Walking Away From</h2>
              
              <ul style="margin: 0 0 32px 0; padding-left: 20px; color: #d1d5db; font-size: 15px; line-height: 1.8;">
                <li style="margin-bottom: 12px;">A network that actually responds (avg. 2 hour response time)</li>
                <li style="margin-bottom: 12px;">Founders who close real deals, not just "let's circle back"</li>
                <li style="margin-bottom: 12px;">Introductions to investors, co-founders, key hires</li>
                <li style="margin-bottom: 12px;">Events where meaningful partnerships actually form</li>
                <li style="margin-bottom: 12px;">$600/year in savings by joining now vs. waiting</li>
              </ul>

              <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #d1d5db;">
                I'm not going to keep emailing you. Either you see the value or you don't.
              </p>

              <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #ffffff; font-weight: 600;">
                But if you're tired of building alone, this is your moment.
              </p>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #ef4444, #dc2626); color: #ffffff; text-decoration: none; font-weight: bold; font-size: 20px; padding: 18px 48px; border-radius: 12px; box-shadow: 0 10px 40px rgba(239, 68, 68, 0.4);">
                      Secure My Founding Spot Now →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 1.6; color: #9ca3af; text-align: center;">
                Your invite code: <strong style="color: #ef4444; font-family: monospace;">${recipient.invite_code}</strong>
              </p>

            </td>
          </tr>

          <!-- P.S. -->
          <tr>
            <td style="background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 24px; margin-bottom: 40px;">
              <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #ffffff;">P.S.</p>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #d1d5db; font-style: italic;">
                Still not sure? We have a 30-day money-back guarantee. Try it. If you don't get tangible value, I'll refund you personally. No questions. No hard feelings.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid #27272a; padding: 32px 0; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #ffffff; font-weight: 600;">The Circle Network</p>
              <p style="margin: 0 0 16px 0; font-size: 13px; color: #6b7280;">
                13114 Willow Stream Lane, Fairfax, VA 22033
              </p>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                <a href="${unsubscribeUrl}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
  ${trackingPixel}
</body>
</html>
    `
  };
}

function getEmail4Template(recipient, trackingPixel, unsubscribeUrl) {
  const waitlistUrl = `${process.env.NEXT_PUBLIC_APP_URL}/waitlist?email=${encodeURIComponent(recipient.email)}`;
  
  return {
    subject: `${recipient.first_name}, we'll save you a spot on the waitlist`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #000000; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #000000;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px;">
          
          <!-- Header -->
          <tr>
            <td style="text-align: center; padding-bottom: 30px;">
              <div style="width: 50px; height: 50px; margin: 0 auto 16px;">
                <svg width="50" height="50" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="22" stroke="#D4AF37" stroke-width="2.5" fill="none"/>
                  <circle cx="24" cy="24" r="14" stroke="#D4AF37" stroke-width="2" fill="none"/>
                  <circle cx="24" cy="24" r="7" fill="#D4AF37"/>
                </svg>
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #D4AF37;">The Circle</h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 0 0 40px 0;">
              
              <p style="margin: 0 0 24px 0; font-size: 17px; color: #ffffff;">Hi ${recipient.first_name},</p>
              
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #d1d5db;">
                I understand The Circle might not be right for you right now.
              </p>

              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #d1d5db;">
                Maybe it's timing. Maybe it's budget. Maybe you're just not convinced yet.
              </p>

              <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #d1d5db;">
                That's completely fine.
              </p>

              <!-- Waitlist Option -->
              <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1)); border: 2px solid #10b981; border-radius: 12px; padding: 32px; margin-bottom: 32px;">
                <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: bold; color: #10b981; text-align: center;">
                  Join Our Waitlist Instead
                </h2>
                <p style="margin: 0 0 20px 0; font-size: 15px; color: #d1d5db; text-align: center; line-height: 1.6;">
                  Stay connected. Get updates. See what members are achieving.<br/>
                  When you're ready, you'll be first in line.
                </p>
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center">
                      <a href="${waitlistUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px; padding: 14px 32px; border-radius: 8px;">
                        Join Waitlist (Free)
                      </a>
                    </td>
                  </tr>
                </table>
              </div>

              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #d1d5db;">
                Here's what happens next:
              </p>

              <ul style="margin: 0 0 32px 0; padding-left: 20px; color: #d1d5db; font-size: 15px; line-height: 1.8;">
                <li style="margin-bottom: 12px;">We'll send you monthly updates about The Circle</li>
                <li style="margin-bottom: 12px;">You'll see real results from actual members</li>
                <li style="margin-bottom: 12px;">When you're ready, you can join (if spots are available)</li>
                <li style="margin-bottom: 12px;">No pressure. No spam. Just valuable updates.</li>
              </ul>

              <!-- Honesty Section -->
              <div style="background: #18181b; border-left: 3px solid #F59E0B; padding: 20px; margin-bottom: 32px; border-radius: 4px;">
                <p style="margin: 0 0 12px 0; font-size: 15px; font-weight: 600; color: #ffffff;">I'll be honest with you:</p>
                <p style="margin: 0; font-size: 14px; color: #d1d5db; line-height: 1.6;">
                  The founding member rate ($199/mo) is gone once we hit 500 founding members. If you join later, you'll pay the regular rate of $249/mo. But that's okay—the value is still there, and you can decide when you're ready.
                </p>
              </div>

              <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #d1d5db;">
                Either way, I appreciate you taking the time to consider The Circle.
              </p>

              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #ffffff;">
                Good luck with your venture,<br/>
                <strong>The Circle Network Team</strong>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid #27272a; padding: 32px 0; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #ffffff; font-weight: 600;">The Circle Network</p>
              <p style="margin: 0 0 16px 0; font-size: 13px; color: #6b7280;">
                13114 Willow Stream Lane, Fairfax, VA 22033
              </p>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                <a href="${unsubscribeUrl}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
  ${trackingPixel}
</body>
</html>
    `
  };
}

export async function POST(request) {
  // Initialize at runtime
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  try {
    const { campaignId } = await request.json();

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID required' },
        { status: 400 }
      );
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('bulk_invite_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Check daily limit
    const today = new Date().toISOString().split('T')[0];
    if (campaign.last_send_date === today) {
      return NextResponse.json(
        { error: 'Daily limit already reached for today' },
        { status: 429 }
      );
    }

    // Get recipients ready to send
    const { data: recipients, error: recipientsError } = await supabaseAdmin
      .from('bulk_invite_recipients')
      .select('*')
      .eq('campaign_id', campaignId)
      .in('status', ['pending', 'sent', 'opened', 'clicked'])
      .lte('next_email_scheduled', new Date().toISOString())
      .lt('sequence_stage', 4)
      .limit(campaign.daily_limit);

    if (recipientsError) {
      console.error('Recipients error:', recipientsError);
      return NextResponse.json(
        { error: 'Failed to get recipients' },
        { status: 500 }
      );
    }

    if (!recipients || recipients.length === 0) {
      return NextResponse.json({ 
        success: true, 
        sent: 0,
        message: 'No recipients ready to send'
      });
    }

    // Send emails
    let sentCount = 0;
    for (const recipient of recipients) {
      try {
        const trackingPixel = `<img src="${process.env.NEXT_PUBLIC_APP_URL}/api/bulk-invites/track?rid=${recipient.id}&type=open" width="1" height="1" alt="" />`;
        const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe/${recipient.id}`;
        
        const emailTemplate = getEmailTemplate(
          recipient.sequence_stage,
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
              email: 'invite@thecirclenetwork.org',
              name: 'The Circle Network'
            },
            content: [{
              type: 'text/html',
              value: emailTemplate.html
            }]
          })
        });

        if (sendGridResponse.ok) {
          // Calculate next email time
          const daysUntilNext = [3, 4, 7][recipient.sequence_stage] || null;
          const nextEmailScheduled = daysUntilNext 
            ? new Date(Date.now() + daysUntilNext * 24 * 60 * 60 * 1000)
            : null;

          // Update recipient
          await supabaseAdmin
            .from('bulk_invite_recipients')
            .update({
              status: 'sent',
              sequence_stage: recipient.sequence_stage + 1,
              last_email_sent: new Date().toISOString(),
              next_email_scheduled: nextEmailScheduled
            })
            .eq('id', recipient.id);

          sentCount++;
        }
      } catch (emailError) {
        console.error(`Failed to send to ${recipient.email}:`, emailError);
      }
    }

    // Update campaign
    await supabaseAdmin
      .from('bulk_invite_campaigns')
      .update({
        status: 'active',
        total_sent: campaign.total_sent + sentCount,
        last_send_date: today
      })
      .eq('id', campaignId);

    return NextResponse.json({
      success: true,
      sent: sentCount,
      message: `Successfully sent ${sentCount} emails`
    });

  } catch (error) {
    console.error('Send error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}