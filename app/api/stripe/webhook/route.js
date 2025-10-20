import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export async function POST(request) {
  // Initialize at runtime
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  // IDEMPOTENCY: Check if event already processed
  const { data: existingEvent } = await supabaseAdmin
    .from('webhook_events')
    .select('id')
    .eq('event_id', event.id)
    .single();

  if (existingEvent) {
    console.log(`Event ${event.id} already processed, skipping`);
    return NextResponse.json({ received: true, status: 'duplicate' });
  }

  // Record event to ensure idempotency
  const { error: eventInsertError } = await supabaseAdmin
    .from('webhook_events')
    .insert({
      event_id: event.id,
      event_type: event.type,
      processed_at: new Date().toISOString()
    });

  if (eventInsertError) {
    console.error('Error recording webhook event:', eventInsertError);
    // If insert fails due to unique constraint, another request already processed it
    if (eventInsertError.code === '23505') {
      console.log(`Event ${event.id} already processed by another request`);
      return NextResponse.json({ received: true, status: 'duplicate' });
    }
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      let userId = session.metadata?.userId;
      const isFoundingMember = session.metadata?.isFoundingMember === 'true';
      const customerId = session.customer;

      // Guard: If userId missing, attempt to map via customer_email
      if (!userId && session.customer_email) {
        console.log(`Missing userId in metadata, attempting lookup via email: ${session.customer_email}`);
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('email', session.customer_email.toLowerCase())
          .single();
        
        if (profile) {
          userId = profile.id;
          console.log(`Mapped email ${session.customer_email} to userId: ${userId}`);
        } else {
          console.error(`Could not find user with email: ${session.customer_email}`);
        }
      }

      if (userId) {
        // Expand customer if needed to get the customer ID
        let stripeCustomerId = customerId;
        if (typeof customerId === 'string' && customerId.startsWith('cus_')) {
          stripeCustomerId = customerId;
        }

        // Update profile: persist stripe_customer_id and set status to active
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({ 
            status: 'active',
            subscription_status: 'active',
            is_founding_member: isFoundingMember,
            stripe_customer_id: stripeCustomerId
          })
          .eq('id', userId);

        if (profileError) {
          console.error('Error updating profile:', profileError);
        } else {
          console.log(`User ${userId} activated with Stripe customer ${stripeCustomerId}`);
        }

        // Update application status
        const { error: appError } = await supabaseAdmin
          .from('applications')
          .update({ status: 'approved' })
          .eq('user_id', userId);

        if (appError) {
          console.error('Error updating application:', appError);
        }
      } else {
        console.error('checkout.session.completed: No userId found in metadata or by email lookup');
      }
      break;

    case 'customer.subscription.deleted':
      const deletedSub = event.data.object;
      const deletedUserId = deletedSub.metadata?.userId;

      if (deletedUserId) {
        await supabaseAdmin
          .from('profiles')
          .update({ 
            status: 'inactive',
            subscription_status: 'cancelled'
          })
          .eq('id', deletedUserId);

        console.log(`User ${deletedUserId} deactivated after cancellation`);
      }
      break;

    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      const failedUserId = failedInvoice.subscription_metadata?.userId;

      if (failedUserId) {
        await supabaseAdmin
          .from('profiles')
          .update({ subscription_status: 'past_due' })
          .eq('id', failedUserId);

        console.log(`User ${failedUserId} marked as past_due`);
      }
      break;
  }

  return NextResponse.json({ received: true });
}
