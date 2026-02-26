// app/api/briefpoint/meetings/[id]/route.js
// GET    /api/briefpoint/meetings/[id] - Get a single meeting brief
// DELETE /api/briefpoint/meetings/[id] - Delete a meeting brief (instant purge)
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
        get(name) {
          return cookieStore.get(name)?.value;
        },
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

    const { data: meeting, error } = await supabase
      .from('briefpoint_meetings')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single();

    if (error || !meeting) {
      return Response.json({ error: 'Meeting brief not found' }, { status: 404 });
    }

    return Response.json(meeting);
  } catch (error) {
    console.error('Error fetching BriefPoint meeting:', error);
    return Response.json({ error: 'Failed to fetch meeting brief' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { error } = await supabase
      .from('briefpoint_meetings')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting BriefPoint meeting:', error);
      return Response.json({ error: 'Failed to delete meeting brief' }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting BriefPoint meeting:', error);
    return Response.json({ error: 'Failed to delete meeting brief' }, { status: 500 });
  }
}
