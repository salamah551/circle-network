/**
 * Resend Email Client Singleton
 *
 * Initializes and exports a singleton Resend client for use across the app.
 *
 * Note: Supabase Auth emails (magic links, password resets) are handled
 * separately via Supabase's SMTP settings. To route those through Resend:
 *   1. Go to Supabase Dashboard → Project Settings → Authentication → SMTP Settings
 *   2. Enable Custom SMTP with:
 *      - Host: smtp.resend.com
 *      - Port: 465
 *      - Username: resend
 *      - Password: <your RESEND_API_KEY>
 *      - Sender: hello@thecirclenetwork.org
 */

import { Resend } from 'resend';

let resendClient: Resend | null = null;

export function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error(
        'RESEND_API_KEY environment variable is not set. ' +
        'Add it to your .env.local file or hosting environment.'
      );
    }

    resendClient = new Resend(apiKey);
  }

  return resendClient;
}
