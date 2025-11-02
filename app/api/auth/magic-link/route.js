// app/api/auth/magic-link/route.js
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request) {
  let supabaseAdmin;
  
  try {
    supabaseAdmin = getSupabaseAdmin();
  } catch (error) {
    console.error('Failed to initialize Supabase admin client:', error.message);
    return NextResponse.json(
      { error: 'Server configuration error. Please contact support.' },
      { status: 500 }
    );
  }
  try {
    const { email, inviteCode } = await request.json();

    if (!email || !inviteCode) {
      return NextResponse.json(
        { error: 'Email and invite code are required' },
        { status: 400 }
      );
    }

    // Normalize invite code
    let normalizedCode = inviteCode.toUpperCase().trim();
    if (!normalizedCode.startsWith('FOUNDING-')) {
      normalizedCode = `FOUNDING-${normalizedCode}`;
    }

    console.log('Sending magic link:', {
      email: email.toLowerCase(),
      code: normalizedCode
    });

    // Compute redirect URL with fallback to request origin
    const headers = request.headers;
    let redirectOrigin = process.env.NEXT_PUBLIC_APP_URL;
    
    // If NEXT_PUBLIC_APP_URL is not set or doesn't match deployment, use request origin
    if (!redirectOrigin) {
      const proto = headers.get('x-forwarded-proto') || 'http';
      const host = headers.get('host') || 'localhost:5000';
      redirectOrigin = `${proto}://${host}`;
    }
    
    // Validate HTTPS in production
    if (process.env.NODE_ENV === 'production' && !redirectOrigin.startsWith('https://')) {
      console.warn('⚠️  Non-HTTPS redirect in production, using request origin');
      const proto = headers.get('x-forwarded-proto') || 'https';
      const host = headers.get('host');
      if (host) {
        redirectOrigin = `${proto}://${host}`;
      }
    }

    // Build redirect URL - Supabase will handle auth automatically via hash params
    const redirectUrl = `${redirectOrigin}/apply?code=${normalizedCode}&email=${encodeURIComponent(email)}`;
    
    console.log('Redirect URL:', redirectUrl);

    // Send magic link with redirect
    const { data, error } = await supabaseAdmin.auth.signInWithOtp({
      email: email.toLowerCase(),
      options: {
        emailRedirectTo: redirectUrl,
        shouldCreateUser: true
      }
    });

    if (error) {
      console.error('Supabase Auth error:', error);
      
      // Return descriptive error from Supabase
      let errorMessage = 'Failed to send magic link';
      let statusCode = 500;
      
      // Handle specific Supabase error cases
      if (error.message?.includes('redirect')) {
        errorMessage = `Email redirect URL not allowed by Supabase Auth. Please add ${redirectOrigin}/** to your Supabase Auth Redirect URLs allowlist.`;
        statusCode = 400;
      } else if (error.message) {
        errorMessage = `Failed to send magic link: ${error.message}`;
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: error.message 
        },
        { status: statusCode }
      );
    }

    console.log('Magic link sent successfully:', data);

    return NextResponse.json({
      success: true,
      message: 'Magic link sent successfully',
    });

  } catch (error) {
    console.error('Magic link API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
