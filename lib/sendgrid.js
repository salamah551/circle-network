// lib/sendgrid.js
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'invite@thecirclenetwork.org';
const FROM_NAME = 'Shehab Salamah - The Circle Network';

export const sendInvitationEmail = async ({ to, name, inviteCode, reason }) => {
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
            <a href="${process.env.NEXT_PUBLIC_APP_URL}?code=${inviteCode}" class="cta-button">Accept Your Invitation →</a>
          </div>
          
          <p>Looking forward to having you,<br>
          <strong>Shehab Salamah</strong><br>
          Founder, The Circle Network</p>
        </div>
      </body>
      </html>
    `,
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