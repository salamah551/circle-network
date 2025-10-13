// lib/launch-config.js
// Centralized launch date + feature flags (pure ESM)

export const LAUNCH_DATE_ISO =
  process.env.NEXT_PUBLIC_LAUNCH_DATE || '2099-01-01T00:00:00Z';

export const LAUNCH_DATE = new Date(LAUNCH_DATE_ISO);

export function isLaunched() {
  // Return a boolean at runtime; safe on both server and client
  const t = Date.now();
  const launch = LAUNCH_DATE.getTime();
  return Number.isFinite(launch) && t >= launch;
}

export function msUntilLaunch() {
  const launch = LAUNCH_DATE.getTime();
  if (!Number.isFinite(launch)) return 0;
  return Math.max(0, launch - Date.now());
}

export function featureFlag(_name) {
  // All premium features unlock on/after launch
  return isLaunched();
}
