import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request) {
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

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const userId = session.metadata.userId;
      const isFoundingMember = session.metadata.isFoundingMember === 'true';

      if (userId) {
        // Update profile status to active
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({ 
            status: 'active',
            subscription_status: 'active',
            is_founding_member: isFoundingMember
          })
          .eq('id', userId);

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }

        // Update application status
        const { error: appError } = await supabaseAdmin
          .from('applications')
          .update({ status: 'approved' })
          .eq('user_id', userId);

        if (appError) {
          console.error('Error updating application:', appError);
        }

        console.log(`User ${userId} activated after payment`);
      }
      break;

    case 'customer.subscription.deleted':
      const deletedSub = event.data.object;
      const deletedUserId = deletedSub.metadata.userId;

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
