// app/api/auth/magic-link/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';



export async function POST(request) {
  // Initialize at runtime
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
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

    // Build redirect URL - Supabase will handle auth automatically via hash params
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/apply?code=${normalizedCode}&email=${encodeURIComponent(email)}`;
    
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
      return NextResponse.json(
        { error: `Failed to send magic link: ${error.message}` },
        { status: 500 }
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
