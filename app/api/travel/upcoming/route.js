// app/api/travel/upcoming/route.js
// GET /api/travel/upcoming - Returns upcoming travel itineraries
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
    
    // Query trips table for the authenticated user
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('start_date', new Date().toISOString().split('T')[0])
      .order('start_date', { ascending: true })
      .limit(10);
    
    if (error) {
      console.error('Error fetching travel:', error);
      // Return empty array on error instead of failing
      return Response.json([]);
    }
    
    return Response.json(data || []);
  } catch (error) {
    console.error('Error fetching travel:', error);
    // Return empty array instead of error
    return Response.json([]);
  }
}
