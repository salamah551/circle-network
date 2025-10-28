// app/api/payments/flash-briefing/route.js
// Canonical endpoint for Flash Briefing one-time checkout
import { NextResponse } from 'next/server';
import { createOneTimeSession, normalizeStripeError, validatePaymentConfig } from '@/lib/payments';

export async function POST(request) {
  try {
    // Validate payment configuration
    const configCheck = validatePaymentConfig();
    if (!configCheck.valid) {
      console.error('Payment configuration errors:', configCheck.errors);
      return NextResponse.json(
        { error: 'Payment system not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Create Stripe Checkout Session for $297 Flash Briefing
    const { url, sessionId } = await createOneTimeSession({
      productName: '48-Hour Flash Briefing',
      productDescription: 'Get your first competitor intelligence report delivered within 48 hours. One-time payment.',
      amount: 29700, // $297.00 in cents
      metadata: {
        product: 'flash_briefing',
      },
    });

    return NextResponse.json({ 
      sessionId, 
      url 
    });
  } catch (error) {
    console.error('Flash Briefing checkout error:', error);
    
    const errorMessage = normalizeStripeError(error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
