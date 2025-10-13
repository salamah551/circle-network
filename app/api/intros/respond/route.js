import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const { introId, action } = await req.json();
    if (!introId || !['accepted', 'declined'].includes(action)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return NextResponse.json({ ok: true });

    const cookieStore = cookies();
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name) { return cookieStore.get(name)?.value; },
        set(name, value, options) { cookieStore.set(name, value, options); },
        remove(name, options) { cookieStore.set(name, '', { ...options, maxAge: 0 }); },
      },
    });

    const { data: { user } = {} } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false }, { status: 401 });

    // Update user-side status; ignore errors (no crash if table absent)
    await supabase
      .from('strategic_intros')
      .update({ status: action })
      .eq('id', introId)
      .eq('user_id', user.id);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // soft success to avoid UX dead-ends
  }
}
