import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/unsubscribe
 * Unsubscribes an email address from all bulk invite communications
 */
export async function POST(request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { email, token } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // Verify the token matches an invite (basic security)
    if (token) {
      const { data: invite } = await supabase
        .from('bulk_invites')
        .select('id')
        .eq('code', token)
        .eq('email', emailLower)
        .single();

      if (!invite) {
        return NextResponse.json(
          { error: 'Invalid unsubscribe link' },
          { status: 400 }
        );
      }
    }

    // Check if already unsubscribed
    const { data: existing } = await supabase
      .from('unsubscribes')
      .select('id')
      .eq('email', emailLower)
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        already: true,
        message: 'Email was already unsubscribed'
      });
    }

    // Add to unsubscribe list
    const { error: insertError } = await supabase
      .from('unsubscribes')
      .insert({
        email: emailLower,
        unsubscribed_at: new Date().toISOString(),
        reason: 'User requested via email link'
      });

    if (insertError) {
      console.error('Unsubscribe insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to unsubscribe' },
        { status: 500 }
      );
    }

    // Update any pending bulk invites to mark as unsubscribed
    await supabase
      .from('bulk_invites')
      .update({ 
        status: 'unsubscribed',
        next_email_scheduled: null
      })
      .eq('email', emailLower)
      .in('status', ['queued', 'sent']);

    console.log(`✅ Unsubscribed: ${emailLower}`);

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed'
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}