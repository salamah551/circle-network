export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { priceId, lookupKey } = await req.json();
    if (!priceId && !lookupKey) {
      return NextResponse.json({ error: 'priceId or lookupKey required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const userId = (req.headers.get('x-user-id') || '').trim();
    if (!userId) return NextResponse.json({ error: 'Missing user context' }, { status: 401 });

    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .select('id, stripe_customer_id, status, full_name')
      .eq('id', userId)
      .single();

    if (pErr || !profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    if (profile.status !== 'active') {
      return NextResponse.json({ error: 'Only approved members can subscribe' }, { status: 403 });
    }

    let customerId = profile.stripe_customer_id || null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { user_id: profile.id },
        name: profile.full_name || undefined,
      });
      customerId = customer.id;
      await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', profile.id);
    }

    let price;
    if (lookupKey) {
      const prices = await stripe.prices.list({ lookup_keys: [lookupKey], expand: ['data.product'] });
      if (!prices.data.length) {
        return NextResponse.json({ error: 'Invalid lookupKey' }, { status: 400 });
      }
      price = prices.data[0].id;
    } else {
      price = priceId;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thecirclenetwork.org';
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: profile.id, // Add client_reference_id for webhook handler
      line_items: [{ price, quantity: 1 }],
      allow_promotion_codes: false,
      success_url: `${appUrl}/billing?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/billing?status=cancelled`,
      metadata: { user_id: profile.id },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
