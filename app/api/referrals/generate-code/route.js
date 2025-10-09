import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

function generateReferralCode(name) {
  const prefix = name
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 3);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${random}`;
}

export async function POST(request) {
  try {
    // Initialize at runtime
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const cookieStore = cookies();
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, referral_code')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    if (profile.referral_code) {
      return NextResponse.json({
        referral_code: profile.referral_code,
        referral_link: `${process.env.NEXT_PUBLIC_APP_URL}?ref=${profile.referral_code}`
      });
    }

    let referralCode;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      referralCode = generateReferralCode(profile.full_name || 'User');
      
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', referralCode)
        .single();

      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new Error('Could not generate unique referral code');
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ referral_code: referralCode })
      .eq('id', userId);

    if (updateError) throw updateError;

    return NextResponse.json({
      referral_code: referralCode,
      referral_link: `${process.env.NEXT_PUBLIC_APP_URL}?ref=${referralCode}`
    });

  } catch (error) {
    console.error('Error generating referral code:', error);
    return NextResponse.json(
      { error: 'Failed to generate referral code' },
      { status: 500 }
    );
  }
}
