// app/api/auth/validate-invite/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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

    // ✅ FIX: Query using invite_code column name
    const { data: invite, error } = await supabaseAdmin
      .from('invites')
      .select('*')
      .eq('invite_code', inviteCode.toUpperCase())
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
