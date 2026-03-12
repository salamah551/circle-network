import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // `next` is an optional URL to redirect to after the code exchange
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Server component — cookies already sent
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Validate that `next` is a safe internal path
      const safeNext =
        next.startsWith('/') && !next.startsWith('//')
          ? next
          : '/dashboard';
      return NextResponse.redirect(`${origin}${safeNext}`);
    }

    console.error('Auth callback code exchange error:', error);
  }

  // On failure, redirect to login with an error indicator
  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`);
}
