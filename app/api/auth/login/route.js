import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getAuthCallbackUrl, formatAuthError } from '@/lib/auth-redirect';

export async function POST(request) {
  let supabaseAdmin;
  
  try {
    supabaseAdmin = getSupabaseAdmin();
  } catch (error) {
    console.error('Failed to initialize Supabase admin client:', error.message);
    return NextResponse.json(
      { error: 'Server configuration error. Please contact support.' },
      { status: 500 }
    );
  }
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

    // Compute redirect URL with fallback to request origin
    const { url: emailRedirectTo, origin: redirectOrigin } = getAuthCallbackUrl(request);
    
    // Send magic link using Supabase Auth
    const { error: magicLinkError } = await supabaseAdmin.auth.signInWithOtp({
      email: emailLower,
      options: {
        emailRedirectTo,
        shouldCreateUser: isAdminEmail // ✅ Auto-create for admin emails
      }
    });

    if (magicLinkError) {
      console.error('Magic link error:', magicLinkError);
      
      // Return descriptive error from Supabase
      const { message: errorMessage, statusCode } = formatAuthError(magicLinkError, redirectOrigin);
      
      return NextResponse.json(
        { error: errorMessage },
        { status: statusCode }
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
