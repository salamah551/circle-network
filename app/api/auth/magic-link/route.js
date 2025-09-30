// app/api/auth/magic-link/route.js
import { NextResponse } from 'next/server';
import { auth } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { email, inviteCode } = await request.json();

    if (!email || !inviteCode) {
      return NextResponse.json(
        { error: 'Email and invite code are required' },
        { status: 400 }
      );
    }

    // Send magic link with invite code in URL
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/apply?code=${inviteCode}&email=${encodeURIComponent(email)}`;
    
    const { data, error } = await auth.sendMagicLink(email.toLowerCase(), redirectUrl);

    if (error) {
      console.error('Magic link error:', error);
      return NextResponse.json(
        { error: 'Failed to send magic link' },
        { status: 500 }
      );
    }

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