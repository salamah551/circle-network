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
 * Three-tier membership pricing structure
 */
export interface MembershipTier {
  name: string;
  price: number;
  formattedPrice: string;
}

/**
 * Get three-tier membership pricing configuration
 * @returns Object with Inner Circle, Charter, and Professional pricing
 */
export function getThreeTierPricing(): {
  innerCircle: MembershipTier;
  charter: MembershipTier;
  professional: MembershipTier;
} {
  const innerCirclePrice = process.env.NEXT_PUBLIC_INNER_CIRCLE_PRICE
    ? Number(process.env.NEXT_PUBLIC_INNER_CIRCLE_PRICE)
    : 25000;
  
  const charterPrice = process.env.NEXT_PUBLIC_CHARTER_ANNUAL_PRICE
    ? Number(process.env.NEXT_PUBLIC_CHARTER_ANNUAL_PRICE)
    : 3500;
  
  const professionalPrice = process.env.NEXT_PUBLIC_PROFESSIONAL_PRICE
    ? Number(process.env.NEXT_PUBLIC_PROFESSIONAL_PRICE)
    : 5000;

  return {
    innerCircle: {
      name: 'Inner Circle',
      price: isNaN(innerCirclePrice) ? 25000 : innerCirclePrice,
      formattedPrice: formatPrice(innerCirclePrice.toString(), '25,000')
    },
    charter: {
      name: 'Charter Member',
      price: isNaN(charterPrice) ? 3500 : charterPrice,
      formattedPrice: formatPrice(charterPrice.toString(), '3,500')
    },
    professional: {
      name: 'Professional Member',
      price: isNaN(professionalPrice) ? 5000 : professionalPrice,
      formattedPrice: formatPrice(professionalPrice.toString(), '5,000')
    }
  };
}

/**
 * Get charter annual price from environment
 * @returns Formatted charter annual price
 */
export function getCharterAnnualPrice(): string {
  return formatPrice(process.env.NEXT_PUBLIC_CHARTER_ANNUAL_PRICE, '3,500');
}

/**
 * Check if charter urgency badge should be shown
 * @returns Boolean indicating if urgency badge should be displayed
 */
export function shouldShowCharterUrgencyBadge(): boolean {
  const flagValue = process.env.NEXT_PUBLIC_SHOW_CHARTER_URGENCY;
  // Default to true if not set, or explicitly check for true/1/yes
  if (!flagValue) return true;
  return flagValue === 'true' || flagValue === '1' || flagValue.toLowerCase() === 'yes';
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
