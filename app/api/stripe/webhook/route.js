import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { sendFoundingMemberWelcomeEmail } from '@/lib/sendgrid';

// PostHog server-side tracking helper
async function trackServerEvent(eventName, properties = {}) {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';
  
  if (!posthogKey) return;
  
  try {
    await fetch(`${posthogHost}/capture/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: posthogKey,
        event: eventName,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
        },
        distinct_id: properties.user_id || properties.distinct_id || 'server',
      }),
    });
  } catch (error) {
    console.error('PostHog tracking error:', error);
  }
}

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

  // IDEMPOTENCY: Check if event already processed using stripe_events table
  const { data: existingEvent } = await supabaseAdmin
    .from('stripe_events')
    .select('event_id')
    .eq('event_id', event.id)
    .single();

  if (existingEvent) {
    console.log(`Event ${event.id} already processed, skipping`);
    return NextResponse.json({ received: true, status: 'duplicate' });
  }

  // Record event to ensure idempotency
  const { error: eventInsertError } = await supabaseAdmin
    .from('stripe_events')
    .insert({
      event_id: event.id,
      received_at: new Date().toISOString()
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

        // Retrieve subscription details for richer profile data
        let subscription = null;
        const subscriptionId = session.subscription;
        if (subscriptionId) {
          try {
            subscription = await stripe.subscriptions.retrieve(subscriptionId);
          } catch (subErr) {
            console.error('Error retrieving subscription:', subErr);
          }
        }

        const membershipTier = session.metadata?.membershipTier || (isFoundingMember ? 'founding' : 'professional');
        const userEmail = session.customer_email || session.customer_details?.email;

        // Upsert profile: create a minimal profile if one doesn't exist yet,
        // or update an existing one. This handles the magic-link / subscribe
        // flow where a profile row may not have been created before payment.
        const profileUpsertData = {
          id: userId,
          email: userEmail,
          status: 'active',
          subscription_status: 'active',
          is_founding_member: isFoundingMember,
          stripe_customer_id: stripeCustomerId,
          membership_tier: membershipTier,
        };

        if (subscription) {
          profileUpsertData.stripe_subscription_id = subscription.id;
          profileUpsertData.stripe_price_id = subscription.items.data[0]?.price?.id;
          if (subscription.current_period_end) {
            profileUpsertData.current_period_end = new Date(subscription.current_period_end * 1000).toISOString();
          }
        }

        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .upsert(profileUpsertData, { onConflict: 'id' });

        if (profileError) {
          console.error('Error updating profile:', profileError);
        } else {
          console.log(`User ${userId} activated with Stripe customer ${stripeCustomerId}`);
          
          // Track successful payment conversion with PostHog
          await trackServerEvent('payment_successful', {
            user_id: userId,
            customer_email: session.customer_email,
            stripe_customer_id: stripeCustomerId,
            is_founding_member: isFoundingMember,
            membership_tier: session.metadata?.membershipTier || 'founding',
            amount: session.amount_total,
            currency: session.currency,
          });
          
          // Send welcome email
          try {
            // Get user profile for name
            const { data: userProfile } = await supabaseAdmin
              .from('profiles')
              .select('full_name')
              .eq('id', userId)
              .single();
            
            await sendFoundingMemberWelcomeEmail({
              to: session.customer_email,
              name: userProfile?.full_name || 'there',
              isFoundingMember: isFoundingMember
            });
            console.log(`Welcome email sent to ${session.customer_email}`);
          } catch (emailError) {
            console.error('Error sending welcome email:', emailError);
            // Don't fail the webhook if email fails
          }
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
        
        // Track cancellation event
        await trackServerEvent('subscription_cancelled', {
          user_id: deletedUserId,
          subscription_id: deletedSub.id,
          cancelled_at: new Date().toISOString()
        });
      }
      break;

    case 'customer.subscription.updated':
      const updatedSub = event.data.object;
      const updatedUserId = updatedSub.metadata?.userId;
      
      if (updatedUserId) {
        // Determine subscription status based on Stripe subscription status
        let subscriptionStatus = 'active';
        let userStatus = 'active';
        
        switch (updatedSub.status) {
          case 'active':
            subscriptionStatus = 'active';
            userStatus = 'active';
            break;
          case 'past_due':
            subscriptionStatus = 'past_due';
            userStatus = 'active'; // Keep active but warn
            break;
          case 'canceled':
          case 'cancelled':
            subscriptionStatus = 'cancelled';
            userStatus = 'inactive';
            break;
          case 'unpaid':
            subscriptionStatus = 'unpaid';
            userStatus = 'inactive';
            break;
          case 'incomplete':
          case 'incomplete_expired':
            subscriptionStatus = 'incomplete';
            userStatus = 'inactive';
            break;
          case 'trialing':
            subscriptionStatus = 'trialing';
            userStatus = 'active';
            break;
          default:
            subscriptionStatus = updatedSub.status;
        }
        
        await supabaseAdmin
          .from('profiles')
          .update({ 
            status: userStatus,
            subscription_status: subscriptionStatus
          })
          .eq('id', updatedUserId);

        console.log(`User ${updatedUserId} subscription updated: ${subscriptionStatus}`);
        
        // Track subscription update event
        await trackServerEvent('subscription_updated', {
          user_id: updatedUserId,
          subscription_id: updatedSub.id,
          old_status: event.data.previous_attributes?.status,
          new_status: updatedSub.status,
          updated_at: new Date().toISOString()
        });
      }
      break;

    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      const inviteId = invoice.metadata?.invite_id;
      const inviteCampaignId = invoice.metadata?.campaign_id;
      const customerEmail = invoice.customer_email?.toLowerCase();

      console.log(`invoice.payment_succeeded: invite_id=${inviteId}, campaign_id=${inviteCampaignId}, email=${customerEmail}`);

      // Try to find the bulk invite by metadata first, then fall back to email
      let bulkInvite = null;
      
      if (inviteId) {
        const { data } = await supabaseAdmin
          .from('bulk_invites')
          .select('*')
          .eq('id', inviteId)
          .single();
        bulkInvite = data;
        console.log(`Found invite by ID: ${inviteId}`);
      } else if (customerEmail && inviteCampaignId) {
        const { data } = await supabaseAdmin
          .from('bulk_invites')
          .select('*')
          .eq('campaign_id', inviteCampaignId)
          .eq('email', customerEmail)
          .single();
        bulkInvite = data;
        console.log(`Found invite by campaign_id + email: ${inviteCampaignId}, ${customerEmail}`);
      } else if (customerEmail) {
        // Fall back to email-only lookup across all campaigns
        const { data } = await supabaseAdmin
          .from('bulk_invites')
          .select('*')
          .eq('email', customerEmail)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        bulkInvite = data;
        console.log(`Found invite by email only: ${customerEmail}`);
      }

      if (bulkInvite) {
        // Check if conversion already recorded (idempotent)
        const { data: existingConversion } = await supabaseAdmin
          .from('bulk_invite_events')
          .select('id')
          .eq('invite_id', bulkInvite.id)
          .eq('event', 'converted')
          .single();

        if (!existingConversion) {
          // Record conversion event (idempotent via unique constraint)
          const { error: eventError } = await supabaseAdmin
            .from('bulk_invite_events')
            .insert({
              invite_id: bulkInvite.id,
              event: 'converted',
              details: {
                email: bulkInvite.email,
                stripe_invoice_id: invoice.id,
                amount: invoice.amount_paid,
                currency: invoice.currency,
                timestamp: new Date().toISOString()
              }
            });

          // Only log error if it's not a duplicate (23505 is unique constraint violation)
          if (eventError && eventError.code !== '23505') {
            console.error('Error recording conversion event:', eventError);
          } else if (!eventError) {
            console.log(`✅ Recorded conversion for invite ${bulkInvite.id}`);

            // Update invite status
            await supabaseAdmin
              .from('bulk_invites')
              .update({
                status: 'converted',
                converted_at: new Date().toISOString()
              })
              .eq('id', bulkInvite.id);

            // Increment campaign conversion count (only once due to event uniqueness)
            await supabaseAdmin
              .from('bulk_invite_campaigns')
              .update({
                total_converted: supabaseAdmin.raw('total_converted + 1')
              })
              .eq('id', bulkInvite.campaign_id);

            console.log(`✅ Conversion tracked for campaign ${bulkInvite.campaign_id}`);
          }
        } else {
          console.log(`Conversion already recorded for invite ${bulkInvite.id}`);
        }
      } else {
        console.log(`No bulk invite found for email: ${customerEmail}`);
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
