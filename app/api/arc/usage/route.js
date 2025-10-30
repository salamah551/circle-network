// app/api/arc/usage/route.js
// GET /api/arc/usage - Returns current user's ARC usage stats
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// Tier-based monthly limits (configurable via env)
const USAGE_LIMITS = {
  founding: parseInt(process.env.ARC_LIMIT_FOUNDING || '100', 10),
  elite: parseInt(process.env.ARC_LIMIT_ELITE || '100', 10),
  charter: parseInt(process.env.ARC_LIMIT_CHARTER || '10', 10),
  professional: parseInt(process.env.ARC_LIMIT_PROFESSIONAL || '5', 10),
};

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
      return Response.json(
        { used: 0, limit: 5, remaining: 5 },
        { status: 200 }
      );
    }

    // Get user profile to check tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('membership_tier, is_founding_member')
      .eq('id', session.user.id)
      .single();
    
    const tier = profile?.membership_tier || 'professional';
    const limit = USAGE_LIMITS[tier] || 5;

    // Get current month's usage
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const { data, error } = await supabase
      .from('arc_requests')
      .select('id', { count: 'exact' })
      .eq('user_id', session.user.id)
      .gte('created_at', startOfMonth.toISOString());
    
    if (error) {
      console.error('Error checking usage:', error);
      return Response.json({ used: 0, limit, remaining: limit });
    }
    
    const used = data?.length || 0;
    const remaining = Math.max(0, limit - used);
    
    return Response.json({ used, limit, remaining });
  } catch (error) {
    console.error('Error fetching ARC usage:', error);
    return Response.json({ used: 0, limit: 5, remaining: 5 });
  }
}
