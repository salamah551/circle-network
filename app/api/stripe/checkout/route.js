// app/api/stripe/checkout/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { priceId } = body;
  // Initialize at runtime
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });


    // Get the authorization token from the header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Create Supabase client WITHOUT global headers
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Get user with the token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('User error:', userError);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Validate price ID
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    // Verify Stripe credentials are set
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY not configured');
      return NextResponse.json(
        { error: 'Payment system not configured. Please contact support.' },
        { status: 500 }
      );
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.error('NEXT_PUBLIC_APP_URL not configured');
      return NextResponse.json(
        { error: 'Application URL not configured. Please contact support.' },
        { status: 500 }
      );
    }

    console.log('Creating checkout session for user:', user.id);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        { 
          price: priceId, 
          quantity: 1 
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?welcome=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe?canceled=true&email=${encodeURIComponent(user.email)}`,
      metadata: { 
        userId: user.id, 
        isFoundingMember: 'true'
      },
      subscription_data: {
        metadata: { 
          userId: user.id, 
          isFoundingMember: 'true'
        },
      },
    });

    console.log('Checkout session created:', session.id);
    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Checkout error:', error);
    
    // Return user-friendly error messages
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Invalid payment configuration. Please contact support with error code: STRIPE_001' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Unable to process payment. Please try again or contact support.' },
      { status: 500 }
    );
  }
}
