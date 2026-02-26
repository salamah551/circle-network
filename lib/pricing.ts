// lib/pricing.ts
/**
 * Single source of truth for Circle Network pricing strategy
 * All pricing, limits, and features are defined here and consumed throughout the app
 */

/**
 * Tier identifier types
 */
export type TierId = 'professional' | 'pro' | 'elite';

/**
 * Tier identifier including special founding offer
 */
export type TierIdWithFounding = TierId | 'founding';

/**
 * Usage limits for each tier
 */
export interface UsageLimits {
  briefpointDaily: number;
  arcMonthly: number;
  introsWeekly: number;
  deepDiveMonthly?: number;
  delivery?: string[];
}

/**
 * Membership tier structure
 */
export interface MembershipTier {
  id: TierId;
  name: string;
  priceMonthlyCents: number;
  features: string[];
  limits: UsageLimits;
  target: string;
}

/**
 * Founding member special offer
 */
export interface FoundingOffer {
  appliesTo: TierId;
  priceMonthlyCents: number;
  durationMonths: number;
}

/**
 * Standardized pricing tiers - single source of truth
 */
export const TIERS: MembershipTier[] = [
  {
    id: 'professional',
    name: 'Professional',
    priceMonthlyCents: 19900,
    target: 'Individual operators/founders',
    features: [
      '5 BriefPoint briefs per day',
      '10 ARC requests per month',
      '1 Strategic Intro per week',
      'Email delivery',
      'Community access',
      'Event access'
    ],
    limits: {
      briefpointDaily: 5,
      arcMonthly: 10,
      introsWeekly: 1,
      delivery: ['email']
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthlyCents: 29900,
    target: 'Power users, sales leaders, VCs',
    features: [
      '10 BriefPoint briefs per day',
      '30 ARC requests per month',
      '3 Strategic Intros per week',
      'Slack & Email delivery',
      'Priority support',
      'AI-curated matches',
      'Everything in Professional'
    ],
    limits: {
      briefpointDaily: 10,
      arcMonthly: 30,
      introsWeekly: 3,
      delivery: ['email', 'slack']
    }
  },
  {
    id: 'elite',
    name: 'Elite',
    priceMonthlyCents: 49900,
    target: 'Top-tier executives/investors',
    features: [
      '25 BriefPoint briefs per day',
      '100 ARC requests per month',
      '5+ Strategic Intros per week',
      '1 monthly "Deep Dive" brief',
      'Slack & Email delivery',
      'White-glove concierge',
      'Dedicated account manager',
      'Everything in Pro'
    ],
    limits: {
      briefpointDaily: 25,
      arcMonthly: 100,
      introsWeekly: 5,
      deepDiveMonthly: 1,
      delivery: ['email', 'slack']
    }
  }
];

/**
 * Founding Members special offer - Pro tier at discounted rate for 24 months
 */
export const FOUNDING_OFFER: FoundingOffer = {
  appliesTo: 'pro',
  priceMonthlyCents: 21900, // $219/mo
  durationMonths: 24
};

/**
 * Get Stripe price ID for a given tier
 * @param tierId - Tier identifier (professional, pro, elite, or 'founding' for special offer)
 * @returns Stripe price ID from environment variables
 */
export function getStripePriceIdByTier(tierId: TierIdWithFounding): string | undefined {
  switch (tierId) {
    case 'professional':
      return process.env.NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL;
    case 'pro':
      return process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;
    case 'elite':
      return process.env.NEXT_PUBLIC_STRIPE_PRICE_ELITE;
    case 'founding':
      return process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDING;
    default:
      return undefined;
  }
}

/**
 * Get usage limits for a tier
 * @param tierId - Tier identifier
 * @returns Usage limits object
 */
export function getUsageLimits(tierId: TierId): UsageLimits {
  const tier = TIERS.find(t => t.id === tierId);
  if (!tier) {
    // Default to professional tier limits if tier not found
    return TIERS[0].limits;
  }
  return tier.limits;
}

/**
 * Format price as monthly display string
 * @param tierId - Tier identifier or 'founding'
 * @returns Formatted price string (e.g., "$199/mo")
 */
export function formatPriceMonthly(tierId: TierIdWithFounding): string {
  if (tierId === 'founding') {
    return `$${(FOUNDING_OFFER.priceMonthlyCents / 100).toFixed(0)}/mo`;
  }
  
  const tier = TIERS.find(t => t.id === tierId);
  if (!tier) {
    return '$—/mo';
  }
  
  return `$${(tier.priceMonthlyCents / 100).toFixed(0)}/mo`;
}

/**
 * Get tier by ID
 * @param tierId - Tier identifier
 * @returns Tier object or undefined
 */
export function getTierById(tierId: TierId): MembershipTier | undefined {
  return TIERS.find(t => t.id === tierId);
}

// Legacy compatibility functions (deprecated - use TIERS instead)

/**
 * @deprecated Use TIERS instead
 */
export function formatPrice(envValue: string | undefined, fallback: string = '—'): string {
  if (!envValue) return fallback;
  
  const price = parseFloat(envValue);
  if (isNaN(price)) return fallback;
  
  return price.toLocaleString('en-US');
}

/**
 * @deprecated Use TIERS instead
 */
export interface MembershipTierLegacy {
  name: string;
  price: number;
  formattedPrice: string;
}

/**
 * @deprecated Use TIERS instead - keeping for backwards compatibility
 */
export function getThreeTierPricing(): {
  innerCircle: MembershipTierLegacy;
  charter: MembershipTierLegacy;
  professional: MembershipTierLegacy;
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
 * @deprecated Use TIERS instead
 */
export function getCharterAnnualPrice(): string {
  return formatPrice(process.env.NEXT_PUBLIC_CHARTER_ANNUAL_PRICE, '3,500');
}

/**
 * @deprecated Use TIERS instead
 */
export function shouldShowCharterUrgencyBadge(): boolean {
  const flagValue = process.env.NEXT_PUBLIC_SHOW_CHARTER_URGENCY;
  if (!flagValue) return true;
  return flagValue === 'true' || flagValue === '1' || flagValue.toLowerCase() === 'yes';
}

/**
 * Launch mode configuration — when LAUNCH_MODE is true, only the founding tier
 * is presented on the subscribe page to reduce decision fatigue for cold outreach leads.
 */
export const LAUNCH_TIER: TierIdWithFounding = 'founding';
export const LAUNCH_MODE = true;

/**
 * @deprecated Use TIERS instead
 */
export function getMRRValues(): { founding: number; regular: number } {
  const foundingMRR = process.env.NEXT_PUBLIC_FOUNDING_MRR
    ? Number(process.env.NEXT_PUBLIC_FOUNDING_MRR)
    : 199;
  
  const regularMRR = process.env.NEXT_PUBLIC_REGULAR_MRR
    ? Number(process.env.NEXT_PUBLIC_REGULAR_MRR)
    : 249;
  
  return {
    founding: isNaN(foundingMRR) ? 199 : foundingMRR,
    regular: isNaN(regularMRR) ? 249 : regularMRR
  };
}
