# Security Hardening Verification Guide

This document provides verification steps for the security hardening changes implemented in this PR.

## Changes Overview

### A) Database Constraints and Indexes
1. **Unique Constraints**
   - `ux_bulk_invites_campaign_email`: Prevents duplicate emails per campaign (case-insensitive)
   - `ux_bulk_invite_events_one_per_type`: Ensures one event per invite per type
   - `ux_bulk_invite_suppressions_email`: Prevents duplicate suppressions (case-insensitive)

2. **Lookup Indexes**
   - `ix_bulk_invites_campaign`: Fast campaign lookups
   - `ix_bulk_invites_email_lower`: Fast email lookups (case-insensitive)
   - `ix_bulk_invite_events_invite_event`: Fast event lookups

3. **Foreign Keys**
   - `fk_bulk_invites_campaign_id`: bulk_invites → bulk_invite_campaigns (CASCADE)
   - `fk_bulk_invite_events_invite_id`: bulk_invite_events → bulk_invites (CASCADE)

4. **Idempotency Table**
   - `stripe_events`: Prevents duplicate Stripe webhook processing

### B) Stripe Metadata and Conversion Tracking
1. **Checkout Session Metadata**
   - Added support for `invite_id`, `invite_code`, and `campaign_id` in checkout sessions
   - Metadata attached to both session and subscription for persistence

2. **Webhook Handler**
   - Migrated from `webhook_events` to `stripe_events` table
   - Added `invoice.payment_succeeded` handler
   - Implements metadata-based conversion mapping with email fallback
   - Idempotent conversion tracking using unique constraint

### C) Email Compliance
1. **List-Unsubscribe Headers**
   - Added to bulk invite emails (all 4 sequences)
   - Added to sendgrid.js library functions
   - Includes both mailto and HTTPS unsubscribe methods
   - Added List-Unsubscribe-Post header for one-click unsubscribe

## Verification Steps

### 1. Database Migration Verification

Run the migration and verify indexes were created:

```sql
-- Check unique indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('bulk_invites', 'bulk_invite_events', 'bulk_invite_suppressions', 'stripe_events')
AND indexdef LIKE '%UNIQUE%'
ORDER BY tablename, indexname;

-- Expected results:
-- ux_bulk_invites_campaign_email (on campaign_id, lower(email))
-- ux_bulk_invite_events_one_per_type (on invite_id, event)
-- ux_bulk_invite_suppressions_email (on lower(email))
```

Check foreign key constraints:

```sql
-- Check foreign keys
SELECT conname, conrelid::regclass, confrelid::regclass, confdeltype
FROM pg_constraint
WHERE conname IN ('fk_bulk_invites_campaign_id', 'fk_bulk_invite_events_invite_id');

-- Expected results:
-- fk_bulk_invites_campaign_id: bulk_invites → bulk_invite_campaigns (CASCADE)
-- fk_bulk_invite_events_invite_id: bulk_invite_events → bulk_invites (CASCADE)
```

Verify stripe_events table:

```sql
-- Check stripe_events table
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'stripe_events'
ORDER BY ordinal_position;

-- Expected columns:
-- event_id (text, PRIMARY KEY)
-- received_at (timestamp with time zone)
```

### 2. Duplicate Prevention Testing

Test unique constraint on campaign+email:

```sql
-- This should succeed (first insert)
INSERT INTO bulk_invites (campaign_id, email, code) 
VALUES ('test-campaign-id', 'test@example.com', 'TEST-CODE-1');

-- This should FAIL with unique constraint violation
INSERT INTO bulk_invites (campaign_id, email, code) 
VALUES ('test-campaign-id', 'TEST@EXAMPLE.COM', 'TEST-CODE-2');
-- Error: duplicate key value violates unique constraint "ux_bulk_invites_campaign_email"
```

Test unique constraint on invite+event:

```sql
-- This should succeed (first event)
INSERT INTO bulk_invite_events (invite_id, event) 
VALUES ('test-invite-id', 'sent');

-- This should FAIL with unique constraint violation
INSERT INTO bulk_invite_events (invite_id, event) 
VALUES ('test-invite-id', 'sent');
-- Error: duplicate key value violates unique constraint "ux_bulk_invite_events_one_per_type"
```

### 3. Stripe Webhook Idempotency Testing

Test the idempotency mechanism:

```bash
# Send the same webhook event twice
curl -X POST http://localhost:5000/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -H "stripe-signature: <test-signature>" \
  -d '{"id": "evt_test_123", "type": "invoice.payment_succeeded", ...}'

# First request: Should process normally
# Second request: Should return {"received": true, "status": "duplicate"}
```

Verify in database:

```sql
-- Check stripe_events table
SELECT event_id, received_at 
FROM stripe_events 
WHERE event_id = 'evt_test_123';

-- Should have exactly ONE entry, even if webhook was called multiple times
```

### 4. Conversion Tracking Testing

Test metadata-based conversion:

```javascript
// Create checkout session with invite metadata
const response = await fetch('/api/stripe/create-checkout-session', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': 'user-123'
  },
  body: JSON.stringify({
    priceId: 'price_123',
    invite_id: 'invite-abc',
    invite_code: 'CN-TEST-1234',
    campaign_id: 'campaign-xyz'
  })
});
```

