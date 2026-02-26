// app/api/briefpoint/calendar/disconnect/route.js
// POST /api/briefpoint/calendar/disconnect - Disconnect Google Calendar
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

export async function POST(request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse optional flag to also delete synced meetings
    let clearMeetings = false;
    try {
      const body = await request.json();
      clearMeetings = !!body.clearMeetings;
    } catch (_) {
      // No body is fine
    }

    // Delete the calendar connection
    const { error: connError } = await supabase
      .from('briefpoint_calendar_connections')
      .delete()
      .eq('user_id', user.id);

    if (connError) {
      console.error('Error deleting calendar connection:', connError);
      return Response.json({ error: 'Failed to disconnect calendar' }, { status: 500 });
    }

    // Optionally clear synced meetings
    if (clearMeetings) {
      await supabase
        .from('briefpoint_meetings')
        .delete()
        .eq('user_id', user.id)
        .eq('source', 'google_calendar');
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting calendar:', error);
    return Response.json({ error: 'Failed to disconnect calendar' }, { status: 500 });
  }
}
