import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

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
    const headers = request.headers;
    let redirectOrigin = process.env.NEXT_PUBLIC_APP_URL;
    
    // If NEXT_PUBLIC_APP_URL is not set or doesn't match deployment, use request origin
    if (!redirectOrigin) {
      const proto = headers.get('x-forwarded-proto') || 'http';
      const host = headers.get('host') || 'localhost:5000';
      redirectOrigin = `${proto}://${host}`;
    }
    
    // Validate HTTPS in production
    if (process.env.NODE_ENV === 'production' && !redirectOrigin.startsWith('https://')) {
      console.warn('⚠️  Non-HTTPS redirect in production, using request origin');
      const proto = headers.get('x-forwarded-proto') || 'https';
      const host = headers.get('host');
      if (host) {
        redirectOrigin = `${proto}://${host}`;
      }
    }

    const emailRedirectTo = `${redirectOrigin}/auth/callback`;
    
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
      let errorMessage = 'Failed to send magic link';
      let statusCode = 500;
      
      // Handle specific Supabase error cases
      if (magicLinkError.message?.includes('redirect')) {
        errorMessage = `Email redirect URL not allowed by Supabase Auth. Please add ${redirectOrigin}/** to your Supabase Auth Redirect URLs allowlist.`;
        statusCode = 400;
      } else if (magicLinkError.message) {
        errorMessage = `Failed to send magic link: ${magicLinkError.message}`;
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: magicLinkError.message 
        },
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
