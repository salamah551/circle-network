// app/api/market-intel/route.js
// GET /api/market-intel - Returns market intelligence and competitive insights
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
    
    // Query market_intel table for the authenticated user
    const { data, error } = await supabase
      .from('market_intel')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error fetching market intel:', error);
      // Return empty array on error instead of failing
      return Response.json([]);
    }
    
    return Response.json(data || []);
  } catch (error) {
    console.error('Error fetching market intel:', error);
    // Return empty array instead of error
    return Response.json([]);
  }
}
