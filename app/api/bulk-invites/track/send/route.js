import { NextResponse } from 'next/server';

/**
 * Bulk invite email sending has been removed (SendGrid removed).
 * This endpoint is kept as a stub to avoid breaking existing cron triggers.
 */
export async function POST(request) {
  return NextResponse.json({ success: true, message: 'Email sending disabled', sent: 0 });
}

export async function GET(request) {
  // Security: Verify cron secret OR x-vercel-cron header
  const authHeader = request.headers.get('authorization');
  const vercelCron = request.headers.get('x-vercel-cron');
  const cronSecret = process.env.CRON_SECRET || 'your-secret-key-here';

  const isAuthorized = (authHeader === `Bearer ${cronSecret}`) || (vercelCron === '1');

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ success: true, message: 'Email sending disabled', sent: 0 });
}
