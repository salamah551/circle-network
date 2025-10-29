// app/api/matches/route.js
// GET /api/matches - Returns AI-curated member matches
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

export async function GET() {
  try {
    const supabase = createClient();
    
    // Get authenticated user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return Response.json([]);
    }
    
    // Query strategic_intros or matches table filtered by user
    // For now, return empty array until AI matching system is implemented
    const { data, error } = await supabase
      .from('strategic_intros')
      .select(`
        id,
        match_member_id,
        match_score,
        match_reason,
        profiles!strategic_intros_match_member_id_fkey(
          id,
          full_name,
          title,
          company,
          industry,
          photo_url
        )
      `)
      .eq('user_id', session.user.id)
      .eq('status', 'suggested')
      .order('match_score', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error fetching matches:', error);
      // Return empty array on error instead of failing
      return Response.json([]);
    }
    
    // Transform data to expected format
    const matches = (data || []).map(intro => ({
      id: intro.profiles?.id || intro.match_member_id,
      member_id: intro.match_member_id,
      full_name: intro.profiles?.full_name || 'Member',
      title: intro.profiles?.title || '',
      company: intro.profiles?.company || '',
      industry: intro.profiles?.industry || '',
      match_score: intro.match_score || 0,
      reason: intro.match_reason || '',
      avatar_url: intro.profiles?.photo_url || null
    }));
    
    return Response.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    // Return empty array instead of error
    return Response.json([]);
  }
}
