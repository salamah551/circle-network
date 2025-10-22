# Invite Readiness Checklist

This document provides a comprehensive checklist for deploying and managing the Circle Network invite system. All features are opt-in and additive—existing functionality remains unchanged unless explicitly enabled.

## 🎯 Overview

The invite system includes:
- **Email #0**: Optional plain-text intro email (toggleable)
- **Email #1-4**: Standard HTML drip sequence (Day 0, 3, 7, 11)
- **Thank-you nudge**: Add-to-contacts prompt on welcome page
- **Cron jobs**: Automated phase monitoring and campaign summaries
- **Health checks**: Environment validation and preflight scripts

## ✅ Pre-Launch Checklist

### 1. Environment Variables

#### Required
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_LAUNCH_DATE=2025-11-10T00:00:00Z

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=invite@thecirclenetwork.org
SENDGRID_FROM_NAME=Circle Network
SENDGRID_REPLY_TO_EMAIL=invite@thecirclenetwork.org

# Cron Authentication
CRON_SECRET=your-random-secret-for-cron-jobs
# Generate with: openssl rand -base64 32
```

#### Optional (Invite Features)
```bash
# Email #0 Toggle (default: false)
CAMPAIGN_ENABLE_INTRO_PLAINTEXT=false

# Alternate "From" Address for Email #0
INVITES_FROM_EMAIL=invites@thecirclenetwork.org
INVITES_FROM_NAME=The Circle Network

# Stripe (TEST mode recommended for development)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_ID=price_...

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_your_project_api_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 2. Database Setup

Ensure the `bulk_invites` table supports the new `intro_email_sent` field:

```sql
-- Add intro_email_sent column if not exists (idempotent)
ALTER TABLE bulk_invites 
ADD COLUMN IF NOT EXISTS intro_email_sent BOOLEAN DEFAULT FALSE;
```

This is **optional** and only needed if you plan to enable Email #0.

### 3. Run Preflight Script

```bash
# Install dependencies
npm install

# Run preflight checks
npm run invite:preflight
```

The script will verify:
- ✅ All required environment variables are set
- ✅ Stripe key type (TEST vs LIVE)
- ✅ Feature flag status
- ✅ Health endpoint connectivity

### 4. Test Email Sending

**Test Email #0 (if enabled):**
1. Set `CAMPAIGN_ENABLE_INTRO_PLAINTEXT=true`
2. Create a test campaign with 1 recipient
3. Trigger the cron manually or via admin UI
4. Verify plain-text email arrives without UTM tracking

**Test Standard Sequence:**
1. Create a test campaign
2. Verify emails 1-4 send on schedule (Day 0, 3, 7, 11)
3. Check tracking pixels load
4. Verify unsubscribe links work

### 5. Verify Webhooks

**Stripe Webhook:**
- Confirm webhook endpoint is at `/api/stripe/webhook`
- Verify Node runtime (not Edge) - check for `export const runtime = 'nodejs'`
- Test signature validation with test events
- Check idempotency via `stripe_events` table

**Tracking Pixel:**
- Confirm `/api/bulk-invites/track` returns proper cache headers:
  - `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate`
  - `Pragma: no-cache`
  - `Expires: 0`
- Verify idempotency (opens/clicks counted once per recipient)

### 6. Cron Jobs (Vercel)

If deploying to Vercel, cron jobs in `vercel.json` will run automatically:

```json
{
  "crons": [
    { "path": "/api/bulk-invites/track/send", "schedule": "0 9 * * *" },     // Daily 09:00 UTC
    { "path": "/api/email-automation", "schedule": "5 9 * * *" },            // Daily 09:05 UTC
    { "path": "/api/cron/phase-guard", "schedule": "0 * * * *" },            // Hourly
    { "path": "/api/admin/campaign-summary", "schedule": "0 10 * * *" }      // Daily 10:00 UTC
  ]
}
```

If **not** on Vercel, set up your own cron scheduler to call these endpoints with:
- Header: `Authorization: Bearer YOUR_CRON_SECRET`

**Test Cron Endpoints:**
```bash
# Test phase guard
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://yourdomain.com/api/cron/phase-guard

# Test campaign summary
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://yourdomain.com/api/admin/campaign-summary
```

### 7. Welcome Page Add-to-Contacts

After successful payment/application:
- User sees welcome page at `/welcome`
- "Add to contacts" nudge appears automatically
- Instructions provided for Gmail, Outlook, Apple Mail
- No configuration needed—works out of the box

## 🚀 Deployment Checklist

