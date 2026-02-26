// app/api/arc/briefs/[id]/route.js
// GET /api/arc/briefs/[id] - Returns a single ARC™ brief with attachments
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value; },
      },
    }
  );
}

export async function GET(request, { params }) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: brief, error } = await supabase
      .from('arc_requests')
      .select('*, arc_request_attachments(*)')
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single();

    if (error || !brief) {
      return Response.json({ error: 'Brief not found' }, { status: 404 });
    }

    return Response.json(brief);
  } catch (error) {
    console.error('Error fetching ARC brief:', error);
    return Response.json({ error: 'Failed to fetch brief' }, { status: 500 });
  }
}
