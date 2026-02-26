// lib/sendgrid.js
import { escapeHtml } from './email-utils.js';
import sgMail from '@sendgrid/mail';
import { FOUNDING_OFFER } from './pricing';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'invite@thecirclenetwork.org';
const FROM_NAME = 'Shehab Salamah - The Circle Network';

export const sendInvitationEmail = async ({ to, name, inviteCode, reason }) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('SendGrid API key not configured');
    return { success: false, error: new Error('Email service not configured') };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thecirclenetwork.org';
  const unsubscribeUrl = `${appUrl}/unsubscribe?email=${encodeURIComponent(to)}&token=${inviteCode}`;
  
  const msg = {
    to,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `${name}, you've been invited to The Circle Network`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background: #000; padding: 30px; text-align: center; }
          .logo { color: #D4AF37; font-size: 24px; font-weight: bold; }
          .content { padding: 40px 30px; background: #fff; }
          .cta-button { display: inline-block; background: linear-gradient(to right, #D4AF37, #C5A028); color: #000; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .invite-code { background: #f5f5f5; padding: 15px; border-left: 4px solid #D4AF37; margin: 20px 0; font-family: monospace; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">THE CIRCLE NETWORK</div>
          <div style="color: #D4AF37; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">Invitation Only</div>
        </div>
        
        <div class="content">
          <p>Hi ${escapeHtml(name)},</p>
          
          <p>I'm Shehab Salamah, and I'm reaching out because I think you'd be a perfect fit for something I'm building.</p>
          
          <p><strong>The Circle Network</strong> is an invite-only community of 100 high-performing professionals across finance, tech, consulting, and commerce who help each other win.</p>
          
          <div class="invite-code">
            Your invitation code: <strong>${escapeHtml(inviteCode)}</strong>
          </div>
          
          <p style="color: #D4AF37; font-weight: bold;">This invitation expires in 7 days.</p>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/invite/accept?code=${inviteCode}&email=${encodeURIComponent(to)}" class="cta-button">Accept Your Invitation →</a>
          </div>
          
          <p>Looking forward to having you,<br>
          <strong>Shehab Salamah</strong><br>
          Founder, The Circle Network</p>
          
          <p style="margin-top: 30px; font-size: 11px; color: #999; text-align: center;">
            <a href="${unsubscribeUrl}" style="color: #999; text-decoration: underline;">Unsubscribe</a>
          </p>
        </div>
      </body>
      </html>
    `,
    headers: {
      'List-Unsubscribe': `<mailto:invites@thecirclenetwork.org?subject=unsubscribe>, <${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
    }
  };

  try {
    await sgMail.send(msg);
    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

export default { sendInvitationEmail };
export const sendNewMessageEmail = async ({ to, recipientName, senderName, messagePreview }) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('SendGrid API key not configured');
    return { success: false, error: new Error('Email service not configured') };
  }

  const msg = {
    to,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `New message from ${escapeHtml(senderName)} - The Circle Network`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background: #000; padding: 30px; text-align: center; }
          .logo { color: #D4AF37; font-size: 24px; font-weight: bold; }
          .content { padding: 40px 30px; background: #fff; }
          .cta-button { display: inline-block; background: linear-gradient(to right, #D4AF37, #C5A028); color: #000; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .message-preview { background: #f5f5f5; padding: 20px; border-left: 4px solid #D4AF37; margin: 20px 0; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">THE CIRCLE NETWORK</div>
        </div>
        
        <div class="content">
          <p>Hi ${escapeHtml(recipientName)},</p>
          
          <p><strong>${escapeHtml(senderName)}</strong> sent you a message on The Circle Network:</p>
          
          <div class="message-preview">
            "${escapeHtml(messagePreview)}..."
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/messages" class="cta-button">View Message →</a>
          </div>
          
          <p style="color: #666; font-size: 12px;">You're receiving this because you're a member of The Circle Network. You can manage your notification preferences in your settings.</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await sgMail.send(msg);
    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending message notification email:', error);
    return { success: false, error };
  }
};

export const sendRequestReplyEmail = async ({ to, recipientName, replierName, requestTitle, replyPreview }) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('SendGrid API key not configured');
    return { success: false, error: new Error('Email service not configured') };
  }

  const msg = {
    to,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `${escapeHtml(replierName)} replied to your request - The Circle Network`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background: #000; padding: 30px; text-align: center; }
          .logo { color: #D4AF37; font-size: 24px; font-weight: bold; }
          .content { padding: 40px 30px; background: #fff; }
          .cta-button { display: inline-block; background: linear-gradient(to right, #D4AF37, #C5A028); color: #000; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .request-title { background: #f5f5f5; padding: 15px; border-left: 4px solid #D4AF37; margin: 15px 0; font-weight: bold; }
          .reply-preview { background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">THE CIRCLE NETWORK</div>
        </div>
        
        <div class="content">
          <p>Hi ${escapeHtml(recipientName)},</p>
          
          <p><strong>${escapeHtml(replierName)}</strong> replied to your request:</p>
          
          <div class="request-title">
            ${escapeHtml(requestTitle)}
          </div>
          
          <div class="reply-preview">
            "${escapeHtml(replyPreview)}..."
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/requests" class="cta-button">View Reply →</a>
          </div>
          
          <p style="color: #666; font-size: 12px;">You're receiving this because you're a member of The Circle Network. You can manage your notification preferences in your settings.</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await sgMail.send(msg);
    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending request reply notification email:', error);
    return { success: false, error };
  }
};

export const sendFoundingMemberWelcomeEmail = async ({ to, name, isFoundingMember }) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('SendGrid API key not configured');
    return { success: false, error: new Error('Email service not configured') };
  }

  const foundingPrice = `$${(FOUNDING_OFFER.priceMonthlyCents / 100).toFixed(0)}/mo`;
  const msg = {
    to,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `Welcome to The Circle Network${isFoundingMember ? ' - Founding Member 🎉' : ''}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background: #000; padding: 30px; text-align: center; }
          .logo { color: #D4AF37; font-size: 24px; font-weight: bold; }
          .content { padding: 40px 30px; background: #fff; }
          .cta-button { display: inline-block; background: linear-gradient(to right, #D4AF37, #C5A028); color: #000; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .badge { background: linear-gradient(to right, #10B981, #D4AF37); color: #fff; padding: 12px 24px; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
          .feature-box { background: #f5f5f5; padding: 20px; border-left: 4px solid #D4AF37; margin: 20px 0; }
          .guarantee-box { background: #10B981; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">THE CIRCLE NETWORK</div>
          ${isFoundingMember ? '<div style="color: #D4AF37; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">Founding Member</div>' : ''}
        </div>
        
        <div class="content">
          <p>Hi ${escapeHtml(name)},</p>
          
          <p>Welcome to The Circle Network! 🎉</p>
          
          ${isFoundingMember ? `
            <div class="badge">
              🏆 FOUNDING 50 MEMBER
            </div>
            
            <p><strong>Congratulations on securing your spot as one of our first 50 Founding Members.</strong></p>
            
            <p>You're now part of an exclusive group that will shape the future of this community. Your founding member price of <strong>${foundingPrice}</strong> is locked in forever.</p>
            
            <div class="feature-box">
              <h3 style="margin-top: 0; color: #D4AF37;">Your Founding Member Benefits:</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li><strong>Founding Price Lock:</strong> ${foundingPrice} forever</li>
                <li><strong>Founding Member Badge:</strong> Permanent recognition and status</li>
                <li><strong>Priority Access:</strong> First access to all new features and AI tools</li>
                <li><strong>5 Priority Invites:</strong> Bring your network with priority processing</li>
                <li><strong>Founding Strategy Sessions:</strong> Exclusive events with fellow founders</li>
                <li><strong>Shape the Platform:</strong> Direct input on features and direction</li>
              </ul>
            </div>
          ` : `
            <p><strong>You're now part of an elite community of high-achieving professionals.</strong></p>
            
            <p>Circle Network is where meaningful connections turn into real results—partnerships, deals, funding, and growth opportunities.</p>
          `}
          
          <div class="guarantee-box">
            <h3 style="margin-top: 0;">Our Guarantees to You:</h3>
            <p style="margin: 10px 0;"><strong>✓ 30-Day Money-Back Guarantee</strong><br>
            If we don't deliver meaningful value in your first 30 days, we'll refund your membership fee in full. No questions asked.</p>
            
            <p style="margin: 10px 0;"><strong>✓ 3 Wins in 90 Days — Or +3 Months Free</strong><br>
            If you don't achieve at least 3 meaningful wins (valuable introductions, partnerships, or opportunities) within 90 days, we'll extend your membership by 3 months at no charge.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="cta-button">Access Your Dashboard →</a>
          </div>
          
          <div class="feature-box">
            <h3 style="margin-top: 0;">Get Started:</h3>
            <ol style="margin: 10px 0; padding-left: 20px;">
              <li><strong>Complete Your Profile:</strong> Add your background, expertise, and what you're looking for</li>
              <li><strong>Browse Members:</strong> Explore our curated directory of professionals</li>
              <li><strong>Join Conversations:</strong> Engage in the feed and request threads</li>
              <li><strong>Get Introduced:</strong> Our AI will match you with relevant connections every Monday</li>
            </ol>
          </div>
          
          <p>We're thrilled to have you here. Let's make great things happen together.</p>
          
          <p>To your success,<br>
          <strong>Shehab Salamah</strong><br>
          Founder, The Circle Network</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">Questions? Reply to this email or reach out at support@thecirclenetwork.org</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await sgMail.send(msg);
    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending founding member welcome email:', error);
    return { success: false, error };
  }
};

// ─── Welcome Drip Email Sequence ─────────────────────────────────────────────

const EMAIL_STYLES = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
  .header { background: #000; padding: 30px; text-align: center; }
  .logo { color: #D4AF37; font-size: 24px; font-weight: bold; }
  .content { padding: 40px 30px; background: #fff; }
  .cta-button { display: inline-block; background: linear-gradient(to right, #D4AF37, #C5A028); color: #000; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
  .highlight-box { background: #f5f5f5; padding: 20px; border-left: 4px solid #D4AF37; margin: 20px 0; }
`;

/**
 * Day 0: Welcome + profile completion reminder
 */
export const sendWelcomeDayZeroEmail = async ({ to, name }) => {
  if (!process.env.SENDGRID_API_KEY) {
    return { success: false, error: new Error('Email service not configured') };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thecirclenetwork.org';

  const msg = {
    to,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `Welcome to The Circle, ${escapeHtml(name)} — let's get you set up`,
    html: `
      <!DOCTYPE html><html><head><style>${EMAIL_STYLES}</style></head>
      <body>
        <div class="header"><div class="logo">THE CIRCLE NETWORK</div></div>
        <div class="content">
          <p>Hi ${escapeHtml(name)},</p>
          <p>Welcome to The Circle. You're now part of an exclusive group of high-performing executives and investors.</p>
          <p>Before your first AI introductions arrive, take 5 minutes to complete your profile so our matching engine can work for you:</p>
          <div class="highlight-box">
            <ol style="margin: 0; padding-left: 20px;">
              <li><strong>Add your expertise areas</strong> — what you can offer</li>
              <li><strong>Set your goals</strong> — what you're looking for</li>
              <li><strong>Upload a professional photo</strong> — members with photos get 3x more intros</li>
            </ol>
          </div>
          <div style="text-align: center;">
            <a href="${appUrl}/profile" class="cta-button">Complete Your Profile →</a>
          </div>
          <p>— Shehab Salamah<br>Founder, The Circle Network</p>
        </div>
      </body></html>
    `,
  };

  try {
    await sgMail.send(msg);
    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending Day 0 welcome email:', error);
    return { success: false, error };
  }
};

/**
 * Day 1: "Your first AI intros arrive Monday"
 */
export const sendWelcomeDayOneEmail = async ({ to, name }) => {
  if (!process.env.SENDGRID_API_KEY) {
    return { success: false, error: new Error('Email service not configured') };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thecirclenetwork.org';

  const msg = {
    to,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `Your first strategic introductions arrive Monday`,
    html: `
      <!DOCTYPE html><html><head><style>${EMAIL_STYLES}</style></head>
      <body>
        <div class="header"><div class="logo">THE CIRCLE NETWORK</div></div>
        <div class="content">
          <p>Hi ${escapeHtml(name)},</p>
          <p>Every Monday, our AI engine reviews your profile and curates 2-3 strategic introductions tailored to your goals.</p>
          <p><strong>Your first batch arrives this Monday.</strong></p>
          <div class="highlight-box">
            <p style="margin: 0;"><strong>How Circle Intros work:</strong><br>
            Our AI identifies members whose expertise, goals, and backgrounds create genuine mutual value — not random connections. 
            Both parties receive a warm brief before any introduction is made.</p>
          </div>
          <p>Make sure your profile is complete before Monday for the best matches.</p>
          <div style="text-align: center;">
            <a href="${appUrl}/intros" class="cta-button">Preview Your Intro Queue →</a>
          </div>
          <p>— Shehab<br>Founder, The Circle Network</p>
        </div>
      </body></html>
    `,
  };

  try {
    await sgMail.send(msg);
    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending Day 1 welcome email:', error);
    return { success: false, error };
  }
};

/**
 * Day 3: "Have you tried ARC? Here's how"
 */
export const sendWelcomeDayThreeEmail = async ({ to, name }) => {
  if (!process.env.SENDGRID_API_KEY) {
    return { success: false, error: new Error('Email service not configured') };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thecirclenetwork.org';

  const msg = {
    to,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `Have you tried ARC yet? Here's what it can do for you`,
    html: `
      <!DOCTYPE html><html><head><style>${EMAIL_STYLES}</style></head>
      <body>
        <div class="header"><div class="logo">THE CIRCLE NETWORK</div></div>
        <div class="content">
          <p>Hi ${escapeHtml(name)},</p>
          <p>ARC™ is The Circle's proprietary AI engine — and most new members don't realize how powerful it is until someone walks them through it.</p>
          <div class="highlight-box">
            <p style="margin: 0 0 12px 0;"><strong>Three things to try today:</strong></p>
            <ol style="margin: 0; padding-left: 20px;">
              <li><strong>Vendor Leverage</strong> — Upload a SaaS invoice and ask ARC to identify savings</li>
              <li><strong>Market Intelligence</strong> — Ask ARC for a brief on any competitor or market trend</li>
              <li><strong>Travel Optimization</strong> — Forward a flight confirmation and ask for upgrade options</li>
            </ol>
          </div>
          <p>Each ARC request takes under 60 seconds. The results often take hours off your week.</p>
          <div style="text-align: center;">
            <a href="${appUrl}/arc" class="cta-button">Open ARC Now →</a>
          </div>
          <p>— Shehab<br>Founder, The Circle Network</p>
        </div>
      </body></html>
    `,
  };

  try {
    await sgMail.send(msg);
    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending Day 3 welcome email:', error);
    return { success: false, error };
  }
};

/**
 * Day 5: "Post your first request"
 */
export const sendWelcomeDayFiveEmail = async ({ to, name }) => {
  if (!process.env.SENDGRID_API_KEY) {
    return { success: false, error: new Error('Email service not configured') };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thecirclenetwork.org';

  const msg = {
    to,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `One simple post that can unlock real value this week`,
    html: `
      <!DOCTYPE html><html><head><style>${EMAIL_STYLES}</style></head>
      <body>
        <div class="header"><div class="logo">THE CIRCLE NETWORK</div></div>
        <div class="content">
          <p>Hi ${escapeHtml(name)},</p>
          <p>One of the fastest ways to get value from The Circle is to post what you're working on or what you need.</p>
          <div class="highlight-box">
            <p style="margin: 0 0 8px 0;"><strong>Examples that get great responses:</strong></p>
            <ul style="margin: 0; padding-left: 20px; color: #555;">
              <li>"Looking for a warm intro to [company/person]"</li>
              <li>"Evaluating [software category] — who has experience with [vendor]?"</li>
              <li>"Hiring a [role] — open to referrals from members"</li>
              <li>"Working on [challenge] — would value perspective from anyone in [industry]"</li>
            </ul>
          </div>
          <p>Members respond because the network is curated. There's no noise here.</p>
          <div style="text-align: center;">
            <a href="${appUrl}/requests" class="cta-button">Post Your First Request →</a>
          </div>
          <p>— Shehab<br>Founder, The Circle Network</p>
        </div>
      </body></html>
    `,
  };

  try {
    await sgMail.send(msg);
    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending Day 5 welcome email:', error);
    return { success: false, error };
  }
};

/**
 * Day 7: "Your first week recap"
 */
export const sendWelcomeDaySevenEmail = async ({ to, name }) => {
  if (!process.env.SENDGRID_API_KEY) {
    return { success: false, error: new Error('Email service not configured') };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thecirclenetwork.org';

  const msg = {
    to,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `Your first week in The Circle — here's what's next`,
    html: `
      <!DOCTYPE html><html><head><style>${EMAIL_STYLES}</style></head>
      <body>
        <div class="header"><div class="logo">THE CIRCLE NETWORK</div></div>
        <div class="content">
          <p>Hi ${escapeHtml(name)},</p>
          <p>You've completed your first week in The Circle. Here's a quick recap of what's available to you:</p>
          <div class="highlight-box">
            <ul style="margin: 0; padding-left: 20px;">
              <li><strong>AI Intros</strong> — New matches arrive every Monday. Accept or pass, no pressure.</li>
              <li><strong>ARC™</strong> — Your AI research engine. Available anytime, limited only by your plan.</li>
              <li><strong>Member Feed</strong> — Post insights, ask questions, share wins. The community is listening.</li>
              <li><strong>BriefPoint</strong> — Connect your calendar for pre-meeting intelligence.</li>
              <li><strong>Events</strong> — Exclusive member events and expert sessions each month.</li>
            </ul>
          </div>
          <p>Remember our guarantee: if you don't get meaningful value in 30 days, we'll refund your membership in full.</p>
          <p>If you need anything, just reply to this email.</p>
          <div style="text-align: center;">
            <a href="${appUrl}/dashboard" class="cta-button">Go to Your Dashboard →</a>
          </div>
          <p>— Shehab Salamah<br>Founder, The Circle Network</p>
        </div>
      </body></html>
    `,
  };

  try {
    await sgMail.send(msg);
    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending Day 7 welcome email:', error);
    return { success: false, error };
  }
};
