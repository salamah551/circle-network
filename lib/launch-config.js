// Centralized launch & feature flags

export const LAUNCH_DATE_ISO =
  process.env.NEXT_PUBLIC_LAUNCH_DATE || '2099-01-01T00:00:00Z';

export const LAUNCH_DATE = new Date(LAUNCH_DATE_ISO);

export function isLaunched() {
  return Date.now() >= LAUNCH_DATE.getTime();
}

export function msUntilLaunch() {
  return Math.max(0, LAUNCH_DATE.getTime() - Date.now());
}

/**
 * featureFlag(name: string): boolean
 * Extend per-feature rules if needed. For now, all premium features unlock on launch.
 */
export function featureFlag(_name) {
  return isLaunched();
}
