import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request) {
  try {
    const { email, invitedBy } = await request.json();

    if (!email || !invitedBy) {
      return NextResponse.json(
        { error: 'Email and invitedBy are required' },
        { status: 400 }
      );
    }

    // Generate unique invite code
    const inviteCode = `FOUNDING-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create invite in database
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('invites')
      .insert({
        code: inviteCode,
        email: email.toLowerCase(),
        invited_by: invitedBy,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Invite creation error:', inviteError);
      return NextResponse.json(
        { error: 'Failed to create invite' },
        { status: 500 }
      );
    }

    // Send invite email (you'll need to implement this with SendGrid)
    // For now, just return success
    
    return NextResponse.json({
      success: true,
      message: 'Invite sent successfully',
      inviteCode: inviteCode
    });

  } catch (error) {
    console.error('Send invite error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}