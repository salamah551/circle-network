export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'invite@thecirclenetwork.org';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'The Circle Network';

function htmlForInvite({ invite, appUrl }) {
  const link = `${appUrl}/?invite=${invite.code || ''}&iid=${invite.id}`;
  return `
  <!doctype html><html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;">
  <div style="background:black;color:white;padding:28px;border-radius:12px">
    <div style="color:#D4AF37;font-weight:600;font-size:20px;margin-bottom:4px">The Circle Network</div>
    <div style="opacity:.7;font-size:13px;">Invitation-only • Manual approval • Privacy-first</div>
  </div>
  <div style="background:white;padding:28px;border-radius:12px;margin-top:16px;border:1px solid #eee">
    <h1 style="margin:0 0 8px 0;font-weight:600;">You’re invited, ${invite.full_name || ''}</h1>
    <p style="margin:0 0 12px 0;opacity:.8">A private operating network for elite founders & investors.</p>
    <p style="margin:0 0 10px 0;"><b>What you get:</b> 3 strategic introductions weekly, a high-signal value exchange, and a reputation system that rewards contribution.</p>
    <div style="background:#0b0b0b;color:white;padding:14px;border-radius:8px;margin:16px 0;">
      <div style="opacity:.8;font-size:12px;margin-bottom:6px;">Member-Only Intelligence Suite (coming soon · optional, billed separately):</div>
      <ul style="margin:0 0 0 18px;padding:0;">
        <li><b>AI Competitive Intelligence</b> — daily briefs & predictive alerts <i>(from $8,000/mo)</i></li>
        <li><b>AI Reputation Guardian</b> — real-time monitoring & takedowns <i>(from $5,000/mo)</i></li>
        <li><b>Deal Flow Alerts</b> — curated, pre‑public opportunities <i>(from $2,000/mo)</i></li>
      </ul>
      <div style="opacity:.7;font-size:12px;margin-top:6px">Not available yet; founding members get priority access as capacity opens.</div>
    </div>
    <a href="${link}" style="display:inline-block;background:linear-gradient(90deg,#E5C77E,#D4AF37);color:black;text-decoration:none;padding:12px 16px;border-radius:10px;font-weight:600">Request Access</a>
    <div style="opacity:.6;font-size:12px;margin-top:10px">Founding cohort capped. Price lock for approved founders.</div>
  </div>
  </body></html>`;
}

export async function POST(req) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thecirclenetwork.org';
  try {
    const body = await req.json();
    const campaignId = body.campaignId || null;
    const inviteId = body.inviteId || null;

    let invites = [];
    if (inviteId) {
      const { data, error } = await supabase.from('bulk_invites').select('*').eq('id', inviteId).limit(1);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      invites = data || [];
    } else if (campaignId) {
      const { data, error } = await supabase.from('bulk_invites').select('*').eq('campaign_id', campaignId).in('status', ['queued','resend']).limit(10000);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      invites = data || [];
    } else {
      return NextResponse.json({ error: 'campaignId or inviteId required' }, { status: 400 });
    }

    if (!invites.length) return NextResponse.json({ success: true, sent: 0 });

    const sentIds = [];
    for (const inv of invites) {
      try {
        const msg = {
          to: inv.email,
          from: { email: FROM_EMAIL, name: FROM_NAME },
          subject: `${inv.full_name || 'Founder'}, your invitation to The Circle Network`,
          html: htmlForInvite({ invite: inv, appUrl }),
          mailSettings: { bypassListManagement: { enable: true } },
          customArgs: { invite_id: inv.id, campaign_id: inv.campaign_id }
        };
        await sgMail.send(msg);
        sentIds.push(inv.id);
      } catch (e) {
        await supabase.from('bulk_invite_events').insert({ invite_id: inv.id, event: 'error', details: { message: String(e) } });
      }
    }

    if (sentIds.length) await supabase.from('bulk_invites').update({ status: 'sent' }).in('id', sentIds);
    return NextResponse.json({ success: true, sent: sentIds.length });
  } catch (e) {
    console.error('Send error', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
