import { NextResponse } from 'next/server';

export async function GET(request) {
  // Security: Verify cron secret OR x-vercel-cron header
  const authHeader = request.headers.get('authorization');
  const vercelCron = request.headers.get('x-vercel-cron');
  const cronSecret = process.env.CRON_SECRET || 'your-secret-key-here';

  const isAuthorized = (authHeader === `Bearer ${cronSecret}`) || (vercelCron === '1');

  if (!isAuthorized) {
    console.error('Unauthorized cron access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Email automation removed — SendGrid has been removed from this project
  return NextResponse.json({ success: true, message: 'No emails to send', sent: 0 });
}

// Also support POST for manual testing
export async function POST(request) {
  return GET(request);
}
