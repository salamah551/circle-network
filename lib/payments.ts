/**
 * lib/payments.ts
 * Centralized payment utilities for Circle Network
 * Handles Stripe session creation, metadata normalization, and error handling
 */

import Stripe from 'stripe';

// Initialize Stripe client
let stripeInstance: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-08-27.basil',
    });
  }
  return stripeInstance;
}

/**
 * Tier mapping type
 */
export type TierType = 'inner-circle' | 'core' | 'founding' | 'premium' | 'elite';

/**
 * Session metadata interface
 */
export interface SessionMetadata {
  userId: string;
  membershipTier: string;
  isFoundingMember: 'true' | 'false';
  invite_id?: string;
  invite_code?: string;
  campaign_id?: string;
}

/**
 * Build success URL for checkout session
 */
export function buildSuccessUrl(tier: string, sessionId?: boolean): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL is not configured');
  }
  
  if (sessionId) {
    return `${baseUrl}/welcome?tier=${encodeURIComponent(tier)}&session_id={CHECKOUT_SESSION_ID}`;
  }
  return `${baseUrl}/welcome?tier=${encodeURIComponent(tier)}`;
}

/**
 * Build cancel URL for checkout session
 */
export function buildCancelUrl(email: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL is not configured');
  }
  
  return `${baseUrl}/subscribe?canceled=true&email=${encodeURIComponent(email)}`;
}

/**
 * Build metadata object for session and subscription
 */
export function buildMetadata(
  userId: string,
  tier: string,
  options?: {
    invite_id?: string;
    invite_code?: string;
    campaign_id?: string;
  }
): SessionMetadata {
  const isFoundingTier = tier === 'inner-circle' || tier === 'founding';
  
  const metadata: SessionMetadata = {
    userId,
    membershipTier: tier,
    isFoundingMember: isFoundingTier ? 'true' : 'false',
  };
  
  if (options?.invite_id) {
    metadata.invite_id = options.invite_id;
  }
  if (options?.invite_code) {
    metadata.invite_code = options.invite_code;
  }
  if (options?.campaign_id) {
    metadata.campaign_id = options.campaign_id;
  }
  
  return metadata;
}

/**
 * Resolve price ID from tier or explicit priceId
 */
export function resolvePriceId(
  tier?: TierType | string,
  explicitPriceId?: string
): string {
  // If explicit price ID provided, use it
  if (explicitPriceId) {
    return explicitPriceId;
  }
  
  // Map tier to price ID from environment
  if (!tier) {
    throw new Error('Either tier or priceId must be provided');
  }
  
  const tierLower = tier.toLowerCase();
  let priceId: string | undefined;
  
  switch (tierLower) {
    case 'inner-circle':
    case 'founding':
      priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDING;
      break;
    case 'core':
    case 'premium':
      priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM;
      break;
    case 'elite':
      priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ELITE;
      break;
    default:
      throw new Error(`Unknown tier: ${tier}`);
  }
  
  // In production, fail fast if price ID is not configured
  if (!priceId && process.env.NODE_ENV === 'production') {
    throw new Error(`Price ID not configured for tier: ${tier}`);
  }
  
  if (!priceId) {
    throw new Error(`Price ID not found for tier: ${tier}`);
  }
  
  return priceId;
}

/**
 * Normalize resolved tier name
 */
export function normalizeTierName(tier?: TierType | string): string {
  if (!tier) {
    return 'inner-circle';
  }
  
  const tierLower = tier.toLowerCase();
  
  // Map legacy names to new names
  if (tierLower === 'founding') {
    return 'inner-circle';
  }
  if (tierLower === 'premium') {
    return 'core';
  }
  
  return tierLower;
}

/**
 * Create a Stripe Checkout Session for subscriptions
 */
export async function createSubscriptionSession(params: {
  userId: string;
  email: string;
  tier?: TierType | string;
  priceId?: string;
  invite_id?: string;
  invite_code?: string;
  campaign_id?: string;
}): Promise<{ url: string; sessionId: string }> {
  const stripe = getStripeClient();
  
  // Resolve the price ID
  const finalPriceId = resolvePriceId(params.tier, params.priceId);
  
  // Normalize tier name
  const resolvedTier = normalizeTierName(params.tier);
  
  // Build metadata
  const metadata = buildMetadata(params.userId, resolvedTier, {
    invite_id: params.invite_id,
    invite_code: params.invite_code,
    campaign_id: params.campaign_id,
  });
  
  // Create session with proper typing
  const session = await stripe.checkout.sessions.create({
    customer_email: params.email as any, // Type assertion needed for Stripe SDK compatibility
    line_items: [
      {
        price: finalPriceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: buildSuccessUrl(resolvedTier, true),
    cancel_url: buildCancelUrl(params.email),
    metadata: metadata as any,
    subscription_data: {
      metadata: metadata as any,
    },
    allow_promotion_codes: true,
  } as any); // Type assertion for Stripe SDK compatibility
  
  if (!session.url) {
    throw new Error('Failed to create checkout session URL');
  }
  
  return {
    url: session.url,
    sessionId: session.id,
  };
}

/**
 * Create a Stripe Checkout Session for one-time payments
 */
export async function createOneTimeSession(params: {
  productName: string;
  productDescription: string;
  amount: number; // in cents
  currency?: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
}): Promise<{ url: string; sessionId: string }> {
  const stripe = getStripeClient();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL is not configured');
  }
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'] as any,
    line_items: [
      {
        price_data: {
          currency: params.currency || 'usd',
          product_data: {
            name: params.productName,
            description: params.productDescription,
          },
          unit_amount: params.amount,
        } as any,
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: params.successUrl || `${baseUrl}/order-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: params.cancelUrl || baseUrl,
    metadata: params.metadata || {},
  } as any); // Type assertion for Stripe SDK compatibility
  
  if (!session.url) {
    throw new Error('Failed to create checkout session URL');
  }
  
  return {
    url: session.url,
    sessionId: session.id,
  };
}

/**
 * Normalize Stripe errors to user-friendly messages
 */
export function normalizeStripeError(error: any): string {
  if (error.type === 'StripeInvalidRequestError') {
    return 'Invalid payment configuration. Please contact support with error code: STRIPE_001';
  }
  
  if (error.type === 'StripeCardError') {
    return error.message || 'Card payment failed. Please check your card details.';
  }
  
  if (error.type === 'StripeConnectionError') {
    return 'Unable to connect to payment service. Please try again.';
  }
  
  return error.message || 'Payment processing error. Please try again or contact support.';
}

/**
 * Validate required environment variables
 */
export function validatePaymentConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!process.env.STRIPE_SECRET_KEY) {
    errors.push('STRIPE_SECRET_KEY is not configured');
  }
  
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    errors.push('NEXT_PUBLIC_APP_URL is not configured');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
