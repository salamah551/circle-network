import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';



export async function POST(request) {
  // Initialize at runtime
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  try {
    const { email, invitedBy, firstName, lastName } = await request.json();

    if (!email || !invitedBy) {
      return NextResponse.json(
        { error: 'Email and invitedBy are required' },
        { status: 400 }
      );
    }

    // Get inviter's profile
    const { data: inviterProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', invitedBy)
      .single();

    // Generate unique invite code
    const inviteCode = `FOUNDING-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // ✅ FIXED: Use correct column names
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('invites')
      .insert({
        invite_code: inviteCode,  // Was: code
        email: email.toLowerCase(),
        first_name: firstName || 'Member',  // Added
        last_name: lastName || '',  // Added
        created_by: invitedBy,  // Was: invited_by
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Invite creation error:', inviteError);
      return NextResponse.json(
        { error: 'Failed to create invite', details: inviteError.message },
        { status: 500 }
      );
    }

    // Create a personal campaign for this invite (or reuse existing)
    let { data: personalCampaign } = await supabaseAdmin
      .from('bulk_invite_campaigns')
      .select('id')
      .eq('name', `Personal-${invitedBy}`)
      .eq('created_by', invitedBy)
      .single();

    if (!personalCampaign) {
      const { data: newCampaign, error: campaignError } = await supabaseAdmin
        .from('bulk_invite_campaigns')
        .insert({
          name: `Personal-${invitedBy}`,
          created_by: invitedBy,
          persona: 'wildcard',
          daily_limit: 100,
          status: 'active'
        })
        .select()
        .single();

      if (campaignError) {
        console.error('Campaign creation error:', campaignError);
        return NextResponse.json(
          { error: 'Failed to create campaign', details: campaignError.message },
          { status: 500 }
        );
      }
      personalCampaign = newCampaign;
    }

    // Add recipient to bulk invite system with 4-email drip sequence
    const { error: recipientError } = await supabaseAdmin
      .from('bulk_invite_recipients')
      .insert({
        campaign_id: personalCampaign.id,
        email: email.toLowerCase(),
        first_name: firstName || 'Member',
        last_name: lastName || '',
        name: `${firstName || 'Member'} ${lastName || ''}`.trim(),
        invite_code: inviteCode,
        persona_type: 'wildcard',
        status: 'pending',
        sequence_stage: 0,
        next_email_scheduled: new Date().toISOString() // Send first email immediately
      });

    if (recipientError) {
      console.error('Recipient creation error:', recipientError);
      return NextResponse.json(
        { error: 'Failed to add recipient to drip sequence', details: recipientError.message },
        { status: 500 }
      );
    }

    // Trigger immediate send of first email via bulk system
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/bulk-invites/track/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId: personalCampaign.id })
    });

    return NextResponse.json({
      success: true,
      message: 'Invite sent successfully',
      inviteCode: inviteCode
    });

  } catch (error) {
    console.error('Send invite error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
