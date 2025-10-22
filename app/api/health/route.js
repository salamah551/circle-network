import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 * Returns basic health status and environment check
 * Public endpoint (no authentication required)
 */
export async function GET() {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasSendGridKey: !!process.env.SENDGRID_API_KEY,
        hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
        hasCronSecret: !!process.env.CRON_SECRET,
        hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
        hasPostHogKey: !!process.env.NEXT_PUBLIC_POSTHOG_KEY
      },
      features: {
        introPlaintextEnabled: process.env.CAMPAIGN_ENABLE_INTRO_PLAINTEXT === 'true'
      }
    };

    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