- [ ] Copy `.env.example` to `.env.local` and fill all values
- [ ] Run `npm run invite:preflight` locally
- [ ] Test Email #0 (if enabled) in development
- [ ] Test standard email sequence
- [ ] Verify Stripe webhook with test events
- [ ] Check tracking pixel responses
- [ ] Deploy to staging/production
- [ ] Run `npm run invite:preflight` in production (via deploy logs or manual trigger)
- [ ] Set up Stripe webhook in Stripe Dashboard
- [ ] Test end-to-end: invite → apply → payment → welcome
- [ ] Verify cron jobs execute (check logs after scheduled times)
- [ ] Monitor first 24h of production sends

## 🔧 Feature Toggles

### Enable Plain-Text Email #0

**To enable:**
```bash
CAMPAIGN_ENABLE_INTRO_PLAINTEXT=true
```

**Behavior:**
- Sends minimal plain-text email before Email #1
- No UTM parameters or click tracking
- Uses `INVITES_FROM_EMAIL` if provided, else `SENDGRID_FROM_EMAIL`
- Scheduled 2 days before Email #1
- Respects List-Unsubscribe headers

**To disable (default):**
```bash
CAMPAIGN_ENABLE_INTRO_PLAINTEXT=false
# or omit the variable entirely
```

## 📊 Monitoring & Maintenance

### Health Check
```bash
curl https://yourdomain.com/api/health
```

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:00:00.000Z",
  "environment": {
    "nodeEnv": "production",
    "hasSupabaseUrl": true,
    "hasSendGridKey": true,
    "hasStripeKey": true,
    "hasCronSecret": true,
    "hasAppUrl": true
  },
  "features": {
    "introPlaintextEnabled": false
  }
}
```

### Campaign Metrics

Check campaign performance via:
1. Admin dashboard: `/admin/bulk-invites`
2. Campaign summary cron: `/api/admin/campaign-summary`
3. Direct database query: `bulk_invite_campaigns` table

Key metrics:
- **Sent**: Total emails delivered
- **Opened**: Open rate (tracking pixel)
- **Clicked**: Click-through rate
- **Converted**: Paid memberships

### Logs

Monitor logs for:
- ✅ Email send confirmations
- ⚠️ Suppression events (unsubscribes, existing members)
- ❌ Send failures
- 🔄 Cron job executions
- 📊 Campaign summaries

## 🛡️ Safety & Idempotency

All features are designed to be:
- **Additive**: No breaking changes to existing flows
- **Idempotent**: Safe to retry; prevents duplicate sends/counts
- **Opt-in**: Disabled by default unless explicitly enabled
- **TEST-friendly**: Supports Stripe test mode

### Idempotency Guarantees

1. **Email Sends**: Tracked via `last_send_date` and `intro_email_sent` flags
2. **Tracking Events**: Unique constraint on `(invite_id, event)` in `bulk_invite_events`
3. **Stripe Events**: Deduplication via `stripe_events` table
4. **Conversions**: Only counted once per invite via event uniqueness

## 🆘 Troubleshooting

### Emails Not Sending

1. Check `SENDGRID_API_KEY` is valid
2. Verify campaigns are `status='active'`
3. Check `next_email_scheduled` dates
4. Review suppression lists (unsubscribes, existing members)
5. Check daily limit hasn't been reached
6. View logs for send errors

### Email #0 Not Appearing

1. Verify `CAMPAIGN_ENABLE_INTRO_PLAINTEXT=true`
2. Check recipients don't have `intro_email_sent=true` already
3. Ensure `sequence_stage=0` (not already progressed)

### Tracking Pixel Not Working

1. Check pixel URL format: `/api/bulk-invites/track?rid=123&type=open`
2. Verify email client isn't blocking images
3. Check cache headers are present
4. Review idempotency logic (counts once per recipient)

### Cron Jobs Not Running

1. **On Vercel**: Check Vercel dashboard for cron execution logs
2. **Elsewhere**: Verify external scheduler is configured
3. Test manual trigger with `CRON_SECRET`
4. Check endpoint returns 401 without proper auth

### Stripe Webhook Failing

1. Verify webhook secret matches Stripe Dashboard
2. Check endpoint is using Node runtime (not Edge)
3. Test with Stripe CLI: `stripe listen --forward-to localhost:5000/api/stripe/webhook`
4. Review signature validation logic
5. Check idempotency table for duplicates

## 📚 Additional Resources

- **Admin Guide**: `ADMIN_GUIDE.md`
- **Launch Checklist**: `LAUNCH_CHECKLIST.md`
- **Testing Report**: `TESTING_REPORT.md`
- **Strategy Doc**: `STRATEGY.md`

## 🔒 Security Notes

- Always use `CRON_SECRET` for cron endpoints
- Use Stripe TEST keys during development (`sk_test_...`)
- Never commit `.env.local` or real credentials
- Rotate `CRON_SECRET` periodically
- Monitor failed authentication attempts
- Keep dependencies updated: `npm audit fix`

---

**Last Updated**: 2025-01-15  
**Version**: 1.0.0
