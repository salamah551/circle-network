// Member Value Calculation System
// Tracks and calculates member engagement, connections, and value created

export async function calculateMemberValue(userId, supabase) {
  try {
    // Get all member metrics in parallel
    const [
      connections,
      messages,
      events,
      requests,
      replies,
      referrals,
      memberSince
    ] = await Promise.all([
      getMemberConnections(userId, supabase),
      getMessageStats(userId, supabase),
      getEventStats(userId, supabase),
      getRequestStats(userId, supabase),
      getReplyStats(userId, supabase),
      getReferralStats(userId, supabase),
      getMembershipDuration(userId, supabase)
    ]);

    // Calculate Circle Score (0-100)
    const circleScore = calculateCircleScore({
      connections: connections.count,
      messagesSent: messages.sent,
      messagesReceived: messages.received,
      eventsAttended: events.attended,
      requestsHelped: replies.count,
      referrals: referrals.converted,
      daysActive: memberSince.days
    });

    // Calculate estimated value created
    const valueCreated = calculateValueCreated({
      connectionsCount: connections.count,
      requestsHelped: replies.count,
      referrals: referrals.converted
    });

    return {
      circleScore,
      valueCreated,
      connections: {
        total: connections.count,
        recent: connections.recent,
        list: connections.list
      },
      messages: {
        sent: messages.sent,
        received: messages.received,
        conversations: messages.conversations
      },
      events: {
        attended: events.attended,
        upcoming: events.upcoming,
        hosted: events.hosted
      },
      requests: {
        created: requests.created,
        helped: replies.count,
        resolved: requests.resolved
      },
      referrals: {
        total: referrals.total,
        converted: referrals.converted,
        pending: referrals.pending
      },
      memberSince: {
        date: memberSince.date,
        days: memberSince.days
      }
    };
  } catch (error) {
    console.error('Error calculating member value:', error);
    return null;
  }
}

async function getMemberConnections(userId, supabase) {
  // Get unique conversations (connections)
  const { data: conversations } = await supabase
    .from('messages')
    .select('sender_id, recipient_id, created_at')
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  const uniqueConnections = new Set();
  const connectionsList = [];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  conversations?.forEach(conv => {
    const otherId = conv.sender_id === userId ? conv.recipient_id : conv.sender_id;
    if (!uniqueConnections.has(otherId)) {
      uniqueConnections.add(otherId);
      connectionsList.push({
        userId: otherId,
        firstContact: conv.created_at
      });
    }
  });

  const recentCount = connectionsList.filter(c => 
    new Date(c.firstContact) > sevenDaysAgo
  ).length;

  return {
    count: uniqueConnections.size,
    recent: recentCount,
    list: connectionsList.slice(0, 10) // Top 10 recent
  };
}

async function getMessageStats(userId, supabase) {
  const [sent, received, convos] = await Promise.all([
    supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('sender_id', userId),
    supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', userId),
    supabase
      .from('messages')
      .select('sender_id, recipient_id')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
  ]);

  const uniqueConvos = new Set();
  convos.data?.forEach(msg => {
    const otherId = msg.sender_id === userId ? msg.recipient_id : msg.sender_id;
    uniqueConvos.add(otherId);
  });

  return {
    sent: sent.count || 0,
    received: received.count || 0,
    conversations: uniqueConvos.size
  };
}

async function getEventStats(userId, supabase) {
  const [attended, upcoming, hosted] = await Promise.all([
    supabase
      .from('event_rsvps')
      .select('event_id, events!inner(event_date)', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'attending')
      .lt('events.event_date', new Date().toISOString()),
    supabase
      .from('event_rsvps')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'attending')
      .gt('events.event_date', new Date().toISOString()),
    supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('host_id', userId)
  ]);

  return {
    attended: attended.count || 0,
    upcoming: upcoming.count || 0,
    hosted: hosted.count || 0
  };
}

async function getRequestStats(userId, supabase) {
  const [created, resolved] = await Promise.all([
    supabase
      .from('requests')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('requests')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'resolved')
  ]);

  return {
    created: created.count || 0,
    resolved: resolved.count || 0
  };
}

async function getReplyStats(userId, supabase) {
  const { count } = await supabase
    .from('request_replies')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  return {
    count: count || 0
  };
}

async function getReferralStats(userId, supabase) {
  const [total, converted, pending] = await Promise.all([
    supabase
      .from('referrals')
      .select('id', { count: 'exact', head: true })
      .eq('referrer_id', userId),
    supabase
      .from('referrals')
      .select('id', { count: 'exact', head: true })
      .eq('referrer_id', userId)
      .eq('status', 'converted'),
    supabase
      .from('referrals')
      .select('id', { count: 'exact', head: true })
      .eq('referrer_id', userId)
      .eq('status', 'pending')
  ]);

  return {
    total: total.count || 0,
    converted: converted.count || 0,
    pending: pending.count || 0
  };
}

async function getMembershipDuration(userId, supabase) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('created_at')
    .eq('id', userId)
    .single();

  if (!profile) return { date: null, days: 0 };

  const createdDate = new Date(profile.created_at);
  const now = new Date();
  const days = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

  return {
    date: createdDate,
    days
  };
}

function calculateCircleScore(metrics) {
  // Weighted scoring system (0-100)
  const weights = {
    connections: 0.25,      // 25% - most important
    messagesSent: 0.15,     // 15%
    messagesReceived: 0.10, // 10%
    eventsAttended: 0.15,   // 15%
    requestsHelped: 0.20,   // 20% - helping others is valuable
    referrals: 0.10,        // 10%
    daysActive: 0.05        // 5% - tenure bonus
  };

  // Normalize each metric (cap at reasonable maxes)
  const normalized = {
    connections: Math.min(metrics.connections / 50, 1) * 100,
    messagesSent: Math.min(metrics.messagesSent / 200, 1) * 100,
    messagesReceived: Math.min(metrics.messagesReceived / 200, 1) * 100,
    eventsAttended: Math.min(metrics.eventsAttended / 20, 1) * 100,
    requestsHelped: Math.min(metrics.requestsHelped / 30, 1) * 100,
    referrals: Math.min(metrics.referrals / 10, 1) * 100,
    daysActive: Math.min(metrics.daysActive / 365, 1) * 100
  };

  // Calculate weighted score
  let score = 0;
  Object.keys(weights).forEach(key => {
    score += (normalized[key] * weights[key]);
  });

  return Math.round(score);
}

function calculateValueCreated(metrics) {
  // Estimate value created based on industry averages
  const values = {
    perConnection: 2500,     // Average value of a professional connection
    perRequestHelp: 5000,    // Value of helping someone with their request
    perReferral: 10000       // Value of a successful referral
  };

  const total = 
    (metrics.connectionsCount * values.perConnection) +
    (metrics.requestsHelped * values.perRequestHelp) +
    (metrics.referrals * values.perReferral);

  return Math.round(total);
}

export function getScoreColor(score) {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
}

export function getScoreBadge(score) {
  if (score >= 90) return { label: 'Top Contributor', color: 'bg-emerald-500' };
  if (score >= 75) return { label: 'Active Member', color: 'bg-amber-500' };
  if (score >= 50) return { label: 'Growing', color: 'bg-blue-500' };
  if (score >= 25) return { label: 'Getting Started', color: 'bg-zinc-500' };
  return { label: 'New Member', color: 'bg-zinc-600' };
}
