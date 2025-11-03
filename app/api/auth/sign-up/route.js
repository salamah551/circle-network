import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Create Supabase client with cookie support
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
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
