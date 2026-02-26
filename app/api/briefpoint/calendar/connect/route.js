// app/api/briefpoint/calendar/connect/route.js
// POST /api/briefpoint/calendar/connect - Initiate Google Calendar OAuth flow
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const GOOGLE_SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

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

export async function POST() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return Response.json(
        { error: 'Google Calendar integration is not yet configured' },
        { status: 503 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000';
    const redirectUri = `${appUrl}/api/briefpoint/calendar/callback`;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: GOOGLE_SCOPES.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: user.id, // Pass user ID as state for callback validation
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    return Response.json({ authUrl });
  } catch (error) {
    console.error('Error initiating Google Calendar OAuth:', error);
    return Response.json({ error: 'Failed to initiate calendar connection' }, { status: 500 });
  }
}
