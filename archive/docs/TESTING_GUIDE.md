# Testing & Verification Guide

This document provides step-by-step instructions for testing the audit fixes.

## Prerequisites
- Access to application deployment
- Stripe dashboard access
- Email testing capability (test email address)
- Browser developer tools

---

## Test 1: Invite URL Routing Fix

### Objective
Verify that email invitation links correctly route through the application without 404 errors.

### Steps
1. **Generate Test Invite**
   ```bash
   # Via API or admin panel, send invite to test@example.com
   POST /api/invites/send
   {
     "email": "test@example.com",
     "invitedBy": "admin-user-id"
   }
   ```

2. **Check Email Content**
   - Open email sent to test@example.com
   - Verify link format: `https://{domain}/invite/accept?code=XXXX&email=test@example.com`
   - Should NOT be: `https://{domain}/?code=XXXX`

3. **Click Invitation Link**
   - Click the invitation link in email
   - Browser should navigate to `/invite/accept`
   - Should immediately redirect (< 1 second)

4. **Verify Landing Page**
   - Final URL should be: `https://{domain}/apply?code=XXXX&email=test@example.com`
   - Code field should be pre-filled
   - Email field should be pre-filled

5. **Complete Application**
   - Submit the application form
   - Should validate successfully
   - Should proceed to authentication

### Expected Results
✅ No 404 errors at any step
✅ All redirects happen automatically
✅ Form fields pre-populated correctly
✅ Validation succeeds

### Common Issues
❌ **404 on /invite/accept**: Check route exists in app router
❌ **Redirect loops**: Check redirect target is `/apply` not `/`
❌ **Empty form fields**: Check URL params are being read correctly

---

## Test 2: Stripe Subscription Webhook

### Objective
Verify that subscription status changes in Stripe correctly update the user's database record.

### Setup
1. Create test subscription in Stripe dashboard
2. Note the subscription ID and customer ID
3. Ensure webhook endpoint is configured: `https://{domain}/api/stripe/webhook`

### Test Cases

#### Case A: Subscription Created
```bash
# Trigger: checkout.session.completed
Expected: Profile status = 'active', subscription_status = 'active'
```

**Steps:**
1. Complete a test checkout session
2. Verify webhook received in Stripe dashboard
3. Check database: `subscription_status` should be `active`
4. Check database: `status` should be `active`

#### Case B: Subscription Updated to Past Due
```bash
# Simulate failed payment
Expected: Profile subscription_status = 'past_due', status = 'active'
```

**Steps:**
1. In Stripe dashboard, update subscription to `past_due`
2. Verify `customer.subscription.updated` webhook sent
3. Check database: `subscription_status` = `past_due`
4. Check database: `status` = `active` (user still has access with warning)

#### Case C: Subscription Cancelled
```bash
# Trigger: customer.subscription.deleted OR subscription.status = 'canceled'
Expected: Profile status = 'inactive', subscription_status = 'cancelled'
```

**Steps:**
1. Cancel subscription in Stripe dashboard
2. Verify webhook received
3. Check database: `subscription_status` = `cancelled`
4. Check database: `status` = `inactive`
5. Verify user cannot access premium features

#### Case D: Subscription Reactivated
```bash
# Trigger: customer.subscription.updated with status 'active'
Expected: Profile status = 'active', subscription_status = 'active'
```

**Steps:**
1. Reactivate cancelled subscription
2. Verify webhook received
3. Check database status updated to active

### Monitoring
Check PostHog for tracking events:
- `subscription_updated`
- `subscription_cancelled`

### SQL Queries for Verification
```sql
-- Check user subscription status
SELECT id, email, status, subscription_status, stripe_customer_id
FROM profiles
WHERE email = 'test@example.com';

-- Check recent subscription events (if using event log)
SELECT * FROM stripe_events
ORDER BY received_at DESC
LIMIT 10;
```

---

## Test 3: Server-Side Feature Checks

### Objective
Verify that feature availability cannot be bypassed by manipulating client-side time.

### Test A: Client-Side Manipulation Attempt

**Steps:**
1. Open browser developer tools
2. Open Console tab
3. Try to bypass with system clock:
   ```javascript
   // This should NOT work for actual feature access
   Date = class extends Date {
     constructor() {
       super('2030-01-01'); // Future date
     }
   }
   ```
4. Try to access a locked feature (e.g., messaging)

