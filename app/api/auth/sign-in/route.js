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

    // Create Supabase client with cookie support
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Sign in the user
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      
      // Handle invalid credentials
      if (error.message?.toLowerCase().includes('invalid') || 
          error.message?.toLowerCase().includes('credentials')) {
        return NextResponse.json(
          { error: 'Invalid login credentials' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: error.message || 'Failed to sign in' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Signed in successfully',
      user: data.user,
    }, { status: 200 });

  } catch (error) {
    console.error('Sign in API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
