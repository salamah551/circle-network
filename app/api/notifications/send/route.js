import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { type, recipientEmail } = await request.json();

    if (!type || !recipientEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Email notifications via SendGrid have been removed.
    // Notification delivery is handled in-app.
    console.log(`Notification skipped (email removed): type=${type}, recipient=${recipientEmail}`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Notification send error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
