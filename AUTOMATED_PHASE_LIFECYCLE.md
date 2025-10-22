# Automated Phase Lifecycle System

## Overview

The Circle Network platform now features an **automated phase lifecycle system** that transitions between membership phases (Founding → Premium → Elite) based on real-time conversion tracking, without requiring manual intervention.

## Key Features

- ✅ **Automatic Phase Switching**: System automatically transitions when Founding cap is reached
- ✅ **Tier-Based Tracking**: Accurate conversion counting by membership tier
- ✅ **Campaign Automation**: Auto-pause Founding campaigns and activate Premium campaigns
- ✅ **Idempotent Operations**: All operations safe to run multiple times
- ✅ **Phase-Aware Sending**: Email pipeline respects current phase
- ✅ **Zero Breaking Changes**: All changes are additive and backwards-compatible

## Architecture

### Data Flow

```
1. Payment Success (Stripe Webhook)
   ↓
2. Determine Tier (price ID or amount)
   ↓
3. Increment membership_tier_totals
   ↓
4. Mark invite as converted
   ↓
5. Run Phase Guard
   ↓
6. If cap reached:
   - Pause all active Founding campaigns
   - Activate primary Premium campaign
```

### Database Schema

#### New Table: `membership_tier_totals`
```sql
CREATE TABLE membership_tier_totals (
  tier text PRIMARY KEY,           -- 'founding', 'premium', 'elite'
  total integer NOT NULL DEFAULT 0, -- Cumulative conversion count
  updated_at timestamptz DEFAULT now()
);
```

#### New Columns: `bulk_invite_campaigns`
```sql
ALTER TABLE bulk_invite_campaigns 
ADD COLUMN target_phase text DEFAULT 'founding',  -- Which phase this campaign targets
ADD COLUMN is_primary boolean DEFAULT false;      -- Auto-activate when phase opens
```

### Core Components

#### 1. Phase Guard Module (`lib/phase-guard.js`)

**Functions:**
- `getFoundingCap()` - Returns cap from env (defaults to 100)
- `getCurrentPhase(supabaseAdmin)` - Read-only phase check
- `runPhaseGuard(supabaseAdmin)` - Full phase check with campaign updates
- `incrementTierTotal(supabaseAdmin, tier)` - Increment tier conversion count

**Logic:**
```javascript
if (founding_total >= FOUNDING_CAP) {
  phase = 'premium'
  // Pause: target_phase='founding' AND status='active'
  // Activate: target_phase='premium' AND is_primary=true
} else {
  phase = 'founding'
}
```

#### 2. Stripe Webhook (`app/api/stripe/webhook/route.js`)

**Enhanced `invoice.payment_succeeded` handler:**
1. Determines tier from:
   - Stripe metadata (`invoice.metadata.tier`)
   - Price ID matching (`STRIPE_PRICE_FOUNDING`, etc.)
   - Amount threshold fallback ($2,500 / $4,500 / $10,000)
2. Increments tier total via `incrementTierTotal()`
3. Runs phase guard via `runPhaseGuard()`
4. Continues existing conversion tracking (idempotent)

#### 3. API Endpoints

**`/api/automation/phase-guard`** (GET)
- Manual/internal phase check endpoint
- No authentication required (internal use)
- Returns phase status and actions taken

**`/api/cron/phase-guard`** (GET)
- Scheduled endpoint for Vercel Cron
- Requires `Authorization: Bearer <CRON_SECRET>`
- Same functionality as automation endpoint

**Response Format:**
```json
{
  "success": true,
  "phase": "premium",
  "founders": {
    "total": 100,
    "cap": 100,
    "remaining": 0
  },
  "tierTotals": {
    "founding": 100,
    "premium": 5,
    "elite": 0
  },
  "actions": {
    "pausedCampaignIds": ["campaign-id-1"],
    "pausedCampaigns": [{ "id": "...", "name": "..." }],
    "activatedCampaignIds": ["campaign-id-2"],
    "activatedCampaigns": [{ "id": "...", "name": "..." }]
  },
  "timestamp": "2025-10-22T03:00:00.000Z"
}
```

#### 4. Send Pipeline Integration (`app/api/bulk-invites/track/send/route.js`)

**Phase-aware checks before sending:**
1. Skip if campaign status is `paused`
2. Skip if campaign's `target_phase` doesn't match current phase
3. Continue with existing send logic

## Setup & Configuration

### 1. Run Migration

```bash
# Apply the migration
psql $DATABASE_URL -f supabase/migrations/20251023_automated_phase_lifecycle.sql

# Or via Supabase CLI
npx supabase db push
```

### 2. Configure Environment Variables

Add to `.env`:
```bash
# Phase Management
FOUNDING_CAP=100  # Switch to Premium at 100 founding members

# Stripe Price IDs (TEST mode)
STRIPE_PRICE_FOUNDING=price_test_founding_id
STRIPE_PRICE_PREMIUM=price_test_premium_id
STRIPE_PRICE_ELITE=price_test_elite_id

# Cron Security
CRON_SECRET=your-random-secret-here
```

### 3. Tag Your Campaigns

Update existing campaigns to specify their phase:

