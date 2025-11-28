// lib/stripe.js
import Stripe from 'stripe';

// Initialize Stripe with your secret key (guarded)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  : null;

export const createCheckoutSession = async ({ 
  userId, 
  email, 
  priceId, 
  isFoundingMember = true 
}) => {
  try {
    // Validate that Stripe is initialized
    if (!stripe) {
      console.error('createCheckoutSession: Stripe not initialized - STRIPE_SECRET_KEY not set');
      return { 
        session: null, 
        error: new Error('Stripe not configured') 
      };
    }

    // Validate that we have a price ID
    if (!priceId) {
      console.error('createCheckoutSession: No price ID provided');
      return { 
        session: null, 
        error: new Error('Price ID is required') 
      };
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.error('createCheckoutSession: NEXT_PUBLIC_APP_URL not set');
      return { 
        session: null, 
        error: new Error('App URL not configured') 
      };
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [
        { 
          price: priceId, 
          quantity: 1 
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe?canceled=true`,
      metadata: { 
        userId, 
        isFoundingMember: isFoundingMember.toString() 
      },
      subscription_data: {
        metadata: { 
          userId, 
          isFoundingMember: isFoundingMember.toString() 
        },
      },
    });

    return { session, error: null };

  } catch (error) {
    console.error('Error creating checkout session:', error);
    console.error('Error details:', {
      type: error.type,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode
    });
    
    return { 
      session: null, 
      error: {
        message: error.message || 'Failed to create checkout session',
        type: error.type,
        code: error.code
      }
    };
  }
};

export const constructWebhookEvent = (payload, signature) => {
  try {
    if (!stripe) {
      return { event: null, error: new Error('Stripe not configured') };
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('constructWebhookEvent: STRIPE_WEBHOOK_SECRET not set');
      return { 
        event: null, 
        error: new Error('Webhook secret not configured') 
      };
    }

    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    return { event, error: null };
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return { event: null, error };
  }
};

export default stripe;
