// lib/posthog.js - PostHog analytics provider for tracking user conversion funnel
import posthog from 'posthog-js';

let isInitialized = false;

/**
 * Initialize PostHog on client-side only
 * Should be called once when the app loads
 */
export function initPostHog() {
  if (typeof window === 'undefined') return; // Only run on client
  if (isInitialized) return; // Prevent double initialization
  
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';
  
  if (!posthogKey) {
    console.warn('PostHog key not configured. Analytics will not be tracked.');
    return;
  }
  
  posthog.init(posthogKey, {
    api_host: posthogHost,
    // Enable automatic page view tracking
    capture_pageview: true,
    // Enable session recording (optional - can be disabled for privacy)
    disable_session_recording: false,
    // Respect user privacy preferences
    respect_dnt: true,
    // Persistence
    persistence: 'localStorage',
    // Advanced options
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('PostHog initialized successfully');
      }
    }
  });
  
  isInitialized = true;
}

/**
 * Track a custom event
 * @param {string} eventName - Name of the event to track
 * @param {object} properties - Additional properties to attach to the event
 */
export function trackEvent(eventName, properties = {}) {
  if (typeof window === 'undefined') return;
  if (!isInitialized) return;
  
  posthog.capture(eventName, properties);
}

/**
 * Identify a user with PostHog
 * @param {string} userId - Unique user identifier
 * @param {object} properties - User properties to attach
 */
export function identifyUser(userId, properties = {}) {
  if (typeof window === 'undefined') return;
  if (!isInitialized) return;
  
  posthog.identify(userId, properties);
}

/**
 * Track page view manually (if needed)
 * @param {string} pagePath - Path of the page being viewed
 */
export function trackPageView(pagePath) {
  if (typeof window === 'undefined') return;
  if (!isInitialized) return;
  
  posthog.capture('$pageview', {
    $current_url: window.location.href,
    path: pagePath
  });
}

/**
 * Reset PostHog state (e.g., on logout)
 */
export function resetPostHog() {
  if (typeof window === 'undefined') return;
  if (!isInitialized) return;
  
  posthog.reset();
}

export default posthog;
