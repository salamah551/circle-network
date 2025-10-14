import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const expertId = searchParams.get('expert_id');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = supabase
      .from('expert_sessions')
      .select(`
        *,
        expert:profiles!expert_id(id, full_name, title, company, profile_image_url),
        bookings:session_bookings(count)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (expertId) {
      query = query.eq('expert_id', expertId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching sessions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sessions: data });
  } catch (error) {
    console.error('Expert sessions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, duration_minutes, category, max_bookings_per_week, availability } = body;

    // Create the session
    const { data: expertSession, error: sessionError } = await supabase
      .from('expert_sessions')
      .insert({
        expert_id: session.user.id,
        title,
        description,
        duration_minutes: duration_minutes || 30,
        category,
        max_bookings_per_week: max_bookings_per_week || 5,
        is_active: true
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      return NextResponse.json({ error: sessionError.message }, { status: 500 });
    }

    // Create availability slots if provided
    if (availability && availability.length > 0) {
      const availabilitySlots = availability.map(slot => ({
        session_id: expertSession.id,
        day_of_week: slot.day_of_week,
        start_time: slot.start_time,
        end_time: slot.end_time
      }));

      const { error: availError } = await supabase
        .from('session_availability')
        .insert(availabilitySlots);

      if (availError) {
        console.error('Error creating availability:', availError);
        // Continue anyway, user can add availability later
      }
    }

    return NextResponse.json({ session: expertSession });
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
