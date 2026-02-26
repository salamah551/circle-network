// app/api/briefpoint/calendar/callback/route.js
// GET /api/briefpoint/calendar/callback - Handle OAuth callback from Google
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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
        set(name, value, options) {
          try { cookieStore.set(name, value, options); } catch (e) { console.error('Cookie set error:', e); }
        },
        remove(name, options) {
          try { cookieStore.set(name, '', { ...options, maxAge: 0 }); } catch (e) { console.error('Cookie remove error:', e); }
        },
      },
    }
  );
}

export async function GET(request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000';

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // user ID passed during connect
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(`${appUrl}/dashboard?briefpoint_error=calendar_denied`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${appUrl}/dashboard?briefpoint_error=invalid_callback`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${appUrl}/api/briefpoint/calendar/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${appUrl}/dashboard?briefpoint_error=not_configured`);
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Failed to exchange Google OAuth code:', await tokenResponse.text());
      return NextResponse.redirect(`${appUrl}/dashboard?briefpoint_error=token_exchange_failed`);
    }

    const tokens = await tokenResponse.json();

    // Verify the session user matches the state (user ID)
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id !== state) {
      return NextResponse.redirect(`${appUrl}/dashboard?briefpoint_error=auth_mismatch`);
    }

    // Upsert calendar connection
    const { error: upsertError } = await supabase
      .from('briefpoint_calendar_connections')
      .upsert(
        {
          user_id: user.id,
          provider: 'google',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || null,
          token_expires_at: tokens.expires_in
            ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
            : null,
          calendar_id: 'primary',
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (upsertError) {
      console.error('Error storing calendar connection:', upsertError);
      return NextResponse.redirect(`${appUrl}/dashboard?briefpoint_error=storage_failed`);
    }

    return NextResponse.redirect(`${appUrl}/dashboard?briefpoint_success=calendar_connected`);
  } catch (err) {
    console.error('Error handling Google Calendar callback:', err);
    return NextResponse.redirect(`${appUrl}/dashboard?briefpoint_error=unexpected`);
  }
}
