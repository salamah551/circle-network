// app/api/invites/resend/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { sendInviteEmail } from '@/lib/send-email';

export async function POST(request) {
  // Initialize at runtime
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  try {
    const { inviteId, email, inviteCode, invitedBy } = await request.json();

    if (!inviteId || !email || !inviteCode) {
      return NextResponse.json(
        { error: 'Invite ID, email, and invite code are required' },
        { status: 400 }
      );
    }

    // Verify the caller is authenticated and owns this invite
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            try { cookieStore.set(name, value, options); } catch (e) { console.error('Cookie set error:', e); }
          },
          remove(name, options) {
            try { cookieStore.set(name, '', { ...options, maxAge: 0 }); } catch (e) { console.error('Cookie remove error:', e); }
          },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (invitedBy && user.id !== invitedBy) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch the inviter's name for the email
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    // Update the invite's last sent timestamp
    await supabaseAdmin
      .from('invites')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', inviteId);

    // Send the invite email (non-blocking — don't fail the response on email error)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thecirclenetwork.org';
    const applyUrl = `${appUrl}/apply?code=${encodeURIComponent(inviteCode)}&email=${encodeURIComponent(email)}`;

    sendInviteEmail({
      to: email,
      inviteCode,
      inviterName: profile?.full_name || undefined,
      applyUrl,
    }).catch((err) => console.error('Invite email send error:', err));

    return NextResponse.json({
      success: true,
      message: 'Invite resent successfully'
    });

  } catch (error) {
    console.error('Resend invite error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
