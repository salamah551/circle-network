// app/api/applications/submit/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('📥 Received application:', JSON.stringify(body, null, 2));
    
  // Initialize at runtime
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

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

    console.log('✅ Parsed fields:', { email, inviteCode, userId, fullName, title, company });

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
    console.log('🔍 Verifying invite code...');
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('invites')
      .select('*')
      .eq('invite_code', normalizedCode)
      .eq('email', email.toLowerCase())
      .eq('status', 'pending')
      .single();

    if (inviteError) {
      console.error('❌ Invite verification error:', inviteError);
      return NextResponse.json(
        { error: 'Invalid or expired invite code', details: inviteError.message },
        { status: 400 }
      );
    }

    if (!invite) {
      console.error('❌ No matching invite found');
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

    console.log('✅ Invite verified:', invite.id);

    // Split full name into first and last name
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // CRITICAL: Create or update profile FIRST (using id, not user_id)
    console.log('🔍 Checking for existing profile...');
    const { data: existingProfile, error: existingProfileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (existingProfileError && existingProfileError.code !== 'PGRST116') {
      console.error('❌ Error checking existing profile:', existingProfileError);
    }

    if (existingProfile) {
      console.log('📝 Updating existing profile:', existingProfile.id);
      // Update existing profile
      const { error: profileUpdateError } = await supabaseAdmin
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          email: email.toLowerCase(),
          title,
          company,
          bio,
          expertise,
          needs,
          linkedin: linkedin || null,
          twitter: twitter || null,
          website: website || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (profileUpdateError) {
        console.error('❌ Profile update error:', profileUpdateError);
        return NextResponse.json(
          { error: 'Failed to update profile', details: profileUpdateError.message },
          { status: 500 }
        );
      }
      console.log('✅ Profile updated successfully');
    } else {
      console.log('➕ Creating new profile for user:', userId);
      // Create new profile (use id as primary key, not user_id)
      const { error: profileInsertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,  // CRITICAL: Use id, not user_id
          email: email.toLowerCase(),
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          title,
          company,
          bio,
          expertise,
          needs,
          linkedin: linkedin || null,
          twitter: twitter || null,
          website: website || null,
          is_founding_member: true,
          invites_remaining: 5,
          status: 'active'
        });

      if (profileInsertError) {
        console.error('❌ Profile insert error:', profileInsertError);
        return NextResponse.json(
          { error: 'Failed to create profile', details: profileInsertError.message },
          { status: 500 }
        );
      }
      console.log('✅ Profile created successfully');
    }

    // Now create/update application
    console.log('🔍 Checking for existing application...');
    const { data: existingApp, error: existingAppError } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingAppError && existingAppError.code !== 'PGRST116') {
      console.error('❌ Error checking existing application:', existingAppError);
    }

    if (existingApp) {
      console.log('📝 Updating existing application:', existingApp.id);
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
        console.error('❌ Update application error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update application', details: updateError.message },
          { status: 500 }
        );
      }
      console.log('✅ Application updated successfully');
    } else {
      console.log('➕ Creating new application');
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
          status: 'pending'
        });

      if (insertError) {
        console.error('❌ Insert application error:', insertError);
        return NextResponse.json(
          { error: 'Failed to submit application', details: insertError.message },
          { status: 500 }
        );
      }
      console.log('✅ Application created successfully');
    }

    console.log('🎉 Application submitted successfully');

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully'
    });

  } catch (error) {
    console.error('❌ Submit application error:', error);
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
