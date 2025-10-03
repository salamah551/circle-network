import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, firstName, inviteCode } = await request.json();
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}?email=${encodeURIComponent(email)}&code=${inviteCode}`;
    
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }], subject: `${firstName}, you're invited to join The Circle` }],
        from: { email: 'invite@thecirclenetwork.org', name: 'The Circle Network' },
        content: [{ type: 'text/html', value: `<h1>Hi ${firstName}!</h1><p>Your invite code: <strong>${inviteCode}</strong></p><a href="${inviteUrl}">Join Now</a>` }]
      })
    });

    if (!response.ok) throw new Error('SendGrid failed');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}