import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * GET /api/dashboard/stats
 * Returns dashboard header counters.
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        connections: 0,
        unreadMessages: 0,
        introsPending: 0,
        introsAccepted: 0
      });
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
      return NextResponse.json({
        connections: 0,
        unreadMessages: 0,
        introsPending: 0,
        introsAccepted: 0
      }, { status: 401 });
    }

    // TODO(server): Query actual database tables
    // - connections: COUNT from connections table WHERE user_id = user.id
    // - unreadMessages: COUNT from messages WHERE recipient_id = user.id AND read = false
    // - introsPending: COUNT from strategic_intros WHERE user_id = user.id AND status = 'pending'
    // - introsAccepted: COUNT from strategic_intros WHERE user_id = user.id AND status = 'accepted'
    
    // For now, return server-side mocked data
    const stats = {
      connections: 12,
      unreadMessages: 5,
      introsPending: 3,
      introsAccepted: 8
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in /api/dashboard/stats:', error);
    return NextResponse.json({
      connections: 0,
      unreadMessages: 0,
      introsPending: 0,
      introsAccepted: 0,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
