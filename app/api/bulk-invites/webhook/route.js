export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  try {
    const body = await req.json();
    const events = Array.isArray(body) ? body : [body];

    for (const ev of events) {
      const type = ev.event;
      const inviteId = ev?.custom_args?.invite_id || null;
      const email = (ev.email || '').toLowerCase();

      if (inviteId) {
        await supabaseAdmin.from('bulk_invite_events').insert({ invite_id: inviteId, event: type, details: { email, url: ev.url || null } });
        if (type === 'open') await supabaseAdmin.from('bulk_invites').update({ status: 'opened' }).eq('id', inviteId);
        if (type === 'click') await supabaseAdmin.from('bulk_invites').update({ status: 'clicked' }).eq('id', inviteId);
        if (type === 'bounce' || type === 'dropped' || type === 'spamreport') {
          await supabaseAdmin.from('bulk_invites').update({ status: type }).eq('id', inviteId);
          await supabaseAdmin.from('bulk_invite_suppressions').upsert({ email, reason: type });
        }
      }
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Webhook error', e);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
