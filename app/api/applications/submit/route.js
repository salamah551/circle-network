// app/api/applications/submit/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use service role client for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request) {
  try {
    const data = await request.json();
    const {
      fullName,
      title,
      company,
      location,
      linkedinUrl,
      bio,
      expertise,
      needs,
      challenges,
      email,
      inviteCode,
    } = data;

    // Validate required fields
    if (!fullName || !title || !company || !bio || !email || !inviteCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!expertise || expertise.length === 0) {
      return NextResponse.json(
        { error: 'Please select at least one area of expertise' },
        { status: 400 }
      );
    }

    if (!needs || needs.length === 0) {
      return NextResponse.json(
        { error: 'Please select at least one thing you need help with' },
        { status: 400 }
      );
    }

    // Verify invite code is still valid
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('invites')
      .select('*')
      .eq('code', inviteCode.toUpperCase())
      .eq('email', email.toLowerCase())
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: 'Invalid or expired invite code' },
        { status: 400 }
      );
    }

    // Get the authorization header to verify user
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Not authenticated. Please use the magic link from your email.' },
        { status: 401 }
      );
    }

    // Create client with user's token
    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    // Verify the token and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated. Please use the magic link from your email.' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Check if application already exists
    const { data: existingApp } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingApp) {
      return NextResponse.json(
        { error: 'Application already submitted' },
        { status: 400 }
      );
    }

    // Create application
    const { data: application, error: appError } = await supabaseAdmin
      .from('applications')
      .insert({
        user_id: userId,
        email: email.toLowerCase(),
        full_name: fullName,
        title,
        company,
        location,
        linkedin_url: linkedinUrl,
        bio,
        expertise,
        needs,
        challenges,
        status: 'approved',
      })
      .select()
      .single();

    if (appError) {
      console.error('Application error:', appError);
      return NextResponse.json(
        { error: 'Failed to submit application' },
        { status: 500 }
      );
    }

    // Create profile from application
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email: email.toLowerCase(),
        full_name: fullName,
        title,
        company,
        location,
        bio,
        linkedin_url: linkedinUrl,
        expertise,
        needs,
        status: 'pending',
      });

    if (profileError) {
      console.error('Profile error:', profileError);
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: application.id,
    });

  } catch (error) {
    console.error('Submit application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
