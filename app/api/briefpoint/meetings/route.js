// app/api/briefpoint/meetings/route.js
// GET  /api/briefpoint/meetings - List user's BriefPoint meetings with briefs
// POST /api/briefpoint/meetings - Submit a new meeting (Ghost Mode)
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { TIERS } from '@/lib/pricing';
import { processBriefPointMeeting } from '@/lib/briefpoint-processor';

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

/**
 * Count today's BriefPoint meetings for a user.
 */
async function getDailyUsage(supabase, userId) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const { count, error } = await supabase
    .from('briefpoint_meetings')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfDay.toISOString());

  if (error) {
    console.error('Error checking BriefPoint usage:', error);
    return 0;
  }
  return count || 0;
}

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return Response.json([], { status: 200 });
    }

    const { data, error } = await supabase
      .from('briefpoint_meetings')
      .select('*')
      .eq('user_id', session.user.id)
      .order('meeting_time', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching BriefPoint meetings:', error);
      return Response.json([]);
    }

    return Response.json(data || []);
  } catch (error) {
    console.error('Error fetching BriefPoint meetings:', error);
    return Response.json([]);
  }
}

export async function POST(request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { title, meetingTime, participants, description, location } = body;

    // Validate required fields
    if (!meetingTime) {
      return Response.json({ error: 'meetingTime is required' }, { status: 400 });
    }

    // Get user tier for limit check
    const { data: profile } = await supabase
      .from('profiles')
      .select('membership_tier')
      .eq('id', user.id)
      .single();

    const tier = profile?.membership_tier || 'professional';
    const limit = getBriefPointLimit(tier);
    const used = await getDailyUsage(supabase, user.id);

    if (used >= limit) {
      return Response.json(
        {
          error: 'Daily usage limit reached',
          message: `You've reached your daily limit of ${limit} BriefPoint briefs. Upgrade your tier for more.`,
          used,
          limit,
          remaining: 0,
        },
        { status: 429 }
      );
    }

    // Insert meeting record
    const { data: meeting, error: insertError } = await supabase
      .from('briefpoint_meetings')
      .insert({
        user_id: user.id,
        title: title || 'Untitled Meeting',
        meeting_time: meetingTime,
        participants: participants || [],
        description: description || null,
        location: location || null,
        source: 'manual',
        status: 'processing',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting BriefPoint meeting:', insertError);
      return Response.json({ error: 'Failed to create meeting brief' }, { status: 500 });
    }

    // Fire-and-forget AI processing
    processBriefPointMeeting({
      meetingId: meeting.id,
      title: meeting.title,
      participants: meeting.participants,
      description: meeting.description,
      meetingTime: meeting.meeting_time,
      location: meeting.location,
    }).catch(err => console.error('Background BriefPoint processing failed:', err));

    return Response.json(
      {
        id: meeting.id,
        status: meeting.status,
        message: 'Meeting brief submitted! Check BriefPoint for updates.',
        usage: { used: used + 1, limit, remaining: Math.max(0, limit - used - 1) },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error submitting BriefPoint meeting:', error);
    return Response.json(
      {
        error: 'Failed to submit meeting brief',
        ...(process.env.NODE_ENV === 'development' && { details: error.message }),
      },
      { status: 500 }
    );
  }
}
