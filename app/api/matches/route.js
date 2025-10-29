import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * GET /api/matches
 * Returns AI-curated weekly matches for the current user.
 * Future: personalize using profiles.needs_assessment
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ matches: [] });
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
      return NextResponse.json({ matches: [] }, { status: 401 });
    }

    // TODO(server): Personalize based on user's needs_assessment from profiles table
    // For now, return server-side mocked data with structured response
    const mockMatches = [
      {
        id: 1,
        member_id: 'member_001',
        full_name: 'Sarah Chen',
        title: 'VP of Engineering',
        company: 'TechCorp',
        industry: 'Technology',
        match_score: 94,
        reason: 'Shared interest in AI/ML infrastructure',
        avatar_url: null
      },
      {
        id: 2,
        member_id: 'member_002',
        full_name: 'Michael Rodriguez',
        title: 'Managing Partner',
        company: 'Venture Capital Fund',
        industry: 'Finance',
        match_score: 89,
        reason: 'Mutual focus on early-stage SaaS investments',
        avatar_url: null
      },
      {
        id: 3,
        member_id: 'member_003',
        full_name: 'Emily Thompson',
        title: 'Chief Strategy Officer',
        company: 'Global Logistics Inc',
        industry: 'Logistics',
        match_score: 87,
        reason: 'Complementary expertise in supply chain optimization',
        avatar_url: null
      }
    ];

    return NextResponse.json({ matches: mockMatches });
  } catch (error) {
    console.error('Error in /api/matches:', error);
    return NextResponse.json({ matches: [], error: 'Internal server error' }, { status: 500 });
  }
}
