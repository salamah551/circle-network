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

    const emailLower = email.toLowerCase().trim();
    
    let normalizedCode = inviteCode.toUpperCase().trim();
    if (!normalizedCode.startsWith('FOUNDING-')) {
      normalizedCode = `FOUNDING-${normalizedCode}`;
    }

    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('invites')
      .select('*')
      .eq('invite_code', normalizedCode)
      .eq('email', emailLower)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: 'Invalid or expired invite code' },
        { status: 400 }
      );
    }

    const { error: magicLinkError } = await supabaseAdmin.auth.signInWithOtp({
      email: emailLower,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe?email=${encodeURIComponent(emailLower)}&code=${encodeURIComponent(normalizedCode)}&validated=true`,
        shouldCreateUser: true
      }
    });

    if (magicLinkError) {
      console.error('Magic link error:', magicLinkError);
      return NextResponse.json(
        { error: 'Failed to send magic link' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Magic link sent. Redirecting you to payment...',
      redirectUrl: `/subscribe?email=${encodeURIComponent(emailLower)}&code=${encodeURIComponent(normalizedCode)}&pending=true`
    });

  } catch (error) {
    console.error('Quick signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
