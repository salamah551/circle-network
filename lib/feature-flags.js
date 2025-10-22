/**
 * Feature Flag System
 * Controls feature availability based on launch date and user status
 * Launch Date: November 10, 2025, 12:00 AM ET
 * 
 * SECURITY NOTE: This client-side feature check is for UI purposes only
 * (e.g., showing countdown timers, disabled states in the UI).
 * 
 * For actual security-critical feature gating (e.g., API access, data visibility),
 * ALWAYS use the server-side endpoint at /api/features/check which cannot be
 * bypassed by manipulating the client's system clock or browser.
 */

// Admin user IDs who can bypass feature locks
const ADMIN_USER_IDS = ['9f305857-cf9b-47bd-aca1-75263d22973d'];

// Force unlock for testing (set to 'true' in env to unlock all features)
const FORCE_UNLOCK = process.env.NEXT_PUBLIC_FORCE_UNLOCK === 'true';

// Launch date: November 10, 2025, 12:00 AM Eastern Time
const LAUNCH_DATE = process.env.NEXT_PUBLIC_LAUNCH_DATE 
  ? new Date(process.env.NEXT_PUBLIC_LAUNCH_DATE) 
  : new Date('2025-11-10T00:00:00-05:00');

/**
 * Check if a feature is unlocked based on launch date and user permissions
 * @param {string} featureName - The name of the feature to check
 * @param {object} user - The user object (optional, for admin bypass)
 * @returns {boolean} - Whether the feature is unlocked
 */
export function isFeatureUnlocked(featureName, user = null) {
  // Force unlock override (for development/testing)
  if (FORCE_UNLOCK) return true;

  // Admin bypass - always unlocked for admins
  if (user && ADMIN_USER_IDS.includes(user.id)) {
    return true;
  }
  
  // Check if launch date has passed
  const now = new Date();
  if (now >= LAUNCH_DATE) {
    return true;
  }
  
  // Features that are ALWAYS available (even before launch)
  const alwaysAvailable = [
    'profile_edit',
    'profile_view',
    'settings',
    'help',
    'support',
    'notifications_view',
    'dashboard',
    'strategic_intros', // Strategic intros available from day 1
    'onboarding'
  ];
  
  if (alwaysAvailable.includes(featureName)) {
    return true;
  }
  
  // All other features locked until launch
  return false;
}

/**
 * Alias for backwards compatibility
 */
export const isFeatureAvailable = isFeatureUnlocked;

/**
 * Get detailed feature status with metadata
 * @param {string} featureName - The feature to check
 * @param {object} user - The user object
 * @returns {object} - Status object with unlocked, adminBypass, etc.
 */
export function getFeatureStatus(featureName, user = null) {
  const isAdmin = user && ADMIN_USER_IDS.includes(user.id);
  const now = new Date();
  const hasLaunched = now >= LAUNCH_DATE;
  const unlocked = isFeatureUnlocked(featureName, user);
  
  return {
    unlocked,
    adminBypass: isAdmin && !hasLaunched,
    hasLaunched,
    launchDate: LAUNCH_DATE,
    daysUntilLaunch: hasLaunched ? 0 : Math.ceil((LAUNCH_DATE - now) / (1000 * 60 * 60 * 24)),
    isAdmin
  };
}

/**
 * Get time remaining until launch
 * @returns {object} - Time breakdown and launch status
 */
export function getTimeUntilLaunch() {
  const now = new Date();
  const distance = LAUNCH_DATE - now;
  
  if (distance < 0) {
    return { 
      days: 0, 
      hours: 0, 
      minutes: 0, 
      seconds: 0, 
      isLaunched: true,
      totalMs: 0
    };
  }
  
  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000),
    isLaunched: false,
    totalMs: distance
  };
}

/**
 * Get launch date for display
 * @returns {Date} - The launch date
 */
export function getLaunchDate() {
  return LAUNCH_DATE;
}

/**
 * Format launch date for display
 * @returns {string} - Formatted date string
 */
export function getFormattedLaunchDate() {
  return LAUNCH_DATE.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/New_York'
  });
}

/**
 * Feature definitions with metadata
 * Used for feature cards and locked state displays
 */
export const FEATURES = {
  members_directory: {
    name: 'Member Directory',
    description: 'Browse and connect with all Circle members',
    value: 'Access to 250 founding members across finance, tech, consulting, and commerce',
    icon: 'Users',
    unlockDate: 'November 10, 2025'
  },
  messaging: {
    name: 'Direct Messaging',
    description: 'Private conversations with any member',
    value: 'Real-time messaging with read receipts and instant notifications',
    icon: 'MessageSquare',
    unlockDate: 'November 10, 2025'
  },
  events: {
    name: 'Exclusive Events',
    description: 'Virtual and in-person gatherings',
    value: 'Attend curated events, dinners, and roundtables with fellow members',
    icon: 'Calendar',
    unlockDate: 'November 10, 2025'
  },
  requests: {
    name: 'Request Board',
    description: 'Ask for help, offer expertise',
    value: 'Get introductions, advice, and partnerships from the network',
    icon: 'Target',
    unlockDate: 'November 10, 2025'
  },
  strategic_intros: {
    name: 'Strategic Intros',
    description: 'AI-curated weekly connection recommendations',
    value: 'Receive 3 high-value connection suggestions every week with detailed context',
    icon: 'Sparkles',
    unlockDate: 'Available Now' // Always available
  },
  expert_sessions: {
    name: 'Expert Sessions',
    description: '1-on-1 consultations with network experts',
    value: 'Book time with experts or offer your own expertise',
    icon: 'GraduationCap',
    unlockDate: 'November 10, 2025'
  },
  value_exchange: {
    name: 'Value Exchange',
    description: 'Marketplace for expertise and resources',
    value: 'Post what you offer and what you need',
    icon: 'TrendingUp',
    unlockDate: 'November 10, 2025'
  }
};

/**
 * Check if user is an admin
 * @param {object} user - User object with id
 * @returns {boolean}
 */
export function isAdmin(user) {
  return user && ADMIN_USER_IDS.includes(user.id);
}

/**
 * Get list of locked features
 * @param {object} user - User object
 * @returns {array} - Array of locked feature names
 */
export function getLockedFeatures(user = null) {
  const locked = [];
  for (const [key, feature] of Object.entries(FEATURES)) {
    if (!isFeatureUnlocked(key, user)) {
      locked.push({ key, ...feature });
    }
  }
  return locked;
}

/**
 * Get list of unlocked features
 * @param {object} user - User object
 * @returns {array} - Array of unlocked feature names
 */
export function getUnlockedFeatures(user = null) {
  const unlocked = [];
  for (const [key, feature] of Object.entries(FEATURES)) {
    if (isFeatureUnlocked(key, user)) {
      unlocked.push({ key, ...feature });
    }
  }
  return unlocked;
}
