/**
 * POST /api/emails/send
 *
 * Send a templated email. Used by the email sequence system or admin tooling.
 * Requires either:
 *   - A valid CRON_SECRET in the Authorization header  (Bearer <secret>), OR
 *   - An authenticated admin user session
 *
 * Body: { templateName: string; to: string; variables?: Record<string, string> }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTemplatedEmail } from '@/lib/send-email';

export async function POST(request: NextRequest) {
  // --- Auth: CRON_SECRET or admin session ---
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  let authorized = false;

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    authorized = true;
  } else {
    // Check for an authenticated admin user via Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceKey) {
      const token = authHeader?.replace('Bearer ', '');
      if (token) {
        const supabase = createClient(supabaseUrl, serviceKey);
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          if (profile?.role === 'admin') {
            authorized = true;
          }
        }
      }
    }
  }

  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // --- Parse body ---
  let body: { templateName?: string; to?: string; variables?: Record<string, string>; sequenceId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { templateName, to, variables = {}, sequenceId } = body;

  if (!templateName || !to) {
    return NextResponse.json(
      { error: 'templateName and to are required' },
      { status: 400 }
    );
  }

  // --- Send email ---
  const result = await sendTemplatedEmail(templateName, to, variables);

  // --- Update email_sequences record if sequenceId provided ---
  if (sequenceId) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase
      .from('email_sequences')
      .update({
        status: result.success ? 'sent' : 'failed',
        sent_at: result.success ? new Date().toISOString() : null,
        error_message: result.error || null,
      })
      .eq('id', sequenceId);
  }

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: result.id });
}
