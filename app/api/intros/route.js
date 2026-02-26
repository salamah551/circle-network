import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ intros: [] });
    }

    const cookieStore = cookies();
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    });

    const { data: { user } = {} } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ intros: [] });

    // Try view first (preferred), fall back to base table if view doesn't exist
    let data, error;

    ({ data, error } = await supabase
      .from('strategic_intros_view')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3));

    if (error) {
      ({ data } = await supabase
        .from('strategic_intros')
        .select('id,user_id,partner_id,status,why,created_at,partner_name,partner_title,partner_company')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3));
    }

    return NextResponse.json({ intros: data ?? [] });
  } catch {
    return NextResponse.json({ intros: [] });
  }
}
