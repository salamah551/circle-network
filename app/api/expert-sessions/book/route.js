import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { session_id, scheduled_at, booker_notes } = body;

    // Get session details
    const { data: expertSession, error: sessionError } = await supabase
      .from('expert_sessions')
      .select('*, expert:profiles!expert_id(id)')
      .eq('id', session_id)
      .single();

    if (sessionError || !expertSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check if user is trying to book their own session
    if (expertSession.expert_id === session.user.id) {
      return NextResponse.json({ error: 'Cannot book your own session' }, { status: 400 });
    }

    // Check for conflicts
    const { data: existingBooking } = await supabase
      .from('session_bookings')
      .select('id')
      .eq('session_id', session_id)
      .eq('scheduled_at', scheduled_at)
      .maybeSingle();

    if (existingBooking) {
      return NextResponse.json({ error: 'This time slot is already booked' }, { status: 409 });
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('session_bookings')
      .insert({
        session_id,
        booker_id: session.user.id,
        expert_id: expertSession.expert_id,
        scheduled_at,
        duration_minutes: expertSession.duration_minutes,
        booker_notes,
        status: 'pending'
      })
      .select(`
        *,
        session:expert_sessions(*),
        expert:profiles!expert_id(id, full_name, email, title, company),
        booker:profiles!booker_id(id, full_name, email)
      `)
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return NextResponse.json({ error: bookingError.message }, { status: 500 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'booked' or 'hosting'

    let query = supabase
      .from('session_bookings')
      .select(`
        *,
        session:expert_sessions(*),
        expert:profiles!expert_id(id, full_name, title, company, profile_image_url),
        booker:profiles!booker_id(id, full_name, title, company, profile_image_url)
      `)
      .order('scheduled_at', { ascending: true });

    if (type === 'booked') {
      query = query.eq('booker_id', session.user.id);
    } else if (type === 'hosting') {
      query = query.eq('expert_id', session.user.id);
    } else {
      // Return both
      query = query.or(`booker_id.eq.${session.user.id},expert_id.eq.${session.user.id}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bookings: data });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
