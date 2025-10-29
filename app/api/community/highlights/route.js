// app/api/community/highlights/route.js
// GET /api/community/highlights - Returns community activity highlights
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
    
    // Query community_highlights table
    const { data, error } = await supabase
      .from('community_highlights')
      .select('*')
      .order('time', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error fetching community highlights:', error);
      // Return empty array on error instead of failing
      return Response.json([]);
    }
    
    return Response.json(data || []);
  } catch (error) {
    console.error('Error fetching community highlights:', error);
    // Return empty array instead of error
    return Response.json([]);
  }
}
