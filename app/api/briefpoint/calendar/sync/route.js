// app/api/briefpoint/calendar/sync/route.js
// POST /api/briefpoint/calendar/sync - Trigger a manual Google Calendar sync
import { createServerClient } from '@supabase/ssr';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { processBriefPointMeeting } from '@/lib/briefpoint-processor';

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

/**
 * Refresh a Google OAuth access token using the refresh token.
 */
async function refreshAccessToken(refreshToken) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh Google access token');
  }

  return response.json();
}

export async function POST() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get calendar connection
    const { data: connection, error: connError } = await supabase
      .from('briefpoint_calendar_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (connError || !connection) {
      return Response.json({ error: 'No active calendar connection found' }, { status: 404 });
    }

    let accessToken = connection.access_token;

    // Check if token needs refresh
    if (connection.token_expires_at && new Date(connection.token_expires_at) <= new Date()) {
      if (!connection.refresh_token) {
        return Response.json({ error: 'Calendar connection expired. Please reconnect.' }, { status: 401 });
      }

      const newTokens = await refreshAccessToken(connection.refresh_token);
      accessToken = newTokens.access_token;

      // Update stored token
      const adminSupabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );

      await adminSupabase.from('briefpoint_calendar_connections').update({
        access_token: newTokens.access_token,
        token_expires_at: newTokens.expires_in
          ? new Date(Date.now() + newTokens.expires_in * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      }).eq('user_id', user.id);
    }

    // Fetch upcoming events from Google Calendar (next 7 days)
    const now = new Date();
    const timeMin = now.toISOString();
    const timeMax = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(connection.calendar_id || 'primary')}/events?` +
      new URLSearchParams({ timeMin, timeMax, singleEvents: 'true', orderBy: 'startTime', maxResults: '50' }),
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!calendarResponse.ok) {
      console.error('Failed to fetch Google Calendar events:', await calendarResponse.text());
      return Response.json({ error: 'Failed to fetch calendar events' }, { status: 502 });
    }

    const calendarData = await calendarResponse.json();
    const events = calendarData.items || [];

    let synced = 0;
    const newMeetings = [];

    for (const event of events) {
      if (!event.start?.dateTime) continue; // Skip all-day events

      const participants = (event.attendees || []).map(a => ({
        name: a.displayName || null,
        email: a.email || null,
        title: null,
        company: null,
      }));

      // Upsert to avoid duplicates via unique index on (user_id, calendar_event_id)
      const { data: meeting, error: upsertError } = await supabase
        .from('briefpoint_meetings')
        .upsert(
          {
            user_id: user.id,
            title: event.summary || 'Untitled Meeting',
            meeting_time: event.start.dateTime,
            participants,
            location: event.location || null,
            description: event.description || null,
            source: 'google_calendar',
            calendar_event_id: event.id,
            status: 'processing',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,calendar_event_id', ignoreDuplicates: false }
        )
        .select()
        .single();

      if (!upsertError && meeting) {
        synced++;
        if (meeting.status === 'processing') {
          newMeetings.push(meeting);
        }
      }
    }

    // Trigger AI processing for newly created meetings (fire-and-forget)
    for (const meeting of newMeetings) {
      processBriefPointMeeting({
        meetingId: meeting.id,
        title: meeting.title,
        participants: meeting.participants,
        description: meeting.description,
        meetingTime: meeting.meeting_time,
        location: meeting.location,
      }).catch(err => console.error('Background BriefPoint processing failed:', err));
    }

    // Update last_synced_at
    await supabase
      .from('briefpoint_calendar_connections')
      .update({ last_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    return Response.json({ synced, message: `Synced ${synced} calendar events.` });
  } catch (error) {
    console.error('Error syncing Google Calendar:', error);
    return Response.json({ error: 'Failed to sync calendar' }, { status: 500 });
  }
}
