import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Look up a profile with this email that has an active or trialing subscription
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, subscription_status')
      .eq('email', email.toLowerCase().trim())
      .in('subscription_status', ['active', 'trialing'])
      .maybeSingle();

    if (error) {
      console.error('Check membership error:', error);
      // Fail open — do not block the join flow on a lookup error
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({ exists: !!data });
  } catch (error) {
    console.error('Check membership API error:', error);
    // Fail open — do not block the join flow on unexpected errors
    return NextResponse.json({ exists: false });
  }
}
