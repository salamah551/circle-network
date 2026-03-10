/**
 * POST /api/emails/process-queue
 *
 * Cron-compatible endpoint that processes scheduled emails from the
 * email_sequences table. Queries for emails where status = 'scheduled'
 * and scheduled_for <= NOW(), then sends each one via sendTemplatedEmail().
 *
 * Protected by CRON_SECRET header validation.
 *
 * Example Vercel cron job (vercel.json):
 *   { "crons": [{ "path": "/api/emails/process-queue", "schedule": "every 15 minutes" }] }
 *   Cron expression: 0,15,30,45 * * * *
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTemplatedEmail } from '@/lib/send-email';

export async function POST(request: NextRequest) {
  // --- Auth: CRON_SECRET required ---
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // --- Fetch due emails ---
  const { data: dueEmails, error: fetchError } = await supabase
    .from('email_sequences')
    .select('id, email_template_id, recipient_email, metadata')
    .eq('status', 'scheduled')
    .lte('scheduled_for', new Date().toISOString())
    .limit(50);

  if (fetchError) {
    console.error('process-queue fetch error:', fetchError);
    return NextResponse.json({ error: 'Failed to fetch queue' }, { status: 500 });
  }

  if (!dueEmails || dueEmails.length === 0) {
    return NextResponse.json({ success: true, processed: 0 });
  }

  // --- Fetch template names for each template ID ---
  const templateIds = Array.from(new Set(dueEmails.map((e) => e.email_template_id)));
  const { data: templates } = await supabase
    .from('email_templates')
    .select('id, name')
    .in('id', templateIds);

  const templateMap: Record<string, string> = {};
  for (const t of templates || []) {
    templateMap[t.id] = t.name;
  }

  // --- Process each email ---
  let sent = 0;
  let failed = 0;

  for (const item of dueEmails) {
    const templateName = templateMap[item.email_template_id];

    if (!templateName) {
      await supabase
        .from('email_sequences')
        .update({ status: 'failed', error_message: 'Template not found' })
        .eq('id', item.id);
      failed++;
      continue;
    }

    const variables: Record<string, string> = item.metadata || {};
    const result = await sendTemplatedEmail(templateName, item.recipient_email, variables);

    await supabase
      .from('email_sequences')
      .update({
        status: result.success ? 'sent' : 'failed',
        sent_at: result.success ? new Date().toISOString() : null,
        error_message: result.error || null,
      })
      .eq('id', item.id);

    if (result.success) {
      sent++;
    } else {
      failed++;
      console.error(`Failed to send email sequence ${item.id}:`, result.error);
    }
  }

  return NextResponse.json({ success: true, processed: dueEmails.length, sent, failed });
}
