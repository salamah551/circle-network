# Deployment Checklist: Automated Phase Lifecycle

Use this checklist to deploy the automated phase lifecycle system to production.

## Pre-Deployment

### 1. Review Changes
- [ ] Review all code changes in PR
- [ ] Read [MIGRATION_NOTES.md](./MIGRATION_NOTES.md)
- [ ] Read [AUTOMATED_PHASE_LIFECYCLE.md](./AUTOMATED_PHASE_LIFECYCLE.md)
- [ ] Understand rollback procedure

### 2. Test in Staging/Dev
- [ ] Deploy to staging environment
- [ ] Run migration on staging database
- [ ] Test phase guard endpoint: `curl https://staging.app/api/automation/phase-guard`
- [ ] Verify tier totals table created
- [ ] Verify campaign columns added
- [ ] Test Stripe webhook with test payments
- [ ] Verify phase transitions work correctly
- [ ] Test send pipeline with phase filtering

### 3. Security Review
- [ ] Verify CRON_SECRET is strong and unique
- [ ] Confirm Stripe price IDs are for LIVE mode (not test)
- [ ] Review CodeQL scan results (should be 0 vulnerabilities)
- [ ] Verify Supabase service role key is properly secured

## Deployment Steps

### Step 1: Database Migration (5 minutes)

**Option A: Supabase CLI**
```bash
cd /home/runner/work/circle-network/circle-network
npx supabase db push
```

**Option B: Direct SQL**
```bash
psql $DATABASE_URL -f supabase/migrations/20251023_automated_phase_lifecycle.sql
```

**Option C: Supabase Dashboard**
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/20251023_automated_phase_lifecycle.sql`
3. Execute
4. Verify: `SELECT * FROM membership_tier_totals;`

**Verification:**
- [ ] `membership_tier_totals` table exists
- [ ] Table has 3 rows: founding (0), premium (0), elite (0)
- [ ] `bulk_invite_campaigns.target_phase` column exists
- [ ] `bulk_invite_campaigns.is_primary` column exists
- [ ] All existing campaigns have `target_phase = 'founding'`

### Step 2: Environment Variables (2 minutes)

Add to production `.env` or Vercel environment:

```bash
# Phase Management
FOUNDING_CAP=100

# Stripe Price IDs (LIVE mode - verify these!)
STRIPE_PRICE_FOUNDING=price_live_founding_member_id
STRIPE_PRICE_PREMIUM=price_live_premium_member_id
STRIPE_PRICE_ELITE=price_live_elite_member_id

# Cron Security (generate a strong random secret)
CRON_SECRET=your-secure-random-secret-here
```

**Generate CRON_SECRET:**
```bash
# On Unix/Mac:
openssl rand -base64 32

# Or use any strong password generator
```

**Verification:**
- [ ] All 5 variables set in production
- [ ] FOUNDING_CAP is a number (e.g., 100)
- [ ] Stripe price IDs start with `price_live_` (not `price_test_`)
- [ ] CRON_SECRET is strong (32+ characters, random)
- [ ] Environment variables saved/deployed

### Step 3: Tag Existing Campaigns (3 minutes)

Identify and tag your campaigns:

```sql
-- List all campaigns
SELECT id, name, status, created_at 
FROM bulk_invite_campaigns 
ORDER BY created_at;

-- Tag your main founding campaign
UPDATE bulk_invite_campaigns 
SET target_phase = 'founding', is_primary = true
WHERE id = 'your-founding-campaign-id';

-- Create or tag premium campaign (if exists)
UPDATE bulk_invite_campaigns 
SET target_phase = 'premium', is_primary = true, status = 'draft'
WHERE id = 'your-premium-campaign-id';

-- Or create new premium campaign
INSERT INTO bulk_invite_campaigns (name, target_phase, is_primary, status)
VALUES ('Premium Member Campaign', 'premium', true, 'draft');
```

**Verification:**
- [ ] At least one campaign has `target_phase = 'founding'` and `is_primary = true`
- [ ] Premium campaign exists (status can be 'draft')
- [ ] Run: `SELECT id, name, target_phase, is_primary, status FROM bulk_invite_campaigns;`

### Step 4: Deploy Application Code (5 minutes)

**Deploy via Vercel:**
```bash
# If using Vercel CLI
vercel --prod

# Or merge PR and let CI/CD deploy
```

**Or deploy via your CI/CD pipeline**

**Verification:**
- [ ] Application deployed successfully
- [ ] No build errors
- [ ] All new endpoints accessible

### Step 5: Test Endpoints (5 minutes)

**Test phase guard endpoint:**
```bash
# Should return current phase and tier totals
curl https://your-production-app.com/api/automation/phase-guard
```

Expected response:
```json
{
  "success": true,
  "phase": "founding",
  "founders": {
    "total": 0,
    "cap": 100,
    "remaining": 100
  },
  "tierTotals": {
    "founding": 0,
    "premium": 0,
    "elite": 0
  },
  "actions": {
    "pausedCampaignIds": [],
    "pausedCampaigns": [],
    "activatedCampaignIds": [],
    "activatedCampaigns": []
  },
  "timestamp": "2025-10-22T..."
}
```

**Test cron endpoint:**
```bash
curl -H "Authorization: Bearer your-cron-secret" \
  https://your-production-app.com/api/cron/phase-guard
