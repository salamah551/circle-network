// lib/pricing.ts
/**
 * Pricing utility functions
 * Safely formats pricing values from environment variables
 */

/**
 * Format a price from environment variable with fallback
 * @param envValue - Environment variable value (string or undefined)
 * @param fallback - Fallback value if env is not set
 * @returns Formatted price string
 */
export function formatPrice(envValue: string | undefined, fallback: string = '—'): string {
  if (!envValue) return fallback;
  
  const price = parseFloat(envValue);
  if (isNaN(price)) return fallback;
  
  return price.toLocaleString('en-US');
}

/**
 * Get charter annual price from environment
 * @returns Formatted charter annual price
 */
export function getCharterAnnualPrice(): string {
  return formatPrice(process.env.NEXT_PUBLIC_CHARTER_ANNUAL_PRICE, '—');
}

/**
 * Get MRR (Monthly Recurring Revenue) values from environment
 * @returns Object with founding and regular MRR as numbers
 */
export function getMRRValues(): { founding: number; regular: number } {
  const foundingMRR = process.env.NEXT_PUBLIC_FOUNDING_MRR
    ? Number(process.env.NEXT_PUBLIC_FOUNDING_MRR)
    : 199; // Dev fallback
  
  const regularMRR = process.env.NEXT_PUBLIC_REGULAR_MRR
    ? Number(process.env.NEXT_PUBLIC_REGULAR_MRR)
    : 249; // Dev fallback
  
  return {
    founding: isNaN(foundingMRR) ? 199 : foundingMRR,
    regular: isNaN(regularMRR) ? 249 : regularMRR
  };
}
