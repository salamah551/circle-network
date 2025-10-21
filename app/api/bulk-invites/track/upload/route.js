export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Generate a unique invitation code in format FOUNDING-XXXXXX
 */
function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'FOUNDING-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { campaignId, recipients } = await request.json();

    if (!campaignId || !recipients || recipients.length === 0) {
      return NextResponse.json({ error: 'campaignId and recipients are required' }, { status: 400 });
    }

    // Normalize & dedupe payload
    const normalized = [];
    const seen = new Set();
    const invalid = [];
    for (const r of recipients) {
      const email = (r.email || '').trim().toLowerCase();
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { invalid.push(r); continue; }
      if (seen.has(email)) continue;
      seen.add(email);
      normalized.push({
        full_name: `${r.firstName || ''} ${r.lastName || ''}`.trim(),
        email,
        company: r.company || null,
        title: r.title || null,
        code: r.code || null,
        notes: r.notes || ''
      });
    }

    if (normalized.length === 0) {
      return NextResponse.json({ error: 'No valid recipients' }, { status: 400 });
    }

    // Existing emails in campaign (case-insensitive)
    const { data: existing, error: exErr } = await supabaseAdmin
      .from('bulk_invites')
      .select('email')
      .eq('campaign_id', campaignId)
      .limit(100000);

    if (exErr) {
      return NextResponse.json({ error: exErr.message }, { status: 500 });
    }
    const existingSet = new Set((existing || []).map(e => (e.email || '').toLowerCase()));

    // Suppression list
    const emails = normalized.map(n => n.email);
    const { data: suppressed, error: supErr } = await supabaseAdmin
      .from('bulk_invite_suppressions')
      .select('email, reason')
      .in('email', emails);

    if (supErr) {
      return NextResponse.json({ error: supErr.message }, { status: 500 });
    }
    const suppressionSet = new Set((suppressed || []).map(s => (s.email || '').toLowerCase()));

    // Filter out suppressed + existing
    const toInsert = [];
    const skipped = { invalid: invalid.length, duplicates_in_campaign: 0, suppressed: 0, payload_duplicates: recipients.length - normalized.length };
    for (const n of normalized) {
      if (existingSet.has(n.email)) { skipped.duplicates_in_campaign++; continue; }
      if (suppressionSet.has(n.email)) { skipped.suppressed++; continue; }
      toInsert.push(n);
    }

    if (toInsert.length === 0) {
      return NextResponse.json({ success: true, inserted: 0, skipped }, { status: 200 });
    }

    // Insert rows - generate code if missing
    const rows = toInsert.map(n => ({
      campaign_id: campaignId,
      full_name: n.full_name,
      email: n.email,
      code: n.code || generateInviteCode(), // Generate code if not provided
      company: n.company,
      title: n.title,
      status: 'queued',
      meta: { notes: n.notes },
      next_email_scheduled: new Date().toISOString() // Initialize scheduling so sender can pick up
    }));

    const { error: insErr } = await supabaseAdmin.from('bulk_invites').insert(rows);
    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    // Update campaign totals immediately
    const { data: campaign, error: campaignErr } = await supabaseAdmin
      .from('bulk_invite_campaigns')
      .select('total_recipients')
      .eq('id', campaignId)
      .single();

    if (!campaignErr && campaign) {
      await supabaseAdmin
        .from('bulk_invite_campaigns')
        .update({ 
          total_recipients: (campaign.total_recipients || 0) + rows.length 
        })
        .eq('id', campaignId);
    }

    return NextResponse.json({ success: true, inserted: rows.length, skipped }, { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}