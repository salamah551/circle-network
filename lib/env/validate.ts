// lib/env/validate.ts
// Environment validation helper to check for missing critical ARC configuration

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
