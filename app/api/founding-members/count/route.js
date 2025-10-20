// app/api/founding-members/count/route.js
// API endpoint to check how many founding member spots remain
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Create Supabase client with service role for secure queries
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Count profiles where is_founding_member is true
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_founding_member', true);

    if (error) {
      console.error('Error counting founding members:', error);
      return NextResponse.json(
        { error: 'Failed to fetch founding member count' },
        { status: 500 }
      );
    }

    const foundingMemberCount = count || 0;
    const maxFoundingMembers = 50;
    const spotsAvailable = Math.max(0, maxFoundingMembers - foundingMemberCount);
    const isFull = foundingMemberCount >= maxFoundingMembers;

    return NextResponse.json({
      count: foundingMemberCount,
      spotsAvailable: spotsAvailable,
      maxSpots: maxFoundingMembers,
      isFull: isFull,
    });
  } catch (error) {
    console.error('Founding member count error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
