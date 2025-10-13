/**
 * Feature Flag System
 * Controls feature availability based on launch date and user status
 */

// Launch date for platform features (November 1, 2025)
const FORCE_UNLOCK = process.env.NEXT_PUBLIC_FORCE_UNLOCK === 'true';
const LAUNCH_DATE = process.env.NEXT_PUBLIC_LAUNCH_DATE 
  ? new Date(process.env.NEXT_PUBLIC_LAUNCH_DATE) 
  : new Date('2025-10-25T16:00:00-04:00');

/**
 * Check if a feature is unlocked based on launch date
 */
export function isFeatureUnlocked(featureName) {
  if (FORCE_UNLOCK) return true;

  const now = new Date();
  
  // Admin bypass - always show unlocked for admins (check handled by caller)
  
  // Check if launch date has passed
  if (now >= LAUNCH_DATE) {
    return true;
  }
  
  // Special cases for features that are always available
  const alwaysAvailable = [
    'profile_edit',
    'settings',
    'help',
    'notifications_view'
  ];
  
  if (alwaysAvailable.includes(featureName)) {
    return true;
  }
  
  return false;
}

// Alias for backwards compatibility - FIX for "isFeatureAvailable is not a function" error
export const isFeatureAvailable = isFeatureUnlocked;

/**
 * Get time remaining until launch
 */
export function getTimeUntilLaunch() {
  const now = new Date();
  const distance = LAUNCH_DATE - now;
  
  if (distance < 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isLaunched: true };
  }
  
  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000),
    isLaunched: false
  };
}

/**
 * Get launch date for display
 */
export function getLaunchDate() {
  return LAUNCH_DATE;
}

/**
 * Feature definitions with metadata
 */
export const FEATURES = {
  members_directory: {
    name: 'Member Directory',
    description: 'Browse and connect with all Circle Reserve members',
    value: 'Access to 500 high-performing professionals across finance, tech, consulting, and commerce',
    icon: 'Users'
  },
  messaging: {
    name: 'Direct Messaging',
    description: 'Private conversations with any member',
    value: 'Direct access to decision-makers without gatekeepers',
    icon: 'MessageSquare'
  },
  events: {
    name: 'Exclusive Events',
    description: 'Virtual and in-person gatherings',
    value: 'Attend curated events, dinners, and roundtables with fellow members',
    icon: 'Calendar'
  },
  requests: {
    name: 'Request Board',
    description: 'Ask for help, offer expertise',
    value: 'Get introductions, advice, and partnerships from the network',
    icon: 'Target'
  },
  strategic_intros: {
    name: 'Strategic Intros AI',
    description: 'AI-curated weekly connection recommendations',
    value: 'Receive 3 high-value connection suggestions every week with detailed context on why they matter',
    icon: 'Sparkles'
  },
  value_exchange: {
    name: 'Value Exchange Board',
    description: 'Marketplace for expertise and help',
    value: 'Post what you offer (expertise, intros, resources) and what you seek - with Impact Score reputation tracking',
    icon: 'TrendingUp'
  },
  deal_rooms: {
    name: 'Private Deal Rooms',
    description: 'Secure collaboration spaces',
    value: 'Collaborate on investments, partnerships, and acquisitions with built-in tools and NDAs',
    icon: 'Lock'
  },
  referrals: {
    name: 'Referral Program',
    description: 'Invite trusted peers',
    value: 'Each founding member gets 5 priority invitations for vetted connections',
    icon: 'Gift'
  },
  impact_dashboard: {
    name: 'Impact Dashboard',
    description: 'Track your network ROI',
    value: 'See tangible value created: connections made, value exchanged, Impact Score',
    icon: 'Award'
  }
};

/**
 * Check if user is admin (bypass all locks)
 */
export function canBypassLocks(user) {
  return user?.is_admin === true;
}

/**
 * Get feature status for a user
 */
export function getFeatureStatus(featureName, user = null) {
  const feature = FEATURES[featureName];
  
  if (!feature) {
    return { unlocked: false, exists: false };
  }
  
  // Admins bypass all locks
  if (canBypassLocks(user)) {
    return { unlocked: true, adminBypass: true, ...feature };
  }
  
  const unlocked = isFeatureUnlocked(featureName);
  const timeRemaining = getTimeUntilLaunch();
  
  return {
    unlocked,
    ...feature,
    timeRemaining,
    launchDate: getLaunchDate()
  };
}
