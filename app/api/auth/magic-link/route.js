// app/api/auth/magic-link/route.js
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getSupabaseServerClient } from '@/lib/supabase';
import { getAuthRedirectOrigin, formatAuthError } from '@/lib/auth-redirect';

export async function POST(request) {
  let supabaseAdmin;
  let supabaseServer;
  
  try {
    supabaseAdmin = getSupabaseAdmin();
    supabaseServer = getSupabaseServerClient();
  } catch (error) {
    console.error('Failed to initialize Supabase clients:', error.message);
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
    const redirectOrigin = getAuthRedirectOrigin(request);
    
    // Build redirect URL - Supabase will handle auth automatically via hash params
    const redirectUrl = `${redirectOrigin}/apply?code=${normalizedCode}&email=${encodeURIComponent(email)}`;
    
    console.log('Redirect URL:', redirectUrl);

    // Send magic link with redirect using server client (with anon key)
    // Note: Use server client for OTP operations as it properly handles email sending
    const { data, error } = await supabaseServer.auth.signInWithOtp({
      email: email.toLowerCase(),
      options: {
        emailRedirectTo: redirectUrl,
        shouldCreateUser: true
      }
    });

    if (error) {
      console.error('Supabase Auth error:', error);
      
      // Return descriptive error from Supabase
      const { message: errorMessage, statusCode } = formatAuthError(error, redirectOrigin);
      
      return NextResponse.json(
        { error: errorMessage },
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
