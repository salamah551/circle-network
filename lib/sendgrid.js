// lib/sendgrid.js
import { escapeHtml } from './email-utils.js';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'invite@thecirclenetwork.org';
const FROM_NAME = 'Shehab Salamah - The Circle Network';

export const sendInvitationEmail = async ({ to, name, inviteCode, reason }) => {
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
          <p>Hi ${name},</p>
          
          <p>I'm Shehab Salamah, and I'm reaching out because I think you'd be a perfect fit for something I'm building.</p>
          
          <p><strong>The Circle Network</strong> is an invite-only community of 100 high-performing professionals across finance, tech, consulting, and commerce who help each other win.</p>
          
          <div class="invite-code">
            Your invitation code: <strong>${inviteCode}</strong>
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
            
            <p>You're now part of an exclusive group that will shape the future of this community. Your founding member price of <strong>$179/mo</strong> is locked in forever.</p>
            
            <div class="feature-box">
              <h3 style="margin-top: 0; color: #D4AF37;">Your Founding Member Benefits:</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li><strong>Founding Price Lock:</strong> $179/mo forever</li>
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
