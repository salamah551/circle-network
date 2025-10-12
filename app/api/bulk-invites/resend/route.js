export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  try {
    const { inviteId } = await req.json();
    if (!inviteId) return NextResponse.json({ error: 'inviteId is required' }, { status: 400 });
    const { error } = await supabase.from('bulk_invites').update({ status: 'resend' }).eq('id', inviteId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
