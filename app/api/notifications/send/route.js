import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendNewMessageEmail, sendRequestReplyEmail } from '@/lib/sendgrid';

export async function POST(request) {
  try {
    const { type, recipientEmail, recipientName, senderName, messagePreview, requestTitle, replyPreview } = await request.json();

    if (!type || !recipientEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let result;

    if (type === 'new_message') {
      result = await sendNewMessageEmail({
        to: recipientEmail,
        recipientName: recipientName || 'Member',
        senderName: senderName || 'A member',
        messagePreview: messagePreview?.substring(0, 100) || 'New message'
      });
    } else if (type === 'request_reply') {
      result = await sendRequestReplyEmail({
        to: recipientEmail,
        recipientName: recipientName || 'Member',
        replierName: senderName || 'A member',
        requestTitle: requestTitle || 'Your request',
        replyPreview: replyPreview?.substring(0, 100) || 'New reply'
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      );
    }

    if (!result.success) {
      console.error('Failed to send email:', result.error);
      return NextResponse.json(
        { error: 'Failed to send notification email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Notification send error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
