import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sgMail from '@sendgrid/mail';
import { generateEmail, getNextEmailDelay } from '@/lib/sendgrid-templates';

export async function GET(request) {
  try {
    // Initialize at runtime
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'invite@thecirclenetwork.org';
    const FROM_NAME = 'Shehab from The Circle Network';

    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    
    const { data: pendingSequences, error } = await supabase
      .from('bulk_invite_recipients')
      .select(`
        *,
        campaign:bulk_invite_campaigns(*)
      `)
      .eq('status', 'pending')
      .lte('scheduled_send_at', now.toISOString())
      .limit(50);

    if (error) throw error;

    let sentCount = 0;
    let errorCount = 0;

    for (const recipient of pendingSequences || []) {
      try {
        const spotsRemaining = await getSpotsRemaining();
        const newMembersCount = await getNewMembersCount(3);
        const daysRemaining = calculateDaysRemaining(recipient.created_at, recipient.sequence_step);
        
        const sequenceStep = recipient.sequence_step || 1;
        const persona = recipient.persona_type || 'wildcard';
        
        const emailData = generateEmail(persona, sequenceStep, {
          first_name: recipient.name?.split(' ')[0] || 'there',
          last_name: recipient.name?.split(' ').slice(1).join(' ') || '',
          invite_code: recipient.invite_code,
          invite_link: `${process.env.NEXT_PUBLIC_APP_URL}?email=${encodeURIComponent(recipient.email)}&code=${recipient.invite_code}`,
          spots_remaining: spotsRemaining,
          new_members_count: newMembersCount,
          expiry_date: new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
        });

        if (!emailData) {
          console.error(`No email template for persona ${persona} step ${sequenceStep}`);
          await supabase
            .from('bulk_invite_recipients')
            .update({ status: 'failed' })
            .eq('id', recipient.id);
          errorCount++;
          continue;
        }

        await sgMail.send({
          to: recipient.email,
          from: { email: FROM_EMAIL, name: FROM_NAME },
          subject: emailData.subject,
          html: emailData.html
        });

        const nextStep = sequenceStep + 1;
        const nextDelay = getNextEmailDelay(nextStep);
        
        if (nextStep <= 4) {
          await supabase
            .from('bulk_invite_recipients')
            .update({
              status: 'pending',
              sequence_step: nextStep,
              scheduled_send_at: new Date(Date.now() + nextDelay).toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', recipient.id);
        } else {
          await supabase
            .from('bulk_invite_recipients')
            .update({
              status: 'completed',
              updated_at: new Date().toISOString()
            })
            .eq('id', recipient.id);
        }

        sentCount++;
      } catch (emailError) {
        console.error(`Error sending to ${recipient.email}:`, emailError);
        await supabase
          .from('bulk_invite_recipients')
          .update({ 
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', recipient.id);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      errors: errorCount,
      message: `Sent ${sentCount} emails, ${errorCount} errors`
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Failed to process email sequences' },
      { status: 500 }
    );
  }
}

async function getSpotsRemaining() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_founding_member', true);
  
  return Math.max(0, 500 - (count || 0));
}

async function getNewMembersCount(days) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', cutoff.toISOString());
  
  return count || 0;
}

function calculateDaysRemaining(createdAt, currentStep) {
  const intervals = [0, 3, 7, 14];
  const totalDays = 14;
  const daysSinceCreated = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, totalDays - daysSinceCreated);
}
