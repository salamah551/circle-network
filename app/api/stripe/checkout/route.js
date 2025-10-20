// app/api/stripe/checkout/route.js
// Updated with new pricing: $2,497/$4,997/$9,997
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { priceId, tier } = body;

    // Initialize Stripe
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

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // Create Supabase admin client for secure queries
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
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

    // Check founding member count before determining pricing
    let actualTier = tier;
    
    // If requesting founding tier, check if spots are still available
    if (tier && tier.toLowerCase() === 'founding') {
      const { count: foundingCount, error: countError } = await supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_founding_member', true);
      
      if (countError) {
        console.error('Error checking founding member count:', countError);
      } else {
        console.log(`Current founding members: ${foundingCount || 0}`);
        
        // If 50 or more founding members exist, default to premium
        if ((foundingCount || 0) >= 50) {
          console.log('Founding member slots full, defaulting to premium tier');
          actualTier = 'premium';
        }
      }
    }
    
    // Map tier to correct Price ID (must be set via env vars in production)
    let finalPriceId = priceId;
    
    if (actualTier && !priceId) {
      const tierToPriceId = {
        'founding': process.env.NEXT_PUBLIC_STRIPE_PRICE_FOUNDING,
        'premium': process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM,
        'elite': process.env.NEXT_PUBLIC_STRIPE_PRICE_ELITE
      };
      
      finalPriceId = tierToPriceId[actualTier.toLowerCase()];
      
      // In production, fail fast if price IDs are not configured
      if (!finalPriceId && process.env.NODE_ENV === 'production') {
        console.error(`Price ID not configured for tier: ${actualTier}`);
        return NextResponse.json(
          { error: 'Payment configuration error. Please contact support.' },
          { status: 500 }
        );
      }
    }

    // Validate price ID
    if (!finalPriceId) {
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

    // Server-side logging only (no client-side price IDs in logs)
    console.log('Creating checkout session for user:', user.id, 'Tier:', tier || 'direct');

    // Determine tier name for metadata (use actualTier which may have been adjusted)
    const tierName = actualTier || tier || 'founding';
    const isFoundingMemberTier = tierName.toLowerCase() === 'founding';

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        { 
          price: finalPriceId, 
          quantity: 1 
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?welcome=true&tier=${tierName}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe?canceled=true&email=${encodeURIComponent(user.email)}`,
      metadata: { 
        userId: user.id, 
        isFoundingMember: isFoundingMemberTier ? 'true' : 'false',
        membershipTier: tierName
      },
      subscription_data: {
        metadata: { 
          userId: user.id, 
          isFoundingMember: isFoundingMemberTier ? 'true' : 'false',
          membershipTier: tierName
        },
      },
      allow_promotion_codes: true, // Allow discount codes
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
      { error: error.message || 'Payment processing error. Please try again.' },
      { status: 500 }
    );
  }
}
