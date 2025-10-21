import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST/GET /api/admin/run-invites
 * Admin-only endpoint to manually trigger the invite cron job
 * Requires admin authentication via Supabase
 */
export async function GET(request) {
  return handleRequest(request);
}

export async function POST(request) {
  return handleRequest(request);
}

async function handleRequest(request) {
  try {
    // Create Supabase client with service role for admin check
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Get session from Authorization header or cookie
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No auth token provided' },
        { status: 401 }
      );
    }

    // Verify the user's session
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid session' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin, email')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      console.error('Admin check failed:', profileError || 'User is not admin');
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    console.log(`✅ Admin ${profile.email} manually triggering invite cron job`);

    // Validate required environment variables
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const cronSecret = process.env.CRON_SECRET;

    if (!appUrl || !cronSecret) {
      console.error('Missing required environment variables');
      return NextResponse.json(
        { 
          error: 'Server configuration error',
          details: 'NEXT_PUBLIC_APP_URL and CRON_SECRET must be configured'
        },
        { status: 500 }
      );
    }

    // Call the cron endpoint
    const cronUrl = `${appUrl}/api/bulk-invites/track/send`;
    console.log(`📞 Calling cron endpoint: ${cronUrl}`);

    const cronResponse = await fetch(cronUrl, {
      method: 'GET',
      headers: {
        'x-vercel-cron': '1',
        'Authorization': `Bearer ${cronSecret}`
      }
    });

    const cronData = await cronResponse.json();

    if (!cronResponse.ok) {
      console.error('Cron endpoint failed:', cronData);
      return NextResponse.json(
        {
          error: 'Cron job failed',
          details: cronData,
          status: cronResponse.status
        },
        { status: cronResponse.status }
      );
    }

    console.log('✅ Cron job completed successfully:', cronData);

    return NextResponse.json({
      success: true,
      message: 'Invite cron job triggered successfully',
      triggeredBy: profile.email,
      result: cronData
    });

  } catch (error) {
    console.error('❌ Error in admin run-invites:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
