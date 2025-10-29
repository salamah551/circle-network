/**
 * Payment utilities library
 * Centralizes payment logic for creating checkout sessions and handling Stripe operations
 */

import Stripe from 'stripe';

export type MembershipTier = 'inner-circle' | 'core' | 'founding' | 'premium' | 'elite';

export interface CheckoutMetadata {
  userId: string;
  membershipTier: string;
  isFoundingMember: 'true' | 'false';
  invite_id?: string;
  invite_code?: string;
  campaign_id?: string;
}

/**
 * Get Stripe instance
 */
function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

/**
 * Build success URL for checkout session
 */
export function buildSuccessUrl(tier: string, appUrl: string): string {
  return `${appUrl}/welcome?tier=${tier}`;
}

/**
 * Build cancel URL for checkout session
 */
export function buildCancelUrl(email: string, appUrl: string): string {
  return `${appUrl}/subscribe?canceled=true&email=${encodeURIComponent(email)}`;
}

/**
 * Normalize Stripe errors into user-friendly messages
 */
export function normalizeStripeError(error: any): string {
  if (error.type === 'StripeInvalidRequestError') {
    return 'Invalid payment configuration. Please contact support.';
  }
  
  if (error.type === 'StripeCardError') {
    return error.message || 'Card payment failed. Please try a different card.';
  }
  
  return error.message || 'Payment processing error. Please try again.';
}

/**
 * Build metadata object for Stripe session and subscription
 */
export function buildMetadata(
  userId: string,
  tier: string,
  invite_id?: string,
  invite_code?: string,
  campaign_id?: string
): CheckoutMetadata {
  const isFoundingMember = tier.toLowerCase() === 'founding' || tier.toLowerCase() === 'inner-circle';
  
  const metadata: CheckoutMetadata = {
    userId,
    membershipTier: tier,
    isFoundingMember: isFoundingMember ? 'true' : 'false'
  };
  
  if (invite_id) metadata.invite_id = invite_id;
  if (invite_code) metadata.invite_code = invite_code;
  if (campaign_id) metadata.campaign_id = campaign_id;
  
  return metadata;
}

/**
 * Map tier to price ID from environment variables
 * Maps new tier names to existing price IDs:
 * - inner-circle -> founding price
 * - core -> premium price
 */
export function resolvePriceId(tier?: string, explicitPriceId?: string): string | null {
  if (explicitPriceId) {
    return explicitPriceId;
  }
  
  if (!tier) {
    return null;
  }
  
  const tierLower = tier.toLowerCase();
  
  // Map new tier names to env variables
  const tierToPriceId: Record<string, string | undefined> = {
    'inner-circle': process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDING,
    'founding': process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDING,
    'core': process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM,
    'premium': process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM,
    'elite': process.env.NEXT_PUBLIC_STRIPE_PRICE_ELITE
  };
  
  return tierToPriceId[tierLower] || null;
}

/**
 * Validate required environment variables
 */
export function validatePaymentEnv(): { valid: boolean; error?: string } {
  if (!process.env.STRIPE_SECRET_KEY) {
    return { valid: false, error: 'STRIPE_SECRET_KEY not configured' };
  }
  
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    return { valid: false, error: 'NEXT_PUBLIC_APP_URL not configured' };
  }
  
  return { valid: true };
}

/**
 * Fail fast in production if required price IDs are missing
 */
export function validateProductionPriceIds(): { valid: boolean; error?: string } {
  if (process.env.NODE_ENV !== 'production') {
    return { valid: true };
  }
  
  const requiredPrices = [
    'NEXT_PUBLIC_STRIPE_PRICE_FOUNDING',
    'NEXT_PUBLIC_STRIPE_PRICE_PREMIUM',
    'NEXT_PUBLIC_STRIPE_PRICE_ELITE'
  ];
  
  const missing = requiredPrices.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    return { 
      valid: false, 
      error: `Missing price IDs in production: ${missing.join(', ')}` 
    };
  }
  
  return { valid: true };
}

/**
 * Create a one-time payment checkout session (e.g., for Flash Briefing)
 */
export async function createOneTimeSession(params: {
  productName: string;
  productDescription: string;
  amount: number; // in cents
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: params.productName,
            description: params.productDescription,
          },
          unit_amount: params.amount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata || {},
  });
  
  return session;
}

/**
 * Create a subscription checkout session
 */
export async function createSubscriptionSession(params: {
  email: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata: CheckoutMetadata;
  allowPromotionCodes?: boolean;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    customer_email: params.email,
    line_items: [
      { 
        price: params.priceId, 
        quantity: 1 
      }
    ],
    mode: 'subscription',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata as any,
    subscription_data: {
      metadata: params.metadata as any,
    },
    allow_promotion_codes: params.allowPromotionCodes !== false,
  });
  
  return session;
}
