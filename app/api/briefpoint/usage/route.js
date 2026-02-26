// app/api/briefpoint/usage/route.js
// GET /api/briefpoint/usage - Returns daily BriefPoint usage stats
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { TIERS } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

/**
 * Get BriefPoint daily limit for a tier.
 * @param {string} tier - Tier identifier
 * @returns {number} Daily BriefPoint limit
 */
function getBriefPointLimit(tier) {
  const tierMapping = {
    founding: 'elite',
    charter: 'pro',
    'inner-circle': 'elite',
    core: 'pro',
    premium: 'pro',
  };
  const normalizedTier = tierMapping[tier?.toLowerCase()] || tier?.toLowerCase() || 'professional';
  const tierConfig = TIERS.find(t => t.id === normalizedTier);
  return tierConfig?.limits.briefpointDaily || TIERS[0].limits.briefpointDaily;
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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ used: 0, limit: 5, remaining: 5 });
    }

    // Get user profile for tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('membership_tier')
      .eq('id', user.id)
      .single();

    const tier = profile?.membership_tier || 'professional';
    const limit = getBriefPointLimit(tier);

    // Count today's meetings
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const { count, error } = await supabase
      .from('briefpoint_meetings')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfDay.toISOString());

    if (error) {
      console.error('Error checking BriefPoint usage:', error);
      return Response.json({ used: 0, limit, remaining: limit });
    }

    const used = count || 0;
    const remaining = Math.max(0, limit - used);

    return Response.json({ used, limit, remaining });
  } catch (error) {
    console.error('Error fetching BriefPoint usage:', error);
    return Response.json({ used: 0, limit: 5, remaining: 5 });
  }
}
