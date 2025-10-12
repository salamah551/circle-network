import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Initialize at runtime
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const cookieStore = cookies();
    const supabaseClient = createClient(
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

    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const subscriptions = await stripe.subscriptions.list({
      limit: 100,
      expand: ['data.customer', 'data.latest_invoice.charge']
    });

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, stripe_customer_id');

    const enrichedSubscriptions = await Promise.all(
      subscriptions.data.map(async (sub) => {
        const customer = typeof sub.customer === 'string' 
          ? await stripe.customers.retrieve(sub.customer)
          : sub.customer;
        
        const member = profiles?.find(p => p.stripe_customer_id === customer.id);
        
        return {
          id: sub.id,
          member: member ? {
            id: member.id,
            name: member.full_name,
            email: member.email
          } : {
            email: customer.email,
            name: customer.name
          },
          status: sub.status,
          amount: sub.items.data[0]?.price?.unit_amount / 100,
          currency: sub.items.data[0]?.price?.currency?.toUpperCase(),
          interval: sub.items.data[0]?.price?.recurring?.interval,
          current_period_end: sub.current_period_end,
          cancel_at_period_end: sub.cancel_at_period_end,
          latest_charge_id: sub.latest_invoice?.charge?.id
        };
      })
    );

    return NextResponse.json({ subscriptions: enrichedSubscriptions });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}
