import { createClient } from '@supabase/supabase-js';
import sgMail from '@sendgrid/mail';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'shehab@thecirclenetwork.org';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Shehab Salamah';
const REPLY_TO_EMAIL = process.env.SENDGRID_REPLY_TO_EMAIL || 'invite@thecirclenetwork.org';

export async function GET(request) {
  try {
    // Security: Verify this is being called by cron job
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key-here';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Email automation cron job started at', new Date().toISOString());

    // Get all emails scheduled for today or earlier that haven't been sent
    const { data: scheduledEmails, error: fetchError } = await supabase
      .from('email_sequences')
      .select(`
        id,
        recipient_email,
        metadata,
        invite_id,
        email_templates (
          subject,
          body
        )
      `)
      .eq('status', 'scheduled')
      .lte('scheduled_for', new Date().toISOString())
      .limit(100); // Process 100 at a time

    if (fetchError) {
      console.error('Error fetching scheduled emails:', fetchError);
      throw fetchError;
    }

    if (!scheduledEmails || scheduledEmails.length === 0) {
      console.log('✅ No emails to send');
      return NextResponse.json({ 
        success: true, 
        message: 'No emails to send',
        sent: 0 
      });
    }

    console.log(`📧 Found ${scheduledEmails.length} emails to send`);

    const results = [];

    // Send each email
    for (const email of scheduledEmails) {
      try {
        // Replace variables in subject and body
        let subject = email.email_templates.subject;
        let body = email.email_templates.body;

        // Replace all {{variable}} placeholders
        for (const [key, value] of Object.entries(email.metadata)) {
          const regex = new RegExp(`{{${key}}}`, 'g');
          subject = subject.replace(regex, value || '');
          body = body.replace(regex, value || '');
        }

        console.log(`📤 Sending email to ${email.recipient_email}: ${subject}`);

        // Send email using SendGrid
        const msg = {
          to: email.recipient_email,
          from: { email: FROM_EMAIL, name: FROM_NAME },
          replyTo: REPLY_TO_EMAIL,
          subject: subject,
          text: body,
          html: body.replace(/\n/g, '<br>'),
          mailSettings: { 
            bypassListManagement: { enable: true } 
          },
          customArgs: {
            email_sequence_id: String(email.id),
            invite_id: String(email.invite_id || '')
          }
        };

        await sgMail.send(msg);

        // Mark as sent
        await supabase
          .from('email_sequences')
          .update({ 
            status: 'sent', 
            sent_at: new Date().toISOString() 
          })
          .eq('id', email.id);

        console.log(`✅ Sent email to ${email.recipient_email}`);

        results.push({ 
          id: email.id, 
          status: 'sent', 
          recipient: email.recipient_email 
        });

      } catch (sendError) {
        console.error(`❌ Error sending email to ${email.recipient_email}:`, sendError);

        // Mark as failed
        await supabase
          .from('email_sequences')
          .update({ 
            status: 'failed', 
            error_message: sendError.message || String(sendError),
            sent_at: new Date().toISOString()
          })
          .eq('id', email.id);

        results.push({ 
          id: email.id, 
          status: 'failed', 
          recipient: email.recipient_email,
          error: sendError.message || String(sendError)
        });
      }
    }

    const successCount = results.filter(r => r.status === 'sent').length;
    const failCount = results.filter(r => r.status === 'failed').length;

    console.log(`✅ Email automation complete: ${successCount} sent, ${failCount} failed`);

    return NextResponse.json({ 
      success: true, 
      message: `Processed ${results.length} emails`,
      sent: successCount,
      failed: failCount,
      results 
    });

  } catch (error) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
}

// Also support POST for manual testing
export async function POST(request) {
  return GET(request);
}