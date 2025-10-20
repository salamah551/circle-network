import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export async function POST(request) {
  // Validate required environment variables
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not configured');
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Supabase environment variables are not configured');
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 500 }
    );
  }

  // Initialize Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  
  // Initialize Supabase admin client
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Read the raw request body
  const body = await request.text();
  
  // Get the stripe-signature from the request headers
  const signature = request.headers.get('stripe-signature');

  let event;

  // Verify webhook signature
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Extract the client_reference_id from the Stripe session object
    const userId = session.client_reference_id;

    if (!userId) {
      console.error('No client_reference_id found in session');
      return NextResponse.json(
        { error: 'No user ID found in session' },
        { status: 400 }
      );
    }

    try {
      // Update the user's record in the profiles table
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          is_subscribed: true,
          membership_tier: 'founding'
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        return NextResponse.json(
          { error: 'Failed to update user profile' },
          { status: 500 }
        );
      }

      console.log(`User ${userId} subscription activated successfully`);
    } catch (error) {
      console.error('Error processing webhook:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  // Return 200 status to acknowledge receipt of the event to Stripe
  return NextResponse.json({ received: true }, { status: 200 });
}
