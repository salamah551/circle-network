import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function toCsvRow(fields) {
  return fields.map(v => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (/[",\n]/.test(s)) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }).join(',');
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId');
    if (!campaignId) {
      return NextResponse.json({ error: 'campaignId is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from('bulk_invites')
      .select('id,full_name,email,code,meta,created_at,status,company,title')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const header = [
      'id','full_name','email','company','title','notes','code','status','created_at'
    ];
    const rows = [header.join(',')];
    for (const r of (data || [])) {
      const notes = (r.meta && (r.meta.notes || r.meta.note)) ? (r.meta.notes || r.meta.note) : '';
      rows.push(toCsvRow([r.id, r.full_name || '', r.email, r.company || '', r.title || '', notes, r.code || '', r.status || '', r.created_at]));
    }
    const csv = rows.join('\n');

    const headers = new Headers({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="campaign_' + campaignId + '.csv"'
    });
    return new NextResponse(csv, { status: 200, headers });
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
