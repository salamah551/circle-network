export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request) {
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
            } catch (error) {
              // Cookie setting might fail in some contexts
            }
          },
          remove(name, options) {
            try {
              cookieStore.set(name, '', { ...options, maxAge: 0 });
            } catch (error) {
              // Cookie removal might fail in some contexts
            }
          }
        }
      }
    );

    // Get current week number to rotate spotlight
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);

    // Get all active members with complete profiles
    const { data: members, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('status', 'active')
      .not('bio', 'is', null)
      .not('expertise', 'is', null)
      .order('created_at', { ascending: true });

    if (error || !members || members.length === 0) {
      console.error('Error loading members for spotlight:', error);
      return NextResponse.json(null);
    }

    // Select member based on week number (rotates weekly)
    const selectedMember = members[weekNumber % members.length];

    // Add spotlight reason (could be dynamic based on member activity)
    const spotlightReasons = [
      'Active contributor helping multiple members this week',
      'Recently made valuable connections within the community',
      'Brings unique expertise and insights to the network',
      'Exemplifies the collaborative spirit of Circle Network',
      'Consistently engaged in community discussions and events'
    ];

    const response = {
      ...selectedMember,
      spotlight_reason: spotlightReasons[weekNumber % spotlightReasons.length]
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in member-spotlight API:', error);
    return NextResponse.json(null, { status: 500 });
  }
}