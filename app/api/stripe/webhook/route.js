// app/api/stripe/webhook/route.js
import { NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/stripe';

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const { event, error } = constructWebhookEvent(body, signature);

    if (error) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Checkout completed:', session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('Subscription updated:', subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('Subscription cancelled:', subscription);
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}