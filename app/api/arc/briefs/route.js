import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * GET /api/arc/briefs
 * Returns list of ARC™ briefs for the current user.
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ briefs: [] });
    }

    const cookieStore = cookies();
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set(name, value, options);
        },
        remove(name, options) {
          cookieStore.set(name, '', { ...options, maxAge: 0 });
        },
      },
    });

    const { data: { user } = {} } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ briefs: [] }, { status: 401 });
    }

    // TODO(server): Query arc_requests table or similar from database
    // For now, return server-side mocked data with structured response
    const mockBriefs = [
      {
        id: 1,
        title: 'Contract Analysis: Series A Term Sheet',
        status: 'completed',
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        priority: 'high'
      },
      {
        id: 2,
        title: 'Flight Upgrade Options: UA-567',
        status: 'processing',
        updated_at: new Date().toISOString(),
        priority: 'medium'
      },
      {
        id: 3,
        title: 'Market Research: SaaS Competition',
        status: 'pending',
        updated_at: new Date().toISOString(),
        priority: 'low'
      }
    ];

    return NextResponse.json({ briefs: mockBriefs });
  } catch (error) {
    console.error('Error in /api/arc/briefs:', error);
    return NextResponse.json({ briefs: [], error: 'Internal server error' }, { status: 500 });
  }
}
