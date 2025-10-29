/**
 * POST /api/payments/subscription/checkout
 * Creates a Stripe Checkout Session for subscription
 * Consolidates and replaces:
 * - app/api/stripe/checkout/route.js
 * - app/api/stripe/create-checkout-session/route.js
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { 
  createSubscriptionSession,
  validatePaymentEnv,
  validateProductionPriceIds,
  resolvePriceId,
  buildMetadata,
  buildSuccessUrl,
  buildCancelUrl,
  normalizeStripeError
} from '@/lib/payments';

export async function POST(request: Request) {
  try {
    // Validate environment
    const envCheck = validatePaymentEnv();
    if (!envCheck.valid) {
      console.error('Payment environment validation failed:', envCheck.error);
      return NextResponse.json(
        { error: 'Payment system not configured. Please contact support.' },
        { status: 500 }
      );
    }
    
    // Validate production price IDs
    const priceCheck = validateProductionPriceIds();
    if (!priceCheck.valid) {
      console.error('Production price validation failed:', priceCheck.error);
      return NextResponse.json(
        { error: 'Payment configuration error. Please contact support.' },
        { status: 500 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { tier, priceId, invite_id, invite_code, campaign_id } = body;
    
    // Authenticate user via Supabase server-side (cookies)
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }
    
    // Resolve price ID
    const finalPriceId = resolvePriceId(tier, priceId);
    
    if (!finalPriceId) {
      console.error('Could not resolve price ID for tier:', tier);
      return NextResponse.json(
        { error: 'Invalid membership tier or price configuration.' },
        { status: 400 }
      );
    }
    
    // Determine resolved tier name for metadata and URLs
    const resolvedTier = tier || 'founding';
    
    // Build metadata
    const metadata = buildMetadata(
      user.id,
      resolvedTier,
      invite_id,
      invite_code,
      campaign_id
    );
    
    // Build URLs
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    const successUrl = buildSuccessUrl(resolvedTier, appUrl);
    const cancelUrl = buildCancelUrl(user.email || '', appUrl);
    
    // Server-side logging only (no sensitive data in logs)
    console.log('Creating subscription checkout session for user:', user.id, 'Tier:', resolvedTier);
    
    // Create Stripe checkout session
    const session = await createSubscriptionSession({
      email: user.email!,
      priceId: finalPriceId,
      successUrl,
      cancelUrl,
      metadata,
      allowPromotionCodes: true,
    });
    
    console.log('Subscription checkout session created:', session.id);
    
    return NextResponse.json({ url: session.url });
    
  } catch (error: any) {
    console.error('Subscription checkout error:', error);
    
    const userFriendlyError = normalizeStripeError(error);
    
    return NextResponse.json(
      { error: userFriendlyError },
      { status: 500 }
    );
  }
}
