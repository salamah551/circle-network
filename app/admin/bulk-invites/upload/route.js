import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request) {
  try {
    const { campaignId, recipients } = await request.json();

    if (!campaignId || !recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Campaign ID and recipients required' },
        { status: 400 }
      );
    }

    // Generate unique invite codes and prepare recipients
    const recipientsToInsert = recipients.map(r => ({
      campaign_id: campaignId,
      first_name: r.firstName,
      last_name: r.lastName,
      email: r.email.toLowerCase(),
      invite_code: `FOUNDING-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: 'pending',
      sequence_stage: 0,
      next_email_scheduled: new Date()
    }));

    // Insert recipients
    const { data, error } = await supabaseAdmin
      .from('bulk_invite_recipients')
      .insert(recipientsToInsert)
      .select();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json(
        { error: 'Failed to upload recipients' },
        { status: 500 }
      );
    }

    // Update campaign total
    await supabaseAdmin
      .from('bulk_invite_campaigns')
      .update({ total_recipients: recipientsToInsert.length })
      .eq('id', campaignId);

    return NextResponse.json({ 
      success: true, 
      count: recipientsToInsert.length 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}