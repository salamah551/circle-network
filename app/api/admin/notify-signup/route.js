export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export async function POST(request) {
  try {
    const body = await request.json();
    const { userEmail, userName, membershipTier } = body;

    // Send notification to admin
    const adminEmail = process.env.ADMIN_EMAIL || 'salamah551@gmail.com';

    const msg = {
      to: adminEmail,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'invite@thecirclenetwork.org',
        name: 'Circle Network'
      },
      subject: `🎉 New Member Signup: ${userName}`,
      html: `
<!DOCTYPE html>
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
      <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;letter-spacing:-0.5px;">New Member Alert!</h1>
      <p style="margin:0;opacity:0.8;font-size:14px;">Circle Network</p>
    </div>

    <!-- Main Content -->
    <div style="padding:32px 28px;">
      <h2 style="margin:0 0 24px 0;font-size:20px;font-weight:700;color:#1a1a1a;">Member Details</h2>
      
      <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin-bottom:24px;">
        <div style="margin-bottom:12px;">
          <div style="font-size:12px;color:#666;margin-bottom:4px;">NAME</div>
          <div style="font-size:16px;font-weight:600;color:#1a1a1a;">${userName}</div>
        </div>
        <div style="margin-bottom:12px;">
          <div style="font-size:12px;color:#666;margin-bottom:4px;">EMAIL</div>
          <div style="font-size:16px;font-weight:600;color:#1a1a1a;">${userEmail}</div>
        </div>
        <div>
          <div style="font-size:12px;color:#666;margin-bottom:4px;">MEMBERSHIP TIER</div>
          <div style="font-size:16px;font-weight:600;color:#D4AF37;text-transform:uppercase;">${membershipTier || 'Founding'}</div>
        </div>
      </div>

      <div style="background:#FEF3C7;border:2px solid #D4AF37;padding:16px;border-radius:8px;margin-bottom:24px;">
        <p style="margin:0;font-size:14px;color:#92400E;">
          <strong>Next Steps:</strong> Review their profile in the admin dashboard and welcome them to the community!
        </p>
      </div>

      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" style="display:inline-block;background:linear-gradient(135deg,#E5C77E,#D4AF37);color:#000;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:14px;">
        View in Admin Dashboard →
      </a>
    </div>

    <!-- Footer -->
    <div style="padding:20px 28px;border-top:1px solid #eee;text-align:center;">
      <p style="margin:0;font-size:12px;color:#999;">
        Signed up: ${new Date().toLocaleString()}
      </p>
    </div>

  </div>
</body>
</html>
      `
    };

    await sgMail.send(msg);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}