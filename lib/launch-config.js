// lib/launch-config.js
// Centralized launch date configuration for Circle Network
// Launch Date: November 10, 2025, 12:00 AM Eastern Time

export const LAUNCH_DATE_ISO = 
  process.env.NEXT_PUBLIC_LAUNCH_DATE || '2025-11-10T00:00:00-05:00';

export const LAUNCH_DATE = new Date(LAUNCH_DATE_ISO);

/**
 * Check if platform has launched
 * @returns {boolean}
 */
export function isLaunched() {
  const now = Date.now();
  const launch = LAUNCH_DATE.getTime();
  return Number.isFinite(launch) && now >= launch;
}

/**
 * Get milliseconds until launch
 * @returns {number}
 */
export function msUntilLaunch() {
  const launch = LAUNCH_DATE.getTime();
  if (!Number.isFinite(launch)) return 0;
  return Math.max(0, launch - Date.now());
}

/**
 * Check if a feature should be unlocked
 * @param {string} featureName - Name of the feature
 * @returns {boolean}
 */
export function featureFlag(featureName) {
  // Features that are always available
  const alwaysAvailable = [
    'dashboard',
    'profile',
    'settings',
    'strategic_intros',
    'notifications'
  ];
  
  if (alwaysAvailable.includes(featureName)) {
    return true;
  }
  
  // All other premium features unlock on launch
  return isLaunched();
}

/**
 * Get formatted launch date for display
 * @returns {string}
 */
export function getFormattedLaunchDate() {
  return LAUNCH_DATE.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
    timeZoneName: 'short'
  });
}

/**
 * Get countdown object
 * @returns {object}
 */
export function getCountdown() {
  const ms = msUntilLaunch();
  
  if (ms <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isLaunched: true
    };
  }
  
  const seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return {
    days,
    hours,
    minutes,
    seconds: secs,
    isLaunched: false
  };
}
