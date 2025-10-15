// app/api/expert-sessions/route.js
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    // Get cookies
    const cookieStore = cookies();
    
    // Create Supabase client with cookie support
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            try {
              cookieStore.set(name, value, options);
            } catch (error) {
              // Server component - ignore
            }
          },
          remove(name, options) {
            try {
              cookieStore.set(name, '', { ...options, maxAge: 0 });
            } catch (error) {
              // Server component - ignore
            }
          }
        }
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'upcoming';

    // Fetch expert sessions
    const { data: sessions, error: queryError } = await supabase
      .from('expert_sessions')
      .select(`
        *,
        expert:profiles!expert_sessions_expert_id_fkey(
          id,
          full_name,
          title,
          company,
          avatar_url
        ),
        attendee:profiles!expert_sessions_attendee_id_fkey(
          id,
          full_name,
          avatar_url
        )
      `)
      .or(`expert_id.eq.${user.id},attendee_id.eq.${user.id}`)
      .eq('status', status)
      .order('session_date', { ascending: true });

    if (queryError) {
      console.error('Error fetching expert sessions:', queryError);
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      sessions: sessions || [],
      count: sessions?.length || 0
    });

  } catch (error) {
    console.error('Error in expert-sessions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const cookieStore = cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            try {
              cookieStore.set(name, value, options);
            } catch (error) {}
          },
          remove(name, options) {
            try {
              cookieStore.set(name, '', { ...options, maxAge: 0 });
            } catch (error) {}
          }
        }
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { expert_id, session_date, duration, topic, notes } = body;

    // Validate required fields
    if (!expert_id || !session_date || !topic) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new session
    const { data: session, error: createError } = await supabase
      .from('expert_sessions')
      .insert({
        expert_id,
        attendee_id: user.id,
        session_date,
        duration: duration || 30,
        topic,
        notes: notes || '',
        status: 'pending'
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating session:', createError);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      session,
      success: true 
    });

  } catch (error) {
    console.error('Error in expert-sessions POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
