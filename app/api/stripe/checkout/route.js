// app/api/stripe/checkout/route.js
import { NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';
import { auth } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { priceId } = await request.json();

    const { user, error: authError } = await auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const validPriceIds = [
      process.env.STRIPE_ANNUAL_PRICE_ID,
      process.env.STRIPE_MONTHLY_PRICE_ID,
    ];

    if (!validPriceIds.includes(priceId)) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      );
    }

    const { session, error } = await createCheckoutSession({
      userId: user.id,
      email: user.email,
      priceId,
      isFoundingMember: true,
    });

    if (error) {
      console.error('Error creating checkout session:', error);
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}