import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request) {
  try {
    const { email, password, fullName, inviteCode } = await request.json();

    // Validate inputs
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Full name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Guard: ensure Supabase env vars are present before making any API calls
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
      return NextResponse.json(
        { error: 'Authentication service not configured. Please contact support.' },
        { status: 503 }
      );
    }

    // Create Supabase client with cookie support
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Sign up the user with metadata
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/auth/callback`,
      },
    });

    if (error) {
      console.error('Sign up error:', error);
      
      // Handle specific error cases
      if (error.message?.toLowerCase().includes('already registered') || 
          error.message?.toLowerCase().includes('already exists')) {
        return NextResponse.json(
          { error: 'This email is already registered. Please sign in instead.' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: error.message || 'Failed to create account' },
        { status: 400 }
      );
    }

    const userId = data.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      );
    }

    // Create profile row using admin client (bypasses RLS)
    try {
      const adminClient = getSupabaseAdmin();

      const { error: profileError } = await adminClient
        .from('profiles')
        .insert({
          id: userId,
          email: email.toLowerCase().trim(),
          full_name: fullName.trim(),
          status: 'pending',
          onboarding_completed: false,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't fail the sign-up if profile creation fails - user can still log in
      }

      // If an invite code was provided, mark it as used
      if (inviteCode) {
        // Try matching on both possible column names; non-fatal if neither matches
        await adminClient
          .from('invites')
          .update({ status: 'used' })
          .eq('code', inviteCode);

        await adminClient
          .from('invites')
          .update({ status: 'used' })
          .eq('invite_code', inviteCode);
      }
    } catch (adminError) {
      console.error('Admin client error:', adminError);
      // Non-fatal - user auth was created successfully
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: data.user,
    }, { status: 201 });

  } catch (error) {
    console.error('Sign up API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
