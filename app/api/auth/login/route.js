import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';



export async function POST(request) {
  // Initialize at runtime
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();
    
    // ✅ Check if email belongs to an admin user
    const { data: adminProfile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('email', emailLower)
      .single();
    
    const isAdminEmail = adminProfile?.is_admin === true;

    if (!isAdminEmail) {
      // Check if user exists for non-admin emails
      const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
      
      const userExists = users?.some(user => user.email?.toLowerCase() === emailLower);

      if (!userError && !userExists) {
        return NextResponse.json(
          { error: 'No account found with this email' },
          { status: 404 }
        );
      }
    }

    // Send magic link using Supabase Auth
    const { error: magicLinkError } = await supabaseAdmin.auth.signInWithOtp({
      email: emailLower,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        shouldCreateUser: isAdminEmail // ✅ Auto-create for admin emails
      }
    });

    if (magicLinkError) {
      console.error('Magic link error:', magicLinkError);
      return NextResponse.json(
        { error: 'Failed to send magic link' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Magic link sent successfully'
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
