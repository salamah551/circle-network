// app/api/applications/submit/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      fullName,
      title,
      company,
      bio,
      expertise,
      needs,
      linkedin,
      twitter,
      website,
      email,
      inviteCode,
      userId
    } = body;

    console.log('Received application:', { email, inviteCode, userId });

    // Validate required fields
    if (!fullName || !title || !company || !bio || !email || !inviteCode || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Normalize invite code
    let normalizedCode = inviteCode.toUpperCase().trim();
    if (!normalizedCode.startsWith('FOUNDING-')) {
      normalizedCode = `FOUNDING-${normalizedCode}`;
    }

    // Verify invite code is still valid and matches email
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('invites')
      .select('*')
      .eq('invite_code', normalizedCode)
      .eq('email', email.toLowerCase())
      .eq('status', 'pending')
      .single();

    if (inviteError || !invite) {
      console.error('Invite validation failed:', inviteError);
      return NextResponse.json(
        { error: 'Invalid or expired invite code' },
        { status: 400 }
      );
    }

    // Check if invite has expired
    if (new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Invite code has expired' },
        { status: 400 }
      );
    }

    // Split full name into first and last name
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Check if application already exists for this user
    const { data: existingApp } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingApp) {
      // Update existing application
      const { error: updateError } = await supabaseAdmin
        .from('applications')
        .update({
          full_name: fullName,
          title,
          company,
          bio,
          expertise,
          needs,
          linkedin,
          twitter,
          website,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Update application error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update application' },
          { status: 500 }
        );
      }
    } else {
      // Create new application
      const { error: insertError } = await supabaseAdmin
        .from('applications')
        .insert({
          user_id: userId,
          email: email.toLowerCase(),
          full_name: fullName,
          title,
          company,
          bio,
          expertise,
          needs,
          linkedin,
          twitter,
          website,
          status: 'pending',
          submitted_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Insert application error:', insertError);
        return NextResponse.json(
          { error: 'Failed to submit application' },
          { status: 500 }
        );
      }
    }

    // Create or update profile
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingProfile) {
      // Update existing profile
      await supabaseAdmin
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          email: email.toLowerCase(),
          title,
          company,
          bio,
          linkedin,
          twitter,
          website,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    } else {
      // Create new profile
      await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: userId,
          email: email.toLowerCase(),
          first_name: firstName,
          last_name: lastName,
          title,
          company,
          bio,
          linkedin,
          twitter,
          website,
          is_founding_member: true,
          invites_remaining: 5
        });
    }

    console.log('Application submitted successfully');

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully'
    });

  } catch (error) {
    console.error('Submit application error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