**Expected Result:**
✅ Feature remains locked (server-side check prevents access)
❌ Client-side countdown may change (this is OK - it's just UI)

### Test B: Server-Side Validation

**Steps:**
1. Make direct API call to feature check:
   ```bash
   curl -X GET "https://{domain}/api/features/check?feature=messaging"
   ```

2. Verify response uses server time:
   ```json
   {
     "feature": "messaging",
     "unlocked": false,
     "hasLaunched": false,
     "launchDate": "2025-11-10T05:00:00.000Z",
     "serverTime": "2025-10-22T21:30:00.000Z"
   }
   ```

3. Verify `serverTime` matches actual server time (not client time)

### Test C: Batch Feature Check

**Steps:**
```bash
curl -X POST "https://{domain}/api/features/check" \
  -H "Content-Type: application/json" \
  -d '{
    "features": ["messaging", "events", "strategic_intros"]
  }'
```

**Expected Response:**
```json
{
  "features": {
    "messaging": false,
    "events": false,
    "strategic_intros": true
  },
  "hasLaunched": false,
  "serverTime": "2025-10-22T21:30:00.000Z"
}
```

### Test D: Admin Bypass

**Steps:**
1. Login as admin user (ID in ADMIN_USER_IDS)
2. Call feature check with auth token:
   ```bash
   curl -X GET "https://{domain}/api/features/check?feature=messaging" \
     -H "Authorization: Bearer {admin_token}"
   ```

**Expected Result:**
✅ All features unlocked for admin
✅ `isAdmin: true` in response

---

## Test 4: End-to-End Integration

### Objective
Test complete user journey from invitation to subscription.

### Full Flow Test

1. **Send Invitation**
   - Admin sends invite
   - Email received with correct link format

2. **Accept Invitation**
   - Click email link
   - Redirect to `/apply`
   - Form pre-filled

3. **Submit Application**
   - Validate invite code
   - Proceed to signup

4. **Complete Signup**
   - Create account
   - Navigate to subscription page

5. **Subscribe**
   - Complete Stripe checkout
   - Webhook updates profile
   - Profile status = 'active'

6. **Access Features**
   - Check feature availability via API
   - Verify access granted to subscribed features
   - Verify locked features remain locked

7. **Manage Subscription**
   - Update subscription in Stripe
   - Verify database syncs
   - Cancel subscription
   - Verify access revoked

---

## Automated Testing (Future)

### Recommended Test Suite

```javascript
// tests/invite-flow.test.js
describe('Invite Flow', () => {
  test('email link routes to correct page', async () => {
    const link = generateInviteLink('test@example.com', 'CODE123');
    expect(link).toContain('/invite/accept?code=CODE123');
  });

  test('invite/accept redirects to apply', async () => {
    const response = await fetch('/invite/accept?code=TEST');
    expect(response.redirected).toBe(true);
    expect(response.url).toContain('/apply');
  });
});

// tests/stripe-webhook.test.js
describe('Stripe Webhooks', () => {
  test('handles subscription.updated event', async () => {
    const event = mockStripeEvent('customer.subscription.updated');
    const response = await handleWebhook(event);
    expect(response.status).toBe(200);
  });
});

// tests/feature-checks.test.js
describe('Feature Checks', () => {
  test('server-side check cannot be bypassed', async () => {
    const result = await checkFeatureServer('messaging');
    expect(result).toBe(false); // Before launch
  });

  test('admin bypass works', async () => {
    const result = await checkFeatureServer('messaging', adminToken);
    expect(result).toBe(true);
  });
});
```

---

## Monitoring & Alerts

### Metrics to Track

1. **Invite Conversion Rate**
   ```
   invites_sent → apply_page_loads → signups_completed
   Expected improvement: +50-200%
   ```

2. **404 Error Rate**
   ```
   Track 404s on /invite/accept
   Expected: 0% (down from previous rate)
   ```

3. **Webhook Success Rate**
   ```
   stripe_webhooks_received / stripe_webhooks_processed
   Expected: >99%
   ```

4. **Feature Check Latency**
   ```
   Average response time for /api/features/check
   Target: <100ms
   ```

### Alert Conditions

Set up alerts for:
- 404 errors on `/invite/accept` > 0
- Webhook processing failures > 1%
- Subscription status mismatches between Stripe and DB
- Feature check API errors > 0.1%

---

## Rollback Plan

If issues are detected:

### Emergency Rollback
```bash
# Revert to previous deployment
git revert HEAD~2
git push origin copilot/fix-invite-url-routing
```

### Partial Rollback Options

**Revert invite URL only:**
```javascript
// Temporarily change back to old format
const inviteLink = `${appUrl}/?code=${inviteCode}`;
```

**Disable new webhook handler:**
```javascript
// Comment out customer.subscription.updated case
// case 'customer.subscription.updated': ...
```

**Disable server-side checks:**
```javascript
// Fallback to client-side only
if (FORCE_CLIENT_SIDE_CHECKS) {
  return isFeatureUnlocked(featureName);
}
```

---

## Success Criteria

✅ **Invite Flow:** Zero 404 errors on invitation links
✅ **Conversion:** >80% of email clicks reach apply page
✅ **Webhooks:** 100% of subscription changes reflected in DB
✅ **Security:** No bypass attempts succeed
✅ **Performance:** Feature checks < 100ms response time
✅ **Reliability:** 99.9% uptime for all endpoints

---

## Support & Troubleshooting

### Common Issues

**Issue:** Invite links still showing 404
**Fix:** Clear Next.js cache: `rm -rf .next && npm run build`

**Issue:** Webhook not updating database
**Fix:** Check webhook signature verification, verify STRIPE_WEBHOOK_SECRET

**Issue:** Feature check always returns false
**Fix:** Verify server time is correct, check NEXT_PUBLIC_LAUNCH_DATE format

### Debug Mode

Enable debug logging:
```bash
# .env
DEBUG=true
LOG_LEVEL=verbose
```

Check logs:
```bash
# Vercel logs
vercel logs --follow

# Local development
npm run dev
```

---

## Conclusion

All tests should pass with ✅ results. Any ❌ results should be investigated immediately and may require code adjustments or configuration changes.

For support: Create an issue with test results and error logs.