Verify metadata in Stripe dashboard:
- Session metadata should include: `user_id`, `invite_id`, `invite_code`, `campaign_id`
- Subscription metadata should also include these fields

Test conversion tracking on payment:

```sql
-- After invoice.payment_succeeded webhook is received
SELECT * FROM bulk_invite_events 
WHERE invite_id = 'invite-abc' AND event = 'converted';

-- Should have exactly ONE conversion event

-- Check campaign totals
SELECT total_converted FROM bulk_invite_campaigns 
WHERE id = 'campaign-xyz';

-- Should be incremented by 1
```

### 5. List-Unsubscribe Header Testing

Inspect email headers in sent emails:

```
List-Unsubscribe: <mailto:invites@thecirclenetwork.org?subject=unsubscribe>, <https://thecirclenetwork.org/unsubscribe?email=user@example.com&token=CN-TEST-1234>
List-Unsubscribe-Post: List-Unsubscribe=One-Click
```

Test unsubscribe functionality:

```bash
# Test HTTPS unsubscribe
curl -X POST https://thecirclenetwork.org/api/unsubscribe \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "token": "CN-TEST-1234"}'

# Should return: {"success": true, "message": "Successfully unsubscribed"}
```

Verify suppression:

```sql
-- Check unsubscribes table
SELECT email, reason, unsubscribed_at 
FROM unsubscribes 
WHERE email = 'user@example.com';

-- Check bulk_invite_suppressions table
SELECT email, reason 
FROM bulk_invite_suppressions 
WHERE lower(email) = 'user@example.com';

-- Check that future emails are suppressed
SELECT * FROM bulk_invites 
WHERE email = 'user@example.com' AND status = 'unsubscribed';
```

### 6. Email Compliance Testing

Test with mail-tester.com:
1. Send a test email using the bulk invite system
2. Check the email at mail-tester.com
3. Verify List-Unsubscribe headers are present and valid
4. Score should improve due to proper unsubscribe headers

### 7. Edge Cases and Error Handling

Test invoice.payment_succeeded without metadata:

```javascript
// Webhook should fall back to email matching
{
  "type": "invoice.payment_succeeded",
  "data": {
    "object": {
      "customer_email": "existing@example.com",
      "metadata": {} // No invite_id or campaign_id
    }
  }
}
// Should find invite by email and track conversion
```

Test with misspelled event type:

```javascript
// Webhook should log warning but not crash
{
  "type": "invoice.payment_succeded", // typo
  "data": { ... }
}
// Should log: "Unknown event type: invoice.payment_succeded"
```

## Expected Behavior

### Idempotency
- Duplicate webhook events are silently ignored
- Duplicate conversion events don't increment campaign totals
- Same email cannot be added to campaign twice

### Performance
- Queries on campaign_id and email are fast due to indexes
- Case-insensitive email lookups work correctly

### Data Integrity
- Foreign key cascades prevent orphaned records
- Unique constraints prevent duplicate data
- Conversion tracking is accurate and idempotent

### Email Compliance
- All emails include proper unsubscribe headers
- Unsubscribe links work correctly
- Suppression list prevents re-sending to unsubscribed users

## Rollback Plan

If issues occur, rollback steps:

1. **Code Rollback**: Revert the PR (git revert)

2. **Database Rollback** (only if migration causes issues):
```sql
-- Remove indexes
DROP INDEX IF EXISTS ux_bulk_invites_campaign_email;
DROP INDEX IF EXISTS ux_bulk_invite_events_one_per_type;
DROP INDEX IF EXISTS ux_bulk_invite_suppressions_email;
DROP INDEX IF EXISTS ix_bulk_invites_campaign;
DROP INDEX IF EXISTS ix_bulk_invites_email_lower;
DROP INDEX IF EXISTS ix_bulk_invite_events_invite_event;
DROP INDEX IF EXISTS ix_stripe_events_received_at;

-- Remove foreign keys
ALTER TABLE bulk_invites DROP CONSTRAINT IF EXISTS fk_bulk_invites_campaign_id;
ALTER TABLE bulk_invite_events DROP CONSTRAINT IF EXISTS fk_bulk_invite_events_invite_id;

-- Remove table (only if causing issues)
DROP TABLE IF EXISTS stripe_events;
```

Note: Indexes and constraints are safe to keep even after code rollback, as they don't break existing functionality.

## Monitoring

After deployment, monitor:

1. **Error Logs**: Watch for unique constraint violations (expected during duplicate attempts)
2. **Conversion Tracking**: Verify campaign.total_converted matches bulk_invite_events count
3. **Stripe Webhooks**: Check that duplicate events are handled correctly
4. **Email Delivery**: Monitor spam scores and delivery rates
5. **Unsubscribe Rate**: Track unsubscribe requests

## Support

If issues arise:
1. Check application logs for errors
2. Verify database migration completed successfully
3. Test webhook endpoints with Stripe CLI
4. Contact engineering team with logs and error messages
