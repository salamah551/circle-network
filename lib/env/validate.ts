// lib/env/validate.ts
// Environment validation helper to check for missing critical configuration

export interface MissingEnvKeys {
  keys: string[];
  hasMissing: boolean;
}

/**
 * Validates critical ARC environment variables
 * Returns an object with missing keys and a flag
 */
export function validateArcEnvironment(): MissingEnvKeys {
  const criticalKeys = [
    'ARC_LIMIT_FOUNDING',
    'ARC_LIMIT_ELITE',
    'ARC_LIMIT_CHARTER',
    'ARC_LIMIT_PROFESSIONAL',
    'ARC_STORAGE_BUCKET',
  ];

  const missing: string[] = [];

  criticalKeys.forEach((key) => {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      missing.push(key);
    }
  });

  return {
    keys: missing,
    hasMissing: missing.length > 0,
  };
}

/**
 * Server-only keys (never exposed to the browser).
 * Called in server contexts (API routes, Server Components).
 */
const SERVER_CRITICAL_KEYS = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'OPS_API_TOKEN',
  'SLACK_SIGNING_SECRET',
  'OPENAI_API_KEY',
];

/**
 * Public keys available in both browser and server contexts.
 */
const PUBLIC_CRITICAL_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_STRIPE_PRICE_PRO',
  'NEXT_PUBLIC_STRIPE_PRICE_ELITE',
  'NEXT_PUBLIC_STRIPE_PRICE_FOUNDING',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_POSTHOG_KEY',
];

function checkKeys(keys: string[]): string[] {
  return keys.filter((key) => {
    const value = process.env[key];
    return !value || value.trim() === '';
  });
}

/**
 * Validates all critical server-side environment variables.
 * Should only be called from server contexts.
 */
export function validateServerEnvironment(): MissingEnvKeys {
  const missing = checkKeys([...PUBLIC_CRITICAL_KEYS, ...SERVER_CRITICAL_KEYS]);
  return { keys: missing, hasMissing: missing.length > 0 };
}

/**
 * Validates public (client-safe) environment variables.
 * Safe to call from both browser and server contexts.
 */
export function validatePublicEnvironment(): MissingEnvKeys {
  const missing = checkKeys(PUBLIC_CRITICAL_KEYS);
  return { keys: missing, hasMissing: missing.length > 0 };
}

/**
 * Returns true when the Supabase keys required for auth are present.
 */
export function hasSupabaseKeys(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
}

/**
 * Logs a warning to the server console for any missing critical env vars.
 * Call once at app startup (e.g. in a server layout or instrumentation file).
 */
export function warnMissingServerEnv(): void {
  const { keys, hasMissing } = validateServerEnvironment();
  if (hasMissing) {
    console.warn(
      `⚠️  Missing critical environment variables: ${keys.join(', ')}. ` +
        'Some features will be unavailable. Check .env.example for required keys.'
    );
  }

  // ARC-specific storage reminder
  if (!process.env.ARC_STORAGE_BUCKET) {
    console.warn(
      '⚠️  ARC_STORAGE_BUCKET is not set. Ensure the arc-uploads bucket exists in ' +
        'Supabase Storage and is configured as private with appropriate RLS policies.'
    );
  }
}
