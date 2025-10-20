# Stripe Webhook Setup Guide

## Overview
This document explains how to set up and configure the Stripe webhook handler for securing payment processing in the Circle Network application.

## Webhook Endpoints

### `/api/stripe-webhooks/route.js` (NEW - Recommended)
- **Purpose**: Secure webhook handler using `client_reference_id` for user identification
- **Security**: Uses Stripe signature verification with `STRIPE_WEBHOOK_SECRET`
- **User Identification**: Extracts user ID from `session.client_reference_id`
- **Events Handled**: `checkout.session.completed`

### `/api/stripe/webhook/route.js` (Existing)
- **Purpose**: Legacy webhook handler using metadata for user identification
- **User Identification**: Extracts user ID from `session.metadata.userId`
- **Events Handled**: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`

## Configuration Steps

### 1. Set Environment Variables

Add the following environment variable to your Vercel project:

```bash
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

You'll get this secret when you create a webhook endpoint in the Stripe Dashboard.

### 2. Create Webhook in Stripe Dashboard

1. Go to [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL:
   - For production: `https://yourdomain.com/api/stripe-webhooks`
   - For testing: Use Stripe CLI (see below)
4. Select events to listen to:
   - `checkout.session.completed`
5. Copy the signing secret and add it to your environment variables as `STRIPE_WEBHOOK_SECRET`

### 3. Update Checkout Sessions

The webhook handler expects checkout sessions to include `client_reference_id`. This has been added to:
- `/app/api/stripe/checkout/route.js`
- `/app/api/stripe/create-checkout-session/route.js`

Both routes now include:
```javascript
client_reference_id: user.id // or profile.id
```

## Testing Locally

### Using Stripe CLI

1. Install Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   # or download from https://stripe.com/docs/stripe-cli
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:5000/api/stripe-webhooks
   ```

4. The CLI will output a webhook signing secret. Add it to your `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_test_secret_from_cli
   ```

5. Trigger test events:
   ```bash
   stripe trigger checkout.session.completed
   ```

## Webhook Flow

1. **User completes checkout** on Stripe's hosted checkout page
2. **Stripe sends webhook** to `/api/stripe-webhooks` with event data
3. **Webhook handler verifies** the signature using `STRIPE_WEBHOOK_SECRET`
4. **Extract user ID** from `session.client_reference_id`
5. **Update user profile** in Supabase:
   - `is_subscribed: true`
   - `membership_tier: 'founding'` (or from metadata)
   - `subscription_status: 'active'`
   - `status: 'active'`
   - `is_founding_member: true` (if applicable)
6. **Return 200 response** to acknowledge receipt

## Security Features

✅ **Webhook Signature Verification**: All webhooks are verified using Stripe's signature
✅ **Environment Variable Validation**: Checks all required env vars before processing
✅ **Secure User Identification**: Uses `client_reference_id` for reliable user mapping
✅ **Admin-level Database Access**: Uses Supabase service role key for secure updates
✅ **Error Handling**: Proper HTTP status codes (200, 400, 500) for all scenarios
✅ **Logging**: Comprehensive logging for debugging and monitoring

## Database Updates

When a payment is successfully processed, the webhook updates these fields in the `profiles` table:

| Field | Value | Description |
|-------|-------|-------------|
| `is_subscribed` | `true` | Marks user as having an active subscription |
| `membership_tier` | `'founding'` | Sets membership tier (from metadata or default) |
| `subscription_status` | `'active'` | Stripe subscription status |
| `status` | `'active'` | User account status |
| `is_founding_member` | `true/false` | Founding member flag (from metadata) |

## Troubleshooting

### Webhook Not Receiving Events
1. Check that `STRIPE_WEBHOOK_SECRET` is set correctly in Vercel
2. Verify the webhook URL is correct in Stripe Dashboard
3. Check webhook logs in Stripe Dashboard for delivery issues

### Signature Verification Failing
1. Ensure `STRIPE_WEBHOOK_SECRET` matches the secret from Stripe Dashboard
2. Verify you're using the raw request body (not parsed JSON)
3. Check for any middleware that might modify the request

### User Not Being Updated
1. Verify `client_reference_id` is set in checkout session
2. Check Supabase logs for update errors
3. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set correctly
4. Verify the user ID exists in the `profiles` table

## Monitoring

Monitor your webhook in the Stripe Dashboard:
1. Go to Developers > Webhooks
2. Click on your endpoint
3. View recent webhook attempts, successes, and failures
4. Use "Resend event" to retry failed webhooks

## Additional Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Stripe Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
