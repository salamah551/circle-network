// app/api/arc/briefs/route.js
// GET /api/arc/briefs - Returns ARC™ request briefs and their status
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
    
    // Query arc_requests table with attachments count
    const { data, error } = await supabase
      .from('arc_requests')
      .select(`
        *,
        attachments:arc_request_attachments(count)
      `)
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error fetching ARC briefs:', error);
      // Return empty array on error instead of failing
      return Response.json([]);
    }
    
    // Transform to include attachments_count for easier access
    const briefs = (data || []).map(brief => ({
      ...brief,
      attachments_count: brief.attachments?.[0]?.count || 0,
      type: brief.type || 'brief' // Default to brief if type is missing
    }));
    
    return Response.json(briefs);
  } catch (error) {
    console.error('Error fetching ARC briefs:', error);
    // Return empty array instead of error
    return Response.json([]);
  }
}
