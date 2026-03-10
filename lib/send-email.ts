/**
 * Email Sending Service
 *
 * Central module for all transactional email sending in The Circle Network.
 * Uses Resend as the delivery provider via the singleton client in lib/resend.ts.
 */

import { getResendClient } from './resend';
import { loadEmailTemplate, replaceVariables } from './email-templates';
import { markdownToHtml, wrapInEmailLayout } from './email-html';

const DEFAULT_FROM =
  process.env.RESEND_FROM_EMAIL || 'The Circle Network <hello@thecirclenetwork.org>';

const ADMIN_EMAIL = 'help@thecirclenetwork.org';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Core send function
// ---------------------------------------------------------------------------

/**
 * Send a single email via Resend.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  try {
    const resend = getResendClient();

    const { data, error } = await resend.emails.send({
      from: options.from || DEFAULT_FROM,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      ...(options.replyTo ? { reply_to: options.replyTo } : {}),
      ...(options.cc ? { cc: Array.isArray(options.cc) ? options.cc : [options.cc] } : {}),
      ...(options.bcc ? { bcc: Array.isArray(options.bcc) ? options.bcc : [options.bcc] } : {}),
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('sendEmail error:', err);
    return { success: false, error: err?.message || 'Unknown error' };
  }
}

// ---------------------------------------------------------------------------
// Templated email
// ---------------------------------------------------------------------------

/**
 * Send an email using a named markdown template from the /emails directory.
 *
 * @param templateName - Filename without extension (e.g. 'invite')
 * @param to           - Recipient email address
 * @param variables    - Key/value map for {{variable}} substitution
 */
export async function sendTemplatedEmail(
  templateName: string,
  to: string,
  variables: Record<string, string> = {}
): Promise<SendEmailResult> {
  const template = loadEmailTemplate(templateName);

  if (!template) {
    return {
      success: false,
      error: `Email template '${templateName}' not found`,
    };
  }

  const contentWithVars = replaceVariables(template.content, variables);
  const subjectWithVars = replaceVariables(template.subject, variables);
  const html = wrapInEmailLayout(markdownToHtml(contentWithVars));

  return sendEmail({ to, subject: subjectWithVars, html });
}

// ---------------------------------------------------------------------------
// Helper functions for common email types
// ---------------------------------------------------------------------------

/**
 * Send a membership invite email.
 *
 * @param params.to          - Recipient email address
 * @param params.inviteCode  - The unique invite code (shown in email and pre-filled in apply URL)
 * @param params.inviterName - Optional display name of the person who sent the invite
 * @param params.applyUrl    - Optional full URL to accept the invite (defaults to /apply?code=...)
 * @returns SendEmailResult with success flag and Resend message ID on success
 */
export async function sendInviteEmail(params: {
  to: string;
  inviteCode: string;
  inviterName?: string;
  applyUrl?: string;
}): Promise<SendEmailResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thecirclenetwork.org';
  const applyUrl =
    params.applyUrl || `${appUrl}/apply?code=${encodeURIComponent(params.inviteCode)}`;

  const html = wrapInEmailLayout(
    markdownToHtml(`# You've Been Invited to The Circle Network

${params.inviterName ? `**${params.inviterName}** has extended a personal invitation for you to join The Circle Network — ` : ''}An exclusive private network for top-tier executives and founders.

Your invite code: **${params.inviteCode}**

This invitation is personal and non-transferable. Use it to reserve your place before it expires.

[Accept Your Invitation](${applyUrl})

---

The Circle Network is invite-only. Membership is granted to senior leaders who are committed to meaningful professional exchange.

If you believe you received this message in error, please disregard it.`),
    "You've received a personal invitation to join The Circle Network."
  );

  return sendEmail({
    to: params.to,
    subject: "You're Invited to The Circle Network",
    html,
  });
}

/**
 * Send a notification email to a member.
 *
 * @param params.to   - Recipient email address
 * @param params.type - Notification type. Supported: 'message', 'connection', 'application', 'intro'.
 *                      Unknown types fall back to a generic "Notification" label.
 * @param params.data - Optional key/value data. Recognized keys:
 *                        `message` — Additional body text to include in the email.
 * @returns SendEmailResult with success flag and Resend message ID on success
 */
export async function sendNotificationEmail(params: {
  to: string;
  type: string;
  data?: Record<string, string>;
}): Promise<SendEmailResult> {
  const typeLabels: Record<string, string> = {
    message: 'New Message',
    connection: 'New Connection Request',
    application: 'Application Update',
    intro: 'New Introduction',
  };

  const label = typeLabels[params.type] || 'Notification';

  const html = wrapInEmailLayout(
    markdownToHtml(`# ${label}

You have a new notification on The Circle Network.

${params.data?.message ? params.data.message : ''}

[View in Dashboard](${process.env.NEXT_PUBLIC_APP_URL || 'https://thecirclenetwork.org'}/dashboard)`)
  );

  return sendEmail({
    to: params.to,
    subject: `Circle Network — ${label}`,
    html,
  });
}

/**
 * Send a contact form confirmation email to the person who submitted the form.
 *
 * @param params.to   - Submitter's email address
 * @param params.name - Submitter's display name (used in the greeting)
 * @returns SendEmailResult with success flag and Resend message ID on success
 */
export async function sendContactConfirmation(params: {
  to: string;
  name: string;
}): Promise<SendEmailResult> {
  const html = wrapInEmailLayout(
    markdownToHtml(`# Thank You for Reaching Out, ${params.name}

We've received your message and will get back to you within 1–2 business days.

If your matter is urgent, you can also reach us directly at [help@thecirclenetwork.org](mailto:help@thecirclenetwork.org).

Warm regards,  
**The Circle Network Team**`),
    "We've received your message and will be in touch soon."
  );

  return sendEmail({
    to: params.to,
    subject: 'We received your message — The Circle Network',
    html,
  });
}

/**
 * Send a contact form notification email to the admin (help@thecirclenetwork.org).
 * The reply-to header is set to the submitter's email for easy follow-up.
 *
 * @param params.name    - Submitter's name
 * @param params.email   - Submitter's email address (used as reply-to)
 * @param params.subject - Subject line from the contact form
 * @param params.message - Message body from the contact form
 * @returns SendEmailResult with success flag and Resend message ID on success
 */
export async function sendContactNotification(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<SendEmailResult> {
  const html = wrapInEmailLayout(
    markdownToHtml(`# New Contact Form Submission

**From:** ${params.name} (${params.email})

**Subject:** ${params.subject}

---

${params.message}`)
  );

  return sendEmail({
    to: ADMIN_EMAIL,
    replyTo: params.email,
    subject: `Contact Form: ${params.subject}`,
    html,
  });
}
