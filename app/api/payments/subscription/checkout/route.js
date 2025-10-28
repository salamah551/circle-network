// app/api/payments/subscription/checkout/route.js
// Canonical endpoint for subscription checkout
// Consolidates and replaces app/api/stripe/checkout and app/api/stripe/create-checkout-session
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { 
  createSubscriptionSession, 
  normalizeStripeError, 
  validatePaymentConfig 
} from '@/lib/payments';

export async function POST(request) {
  try {
    // Validate payment configuration first
    const configCheck = validatePaymentConfig();
    if (!configCheck.valid) {
      console.error('Payment configuration errors:', configCheck.errors);
      return NextResponse.json(
        { error: 'Payment system not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Authenticate user via Supabase server-side (cookies)
    const cookieStore = cookies();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Authentication error:', userError);
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to continue.' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { tier, priceId, invite_id, invite_code, campaign_id } = body;

    // Validate that we have either tier or priceId
    if (!tier && !priceId) {
      return NextResponse.json(
        { error: 'Either tier or priceId is required' },
        { status: 400 }
      );
    }

    // Create checkout session
    const session = await createSubscriptionSession({
      userId: user.id,
      email: user.email,
      tier,
      priceId,
      invite_id,
      invite_code,
      campaign_id,
    });

    console.log('Subscription checkout session created:', session.sessionId, 'for user:', user.id);

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.sessionId 
    });

  } catch (error) {
    console.error('Subscription checkout error:', error);
    
    const errorMessage = normalizeStripeError(error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
