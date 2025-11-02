// app/api/arc/usage/route.js
// GET /api/arc/usage - Returns current user's ARC usage stats
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { TIERS } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

/**
 * Get ARC monthly limit for a tier with legacy tier mapping
 * @param {string} tier - Tier identifier (professional, pro, elite, founding, charter, etc.)
 * @returns {number} Monthly ARC limit
 */
function getArcLimit(tier) {
  // Map legacy tier names to new standardized tiers
  const tierMapping = {
    'founding': 'elite',    // Founding members get elite limits
    'charter': 'pro',       // Charter members get pro limits
    'inner-circle': 'elite',
    'core': 'pro',
    'premium': 'pro'
  };
  
  const normalizedTier = tierMapping[tier?.toLowerCase()] || tier?.toLowerCase() || 'professional';
  const tierConfig = TIERS.find(t => t.id === normalizedTier);
  
  return tierConfig?.limits.arcMonthly || TIERS[0].limits.arcMonthly; // Default to professional
}

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
    const limit = getArcLimit(tier);

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
