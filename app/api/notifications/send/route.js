import { NextResponse } from 'next/server';
import { sendNotificationEmail } from '@/lib/send-email';

export async function POST(request) {
  try {
    const { type, recipientEmail, data } = await request.json();

    if (!type || !recipientEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await sendNotificationEmail({ to: recipientEmail, type, data });

    if (!result.success) {
      console.error('Notification email failed:', result.error);
      // Return success to caller — email failure should not block in-app flows
      return NextResponse.json({ success: true, emailSent: false, emailError: result.error });
    }

    return NextResponse.json({ success: true, emailSent: true, id: result.id });

  } catch (error) {
    console.error('Notification send error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
