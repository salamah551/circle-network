// app/api/invites/claim/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/invites/claim
 * Claims an invite code when a new member signs in for the first time
 * This reduces the referrer's allowance only when the invite is actually used
 */
export async function POST(request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const { inviteCode } = await request.json();

    if (!inviteCode) {
      return NextResponse.json(
        { error: 'Invite code is required' },
        { status: 400 }
      );
    }

    // Find the invite by code
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select('*')
      .eq('code', inviteCode)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 404 }
      );
    }

    // Check if invite is already claimed
    if (invite.status === 'claimed') {
      return NextResponse.json(
        { error: 'Invite code has already been claimed' },
        { status: 400 }
      );
    }

    // Check if invite has expired
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Invite code has expired' },
        { status: 400 }
      );
    }

    // Mark invite as claimed
    const { error: updateError } = await supabase
      .from('invites')
      .update({
        status: 'claimed',
        claimed_by: user.id,
        claimed_at: new Date().toISOString()
      })
      .eq('id', invite.id);

    if (updateError) {
      console.error('Error claiming invite:', updateError);
      return NextResponse.json(
        { error: 'Failed to claim invite' },
        { status: 500 }
      );
    }

    // Update the profile to mark as referred
    await supabase
      .from('profiles')
      .update({
        referred_by: invite.created_by,
        invite_code_used: inviteCode
      })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      message: 'Invite claimed successfully',
      referrer: invite.created_by
    });

  } catch (error) {
    console.error('Claim invite error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}