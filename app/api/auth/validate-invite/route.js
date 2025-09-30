// app/api/auth/validate-invite/route.js
import { NextResponse } from 'next/server';
import { invites } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { email, inviteCode } = await request.json();

    if (!email || !inviteCode) {
      return NextResponse.json(
        { error: 'Email and invite code are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate invite code
    const { data: invite, error } = await invites.validate(
      inviteCode.toUpperCase(),
      email.toLowerCase()
    );

    if (error || !invite) {
      return NextResponse.json(
        { error: 'Invalid or expired invite code for this email' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Invite code is valid',
    });

  } catch (error) {
    console.error('Validate invite error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}