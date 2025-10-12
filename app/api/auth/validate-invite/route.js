// app/api/auth/validate-invite/route.js
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // ✅ FIX: Normalize invite code - add FOUNDING- prefix if not present
    let normalizedCode = inviteCode.toUpperCase().trim();
    if (!normalizedCode.startsWith('FOUNDING-')) {
      normalizedCode = `FOUNDING-${normalizedCode}`;
    }

    console.log('Validating invite:', {
      email: email.toLowerCase(),
      originalCode: inviteCode,
      normalizedCode: normalizedCode
    });

    // ✅ FIX: Query using normalized invite_code
    const { data: invite, error } = await supabaseAdmin
      .from('invites')
      .select('*')
      .eq('invite_code', normalizedCode)
      .eq('email', email.toLowerCase())
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) {
      console.error('Invite validation error:', error);
      return NextResponse.json(
        { error: 'Failed to validate invite' },
        { status: 500 }
      );
    }

    if (!invite) {
      console.log('No matching invite found');
      return NextResponse.json(
        { error: 'Invalid or expired invite code for this email' },
        { status: 400 }
      );
    }

    console.log('Invite validated successfully:', invite.invite_code);

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
