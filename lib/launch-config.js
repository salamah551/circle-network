// Phased Launch Strategy
// Oct 10: Start sending invites to founding members
// Nov 1: Full public launch with all features

export const LAUNCH_CONFIG = {
  // Key dates
  INVITE_START_DATE: new Date('2025-10-10T00:00:00').getTime(),
  FULL_LAUNCH_DATE: new Date('2025-11-01T00:00:00').getTime(),
  
  // Launch phases
  PHASE: {
    PRE_INVITE: 'pre-invite',      // Before Oct 10
    INVITE_ONLY: 'invite-only',    // Oct 10 - Oct 31
    FULL_LAUNCH: 'full-launch'     // Nov 1 onwards
  }
};

// Determine current launch phase
export function getCurrentLaunchPhase() {
  const now = Date.now();
  
  if (now < LAUNCH_CONFIG.INVITE_START_DATE) {
    return LAUNCH_CONFIG.PHASE.PRE_INVITE;
  } else if (now < LAUNCH_CONFIG.FULL_LAUNCH_DATE) {
    return LAUNCH_CONFIG.PHASE.INVITE_ONLY;
  } else {
    return LAUNCH_CONFIG.PHASE.FULL_LAUNCH;
  }
}

// Check if feature is available in current phase
export function isFeatureAvailable(feature) {
  const phase = getCurrentLaunchPhase();
  
  const featureAvailability = {
    // Always available
    landing: true,
    login: true,
    subscribe: true,
    
    // Available during invite-only and full launch
    dashboard: phase !== LAUNCH_CONFIG.PHASE.PRE_INVITE,
    messaging: phase !== LAUNCH_CONFIG.PHASE.PRE_INVITE,
    members: phase !== LAUNCH_CONFIG.PHASE.PRE_INVITE,
    
    // Only available after full launch
    events: phase === LAUNCH_CONFIG.PHASE.FULL_LAUNCH,
    requests: phase === LAUNCH_CONFIG.PHASE.FULL_LAUNCH,
    referrals: phase === LAUNCH_CONFIG.PHASE.FULL_LAUNCH,
  };
  
  return featureAvailability[feature] ?? false;
}

// Get launch messaging for current phase
export function getLaunchMessage() {
  const phase = getCurrentLaunchPhase();
  
  const messages = {
    [LAUNCH_CONFIG.PHASE.PRE_INVITE]: {
      title: 'Launching Soon',
      subtitle: 'Invites begin October 10, 2025',
      description: 'We\'re building an exclusive community of 500 founding members. Invites go out October 10th.'
    },
    [LAUNCH_CONFIG.PHASE.INVITE_ONLY]: {
      title: 'Invite-Only Access',
      subtitle: 'Full launch: November 1, 2025',
      description: 'You\'re part of our founding member group. Full platform features unlock November 1st.'
    },
    [LAUNCH_CONFIG.PHASE.FULL_LAUNCH]: {
      title: 'Welcome to The Circle',
      subtitle: 'All features now available',
      description: 'Connect, collaborate, and grow with 500 high-performing professionals.'
    }
  };
  
  return messages[phase];
}
