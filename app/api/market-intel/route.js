import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * GET /api/market-intel
 * Returns market/competitive intelligence cards.
 * Note: Optionally reuse the signals source; keep decoupled for now.
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ intel: [] });
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
      return NextResponse.json({ intel: [] }, { status: 401 });
    }

    // TODO(server): Integrate with signals API or market intelligence data source
    // For now, return server-side mocked data with structured response
    const mockIntel = [
      {
        id: 1,
        title: 'SaaS Market Growth',
        summary: 'Enterprise SaaS expected to grow 23% in Q4',
        source: 'Market Analysis',
        published_at: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Competitor Activity',
        summary: 'Major competitor announced Series B funding',
        source: 'Industry News',
        published_at: new Date().toISOString()
      },
      {
        id: 3,
        title: 'Industry Shift',
        summary: 'AI adoption accelerating in target sector',
        source: 'Trend Report',
        published_at: new Date().toISOString()
      }
    ];

    return NextResponse.json({ intel: mockIntel });
  } catch (error) {
    console.error('Error in /api/market-intel:', error);
    return NextResponse.json({ intel: [], error: 'Internal server error' }, { status: 500 });
  }
}