```sql
-- Mark main founding campaign
UPDATE bulk_invite_campaigns 
SET target_phase = 'founding', is_primary = true
WHERE name = 'Main Founding Campaign';

-- Create/update premium campaign
INSERT INTO bulk_invite_campaigns (name, target_phase, is_primary, status)
VALUES ('Main Premium Campaign', 'premium', true, 'draft');
```

### 4. Setup Vercel Cron (Optional)

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/phase-guard",
    "schedule": "0 */6 * * *"
  }]
}
```

## Usage

### Manual Phase Check

```bash
curl https://your-app.com/api/automation/phase-guard
```

### Cron Job

```bash
curl -H "Authorization: Bearer your-cron-secret" \
  https://your-app.com/api/cron/phase-guard
```

### Query Current Phase

```javascript
import { getCurrentPhase } from '@/lib/phase-guard';

const phase = await getCurrentPhase(supabaseAdmin);
console.log(`Current phase: ${phase}`); // 'founding' or 'premium'
```

## Testing

### Run Test Suite

```bash
node scripts/test-phase-guard.js
```

### Manual Testing Steps

1. **Verify Migration:**
   ```sql
   SELECT * FROM membership_tier_totals ORDER BY tier;
   -- Should show 3 rows: founding, premium, elite (all 0)
   ```

2. **Verify Campaign Columns:**
   ```sql
   SELECT id, name, target_phase, is_primary, status 
   FROM bulk_invite_campaigns 
   LIMIT 5;
   ```

3. **Test Tier Increment:**
   ```sql
   SELECT increment_tier_total('founding');
   SELECT * FROM membership_tier_totals WHERE tier = 'founding';
   -- total should be 1
   ```

4. **Test Phase Guard:**
   ```bash
   curl https://your-app.com/api/automation/phase-guard
   # Check the response - should show current phase
   ```

5. **Test Webhook Integration:**
   - Use Stripe CLI to send test webhook
   - Verify tier total increments
   - Verify phase guard runs automatically

## Monitoring

### Key Metrics to Track

1. **Tier Totals:**
   ```sql
   SELECT * FROM membership_tier_totals ORDER BY tier;
   ```

2. **Campaign Status by Phase:**
   ```sql
   SELECT target_phase, status, COUNT(*) 
   FROM bulk_invite_campaigns 
   GROUP BY target_phase, status;
   ```

3. **Recent Phase Guard Runs:**
   Check application logs for:
   - `📊 Phase Guard: phase=...`
   - `🔄 Phase transition: paused X campaigns`
   - `🔄 Phase transition: activated X campaigns`

### Alerting

Set up alerts for:
- Phase guard failures (check logs)
- Tier total increments stalling
- Campaign status mismatches

## Troubleshooting

### Campaign Still Sending After Phase Switch

**Check:**
1. Is campaign status `paused`? 
   ```sql
   SELECT status FROM bulk_invite_campaigns WHERE id = 'campaign-id';
   ```
2. Did phase guard run?
   ```bash
   curl https://your-app.com/api/automation/phase-guard
   ```
3. Check logs for errors

**Fix:**
```bash
# Manually run phase guard
curl https://your-app.com/api/automation/phase-guard
```

### Tier Total Not Incrementing

**Check:**
1. Is Stripe webhook receiving events?
2. Are price IDs configured correctly?
3. Check webhook logs

**Fix:**
```sql
-- Manually increment (for backfill)
SELECT increment_tier_total('founding');
```

### Phase Guard Not Activating Premium Campaign

**Check:**
1. Does a Premium campaign exist?
   ```sql
   SELECT * FROM bulk_invite_campaigns 
   WHERE target_phase = 'premium' AND is_primary = true;
   ```
2. Is campaign in correct status?

**Fix:**
```sql
-- Create primary premium campaign if missing
INSERT INTO bulk_invite_campaigns (name, target_phase, is_primary, status)
VALUES ('Premium Campaign', 'premium', true, 'draft');
```

## Rollback

If needed, see [MIGRATION_NOTES.md](./MIGRATION_NOTES.md) for rollback instructions.

Quick rollback:
```sql
-- Remove tier totals table
DROP TABLE IF EXISTS membership_tier_totals;

-- Remove campaign columns (optional)
ALTER TABLE bulk_invite_campaigns 
DROP COLUMN IF EXISTS target_phase,
DROP COLUMN IF EXISTS is_primary;
```

## Future Enhancements

- [ ] Support for Elite phase transition
- [ ] Graduated pricing tiers within phases
- [ ] Phase-specific email templates
- [ ] Admin dashboard for phase management
- [ ] Historical phase transition logs
- [ ] A/B testing different phase caps

## Support

For issues or questions:
1. Check application logs
2. Run manual phase guard: `/api/automation/phase-guard`
3. Verify database state with SQL queries above
4. Review [MIGRATION_NOTES.md](./MIGRATION_NOTES.md)

## Security Considerations

- ✅ Phase guard is idempotent (safe to retry)
- ✅ Tier totals use database-level increment function
- ✅ Cron endpoint requires secret authentication
- ✅ All operations use Supabase admin client
- ✅ No user input in phase determination logic

## Performance

- Minimal overhead: Only runs on conversions and scheduled checks
- Efficient queries: Indexed by tier and campaign phase
- No impact on send pipeline performance
- Database operations: O(1) for tier increments, O(n) for campaign updates
