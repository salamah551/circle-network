// lib/stripe.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export const createCheckoutSession = async ({ 
  userId, 
  email, 
  priceId, 
  isFoundingMember = true 
}) => {
  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/signup?canceled=true`,
      metadata: { userId, isFoundingMember: isFoundingMember.toString() },
      subscription_data: {
        metadata: { userId, isFoundingMember: isFoundingMember.toString() },
      },
    });
    return { session, error: null };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return { session: null, error };
  }
};

export const constructWebhookEvent = (payload, signature) => {
  try {
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