// app/api/applications/submit/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Received application body:', JSON.stringify(body, null, 2));
    
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

    console.log('Parsed fields:', { email, inviteCode, userId, fullName, title, company });

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
    console.log('Verifying invite code...');
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('invites')
      .select('*')
      .eq('invite_code', normalizedCode)
      .eq('email', email.toLowerCase())
      .eq('status', 'pending')
      .single();

    if (inviteError) {
      console.error('Invite query error:', inviteError);
      return NextResponse.json(
        { error: 'Failed to verify invite', details: inviteError.message },
        { status: 500 }
      );
    }

    if (!invite) {
      console.error('No matching invite found');
      return NextResponse.json(
        { error: 'Invalid or expired invite code' },
        { status: 400 }
      );
    }

    console.log('Invite verified:', invite.id);

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
    console.log('Checking for existing application...');
    const { data: existingApp, error: existingAppError } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingAppError && existingAppError.code !== 'PGRST116') {
      // PGRST116 is "not found" which is OK
      console.error('Error checking existing application:', existingAppError);
    }

    if (existingApp) {
      console.log('Updating existing application:', existingApp.id);
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
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Update application error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update application', details: updateError.message },
          { status: 500 }
        );
      }
      console.log('Application updated successfully');
    } else {
      console.log('Creating new application');
      // Create new application (NO social links here - they go in profiles)
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
          status: 'pending',
          submitted_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Insert application error:', insertError);
        return NextResponse.json(
          { error: 'Failed to submit application', details: insertError.message },
          { status: 500 }
        );
      }
      console.log('Application created successfully');
    }

    // Create or update profile
    console.log('Checking for existing profile...');
    const { data: existingProfile, error: existingProfileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingProfileError && existingProfileError.code !== 'PGRST116') {
      console.error('Error checking existing profile:', existingProfileError);
    }

    if (existingProfile) {
      console.log('Updating existing profile:', existingProfile.id);
      // Update existing profile
      const { error: profileUpdateError } = await supabaseAdmin
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          email: email.toLowerCase(),
          title,
          company,
          bio,
          linkedin: linkedin || null,
          twitter: twitter || null,
          website: website || null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (profileUpdateError) {
        console.error('Profile update error:', profileUpdateError);
        // Don't fail the whole request, just log it
      } else {
        console.log('Profile updated successfully');
      }
    } else {
      console.log('Creating new profile');
      // Create new profile
      const { error: profileInsertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: userId,
          email: email.toLowerCase(),
          first_name: firstName,
          last_name: lastName,
          title,
          company,
          bio,
          linkedin: linkedin || null,
          twitter: twitter || null,
          website: website || null,
          is_founding_member: true,
          invites_remaining: 5
        });

      if (profileInsertError) {
        console.error('Profile insert error:', profileInsertError);
        // Don't fail the whole request, just log it
      } else {
        console.log('Profile created successfully');
      }
    }

    console.log('Application submitted successfully');

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully'
    });

  } catch (error) {
    console.error('Submit application error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
