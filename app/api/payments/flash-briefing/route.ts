/**
 * POST /api/payments/flash-briefing
 * Creates a one-time Stripe Checkout Session for the Flash Briefing product
 */

import { NextResponse } from 'next/server';
import { 
  createOneTimeSession,
  validatePaymentEnv,
  normalizeStripeError
} from '@/lib/payments';

export async function POST(request: Request) {
  try {
    // Validate environment
    const envCheck = validatePaymentEnv();
    if (!envCheck.valid) {
      console.error('Payment environment validation failed:', envCheck.error);
      return NextResponse.json(
        { error: 'Payment system not configured. Please contact support.' },
        { status: 500 }
      );
    }
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    
    // Create Stripe Checkout Session for $297 Flash Briefing
    const session = await createOneTimeSession({
      productName: '48-Hour Flash Briefing',
      productDescription: 'Get your first competitor intelligence report delivered within 48 hours. One-time payment.',
      amount: 29700, // $297.00 in cents
      successUrl: `${appUrl}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appUrl}/`,
      metadata: {
        product: 'flash_briefing',
      },
    });
    
    return NextResponse.json({ 
      sessionId: session.id, 
      url: session.url 
    });
    
  } catch (error: any) {
    console.error('Flash briefing checkout error:', error);
    
    const userFriendlyError = normalizeStripeError(error);
    
    return NextResponse.json(
      { error: userFriendlyError },
      { status: 500 }
    );
  }
}
