import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * GET /api/travel/upcoming
 * Returns upcoming trips for the current user.
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ trips: [] });
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
      return NextResponse.json({ trips: [] }, { status: 401 });
    }

    // TODO(server): Integrate with user's travel data from database or external API
    // For now, return server-side mocked data with structured response
    const mockTrips = [
      {
        id: 1,
        destination: 'San Francisco',
        start_date: '2025-11-15',
        end_date: '2025-11-18',
        airline: 'United Airlines',
        flight_number: 'UA-567',
        upgrade_available: true
      },
      {
        id: 2,
        destination: 'New York City',
        start_date: '2025-12-03',
        end_date: '2025-12-05',
        airline: 'Delta',
        flight_number: 'DL-234',
        upgrade_available: false
      }
    ];

    return NextResponse.json({ trips: mockTrips });
  } catch (error) {
    console.error('Error in /api/travel/upcoming:', error);
    return NextResponse.json({ trips: [], error: 'Internal server error' }, { status: 500 });
  }
}