```

**Verification:**
- [ ] Phase guard endpoint returns valid JSON
- [ ] Phase is "founding" (assuming no conversions yet)
- [ ] Tier totals show 0 for all tiers
- [ ] Cron endpoint requires CRON_SECRET
- [ ] Cron endpoint returns same data as automation endpoint

### Step 6: Setup Vercel Cron (Optional, 3 minutes)

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/phase-guard",
    "schedule": "0 */6 * * *"
  }]
}
```

Then redeploy.

**Verification:**
- [ ] Cron job appears in Vercel dashboard
- [ ] Cron job has correct path and schedule
- [ ] Wait for first cron run or trigger manually

### Step 7: Monitor First Conversion (Ongoing)

When first payment comes in:

**Check logs for:**
- `✅ Incremented [tier] tier total`
- `✅ Phase guard completed: phase=[phase]`

**Verify in database:**
```sql
SELECT * FROM membership_tier_totals ORDER BY tier;
-- founding total should increment
```

**Verification:**
- [ ] Stripe webhook receives payment
- [ ] Tier total increments correctly
- [ ] Phase guard runs automatically
- [ ] No errors in logs

### Step 8: Monitor Phase Transition (When cap reached)

When founding cap is reached:

**Check logs for:**
- `🔄 Phase transition: paused X campaigns`
- `🔄 Phase transition: activated X campaigns`

**Verify in database:**
```sql
-- Founding campaigns should be paused
SELECT id, name, status, target_phase 
FROM bulk_invite_campaigns 
WHERE target_phase = 'founding';

-- Premium campaign should be active
SELECT id, name, status, target_phase 
FROM bulk_invite_campaigns 
WHERE target_phase = 'premium';
```

**Verification:**
- [ ] Founding campaigns status = 'paused'
- [ ] Premium campaign status = 'active'
- [ ] Send pipeline skips founding invites
- [ ] Premium invites are sent

## Post-Deployment

### Monitoring (First 48 hours)

Monitor these metrics:

1. **Tier Totals**
   ```sql
   SELECT * FROM membership_tier_totals ORDER BY tier;
   ```
   - [ ] Check daily

2. **Campaign Status**
   ```sql
   SELECT target_phase, status, COUNT(*) 
   FROM bulk_invite_campaigns 
   GROUP BY target_phase, status;
   ```
   - [ ] Check after each conversion

3. **Application Logs**
   - [ ] Watch for phase guard logs
   - [ ] Watch for tier increment logs
   - [ ] Check for any errors

4. **Webhook Delivery**
   - [ ] Check Stripe webhook logs
   - [ ] Verify all payments processed
   - [ ] Confirm no failed webhooks

### Alerts Setup

Set up alerts for:
- [ ] Phase guard failures
- [ ] Tier total increment failures
- [ ] Campaign status mismatches
- [ ] Webhook processing errors

### Documentation

- [ ] Update internal wiki/docs with deployment info
- [ ] Share deployment summary with team
- [ ] Document any issues encountered
- [ ] Note production FOUNDING_CAP value

## Rollback Procedure

If issues occur:

### Quick Rollback (Revert Code)
```bash
# Revert to previous version
git revert <commit-hash>
vercel --prod
```

### Full Rollback (Database + Code)
```sql
-- Remove tier totals table
DROP TABLE IF EXISTS membership_tier_totals;

-- Remove campaign columns
ALTER TABLE bulk_invite_campaigns 
DROP COLUMN IF EXISTS target_phase,
DROP COLUMN IF EXISTS is_primary;

-- Drop function
DROP FUNCTION IF EXISTS increment_tier_total(text);
```

Then revert application code.

**See [MIGRATION_NOTES.md](./MIGRATION_NOTES.md) for detailed rollback steps.**

## Troubleshooting

### Issue: Campaign still sending after phase switch
**Solution:** 
```bash
curl https://your-app.com/api/automation/phase-guard
```

### Issue: Tier total not incrementing
**Solution:**
- Check Stripe webhook logs
- Verify price IDs are correct
- Check application logs for errors

### Issue: Phase guard not activating premium campaign
**Solution:**
```sql
-- Check if premium campaign exists
SELECT * FROM bulk_invite_campaigns 
WHERE target_phase = 'premium' AND is_primary = true;

-- Create if missing
INSERT INTO bulk_invite_campaigns (name, target_phase, is_primary, status)
VALUES ('Premium Campaign', 'premium', true, 'draft');
```

## Success Criteria

Deployment is successful when:

- [x] Migration ran without errors
- [x] All environment variables set
- [x] Campaigns tagged correctly
- [x] Phase guard endpoint returns valid data
- [x] First conversion increments tier total
- [x] Phase guard runs automatically after conversion
- [x] When cap reached, campaigns switch automatically
- [x] No errors in logs
- [x] Monitoring in place

## Sign-Off

- [ ] **DevOps Lead:** Database migration verified
- [ ] **Backend Dev:** API endpoints tested
- [ ] **QA:** Integration tests passed
- [ ] **Product:** Campaign setup verified
- [ ] **Security:** Environment variables secured

---

**Deployed By:** _______________  
**Date:** _______________  
**Time:** _______________  
**Notes:** _____________________________________________________
