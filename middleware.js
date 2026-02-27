// middleware.js
// Enforce authentication on protected routes using Supabase SSR

import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

// Routes that require authentication
const PROTECTED_PREFIXES = [
  '/chat',
  '/settings',
  '/invite',
  '/referrals',
  '/intelligence',
  '/impact',
  '/arc',
  '/market-intel',
  '/matches',
  '/travel',
  '/community/highlights',
  '/dashboard',
  '/messages',
  '/members',
  '/intros',
  '/requests',
  '/feed',
  '/profile',
  '/notifications',
  '/saved',
  '/deal-flow',
  '/reputation',
  '/billing',
  '/onboarding',
];

// Routes that are always public
const PUBLIC_PREFIXES = [
  '/',
  '/login',
  '/sign-up',
  '/auth',
  '/forgot-password',
  '/subscribe',
  '/apply',
  '/api/signals',
  '/api/ops/',
  '/api/stripe',
  '/api/contact',
  '/api/unsubscribe',
  '/legal',
  '/privacy',
  '/terms',
  '/help',
  '/welcome',
  '/cookies',
  '/community',
  '/landing',
];

function isProtectedRoute(pathname) {
  // Exact match for root
  if (pathname === '/') return false;

  // Check explicit public prefixes first
  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(prefix + '/') || pathname.startsWith(prefix + '?')) {
      return false;
    }
  }

  // Check protected prefixes
  for (const prefix of PROTECTED_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(prefix + '/') || pathname.startsWith(prefix + '?')) {
      return true;
    }
  }

  // Protect /briefpoint sub-pages (e.g. /briefpoint/new, /briefpoint/<uuid>)
  // while keeping /briefpoint (marketing page) public
  if (pathname.startsWith('/briefpoint/')) {
    return true;
  }

  return false;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Only gate protected routes
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase keys are missing in development/build, skip auth check and warn.
  // In production this should never happen; configure env vars before deploying.
  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === 'production') {
      // Supabase is required in production; block access rather than leak data
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'service_unavailable');
      return NextResponse.redirect(loginUrl);
    }
    console.warn('⚠️  Supabase keys missing – middleware skipping auth check (development mode)');
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Refresh session if expired - required for Server Components
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
