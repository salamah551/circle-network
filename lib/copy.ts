// lib/copy.ts
/**
 * Centralized microcopy constants with premium voice
 * Ensures consistent, confident messaging across the application
 */

/**
 * Canonical tier names - use these consistently throughout the app
 */
export const TIER_NAMES = {
  INNER_CIRCLE: 'Inner Circle',
  CHARTER_MEMBER: 'Charter Member',
  PROFESSIONAL_MEMBER: 'Professional Member',
} as const;

/**
 * Form validation messages with premium voice
 */
export const VALIDATION = {
  EMAIL_REQUIRED: "Let's double-check your email address…",
  EMAIL_INVALID: "That doesn't look quite right. Please enter a valid email.",
  PASSWORD_REQUIRED: 'Please provide your password to continue.',
  FIELD_REQUIRED: 'This field is required to proceed.',
  TERMS_REQUIRED: 'Please review and accept the terms to continue.',
} as const;

/**
 * Loading states with confident voice
 */
export const LOADING = {
  AUTHENTICATING: 'Authenticating your access…',
  SENDING_MAGIC_LINK: 'Sending your secure link…',
  PROCESSING: 'Processing your request…',
  LOADING_PROFILE: 'Loading your profile…',
  LOADING_DASHBOARD: 'Preparing your dashboard…',
  SUBMITTING: 'Submitting…',
} as const;

/**
 * Error messages with helpful, premium voice
 */
export const ERRORS = {
  GENERIC: 'Something unexpected happened. Please try again.',
  NETWORK: 'Connection issue. Please check your network and try again.',
  AUTH_FAILED: 'We couldn't authenticate your session. Please sign in again.',
  EMAIL_NOT_FOUND: 'We don't recognize that email. Do you need an invitation?',
  RATE_LIMIT: 'Too many attempts. Please wait a moment and try again.',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
} as const;

/**
 * Success messages with celebration
 */
export const SUCCESS = {
  MAGIC_LINK_SENT: 'Check your email! We've sent your secure sign-in link.',
  PROFILE_UPDATED: 'Your profile has been updated.',
  SETTINGS_SAVED: 'Your settings have been saved.',
  INTRO_ACCEPTED: 'Intro accepted—We'll notify the other member.',
  INTRO_DECLINED: 'Got it—We'll recalibrate future matches.',
  ARC_SUBMITTED: 'ARC is on it—your brief is now processing.',
} as const;

/**
 * Empty state messages with helpful CTAs
 */
export const EMPTY_STATES = {
  UPCOMING_TRAVEL: {
    title: 'No trips scheduled',
    description: 'Forward your next itinerary and ARC™ will watch for upgrades.',
    cta: 'How to forward trips',
  },
  AI_MATCHES: {
    title: 'We're calibrating your network',
    description: 'Complete your profile to unlock smarter intros.',
    cta: 'Complete profile',
  },
  ARC_BRIEFS: {
    title: 'No briefs yet',
    description: 'Try asking ARC to analyze your next contract or trip.',
    cta: 'Request a brief',
  },
  MARKET_INTEL: {
    title: 'No intel yet',
    description: 'Add competitors to watch in settings.',
    cta: 'Add competitors',
  },
} as const;

/**
 * Toast messages for optimistic UI
 */
export const TOASTS = {
  INTRO_ACCEPT: 'Intro accepted—We'll notify the other member.',
  INTRO_DECLINE: 'Got it—We'll recalibrate future matches.',
  ARC_REQUEST: 'ARC is on it—your brief is now processing.',
  PROFILE_SAVE: 'Profile updated successfully.',
  SETTINGS_SAVE: 'Settings saved.',
  COPY_SUCCESS: 'Copied to clipboard.',
  UNDO_AVAILABLE: 'Undo',
} as const;

/**
 * Magic link flow messages
 */
export const MAGIC_LINK = {
  CHECK_EMAIL_TITLE: 'Check Your Email',
  CHECK_EMAIL_DESCRIPTION: 'We've sent a secure sign-in link to',
  CHECK_EMAIL_INSTRUCTION: 'Click the link in the email to access your account.',
  RESEND_LINK: 'Resend link',
  CHANGE_EMAIL: 'Use a different email',
  COUNTDOWN_PREFIX: 'Resend available in',
  COUNTDOWN_SUFFIX: 'seconds',
} as const;

/**
 * Checkout success messages
 */
export const CHECKOUT_SUCCESS = {
  TITLE: 'Welcome to The Circle! 🎉',
  INNER_CIRCLE: 'You're now a founding Inner Circle member.',
  CHARTER: 'You're now a Charter Member with lifetime rate locked in.',
  PROFESSIONAL: 'You're now a Professional Member.',
  START_ONBOARDING: 'Start Onboarding',
  OPEN_DASHBOARD: 'Open Dashboard',
} as const;

/**
 * Accessibility labels for icon-only buttons
 */
export const ARIA_LABELS = {
  SAVE: 'Save',
  CLOSE: 'Close',
  MORE: 'More options',
  ACCEPT: 'Accept introduction',
  DECLINE: 'Decline introduction',
  EDIT: 'Edit',
  DELETE: 'Delete',
  MENU: 'Menu',
  NOTIFICATIONS: 'Notifications',
  PROFILE: 'Profile',
  SEARCH: 'Search',
} as const;

export default {
  TIER_NAMES,
  VALIDATION,
  LOADING,
  ERRORS,
  SUCCESS,
  EMPTY_STATES,
  TOASTS,
  MAGIC_LINK,
  CHECKOUT_SUCCESS,
  ARIA_LABELS,
};
