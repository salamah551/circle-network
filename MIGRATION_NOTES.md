# Migration Notes: Automated Phase Lifecycle

## Overview
This migration adds automated phase switching capabilities based on membership tier conversion counts. The system automatically transitions from Founding → Premium → Elite phases without manual intervention.

## Migration File
`supabase/migrations/20251023_automated_phase_lifecycle.sql`

## What's Added

### 1. New Table: `membership_tier_totals`
**Purpose:** Source of truth for tier conversion counts that drive phase switching.

| Column | Type | Description |
|--------|------|-------------|
| tier | text (PK) | Tier name: 'founding', 'premium', 'elite' |
| total | integer | Cumulative count of conversions for this tier |
| updated_at | timestamptz | Last update timestamp |

**Initial Data:**
- founding: 0
- premium: 0
- elite: 0

### 2. New Columns on `bulk_invite_campaigns`

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| target_phase | text | 'founding' | Which phase this campaign targets |
| is_primary | boolean | false | If true, auto-activate when phase opens |

### 3. New Function: `increment_tier_total(p_tier text)`
Helper function for safely incrementing tier counts (idempotent-safe).

## How to Apply

### Development/Staging
```sql
-- Connect to your Supabase database
psql $DATABASE_URL

-- Run the migration
\i supabase/migrations/20251023_automated_phase_lifecycle.sql

-- Verify tables and columns
SELECT * FROM membership_tier_totals;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'bulk_invite_campaigns' 
AND column_name IN ('target_phase', 'is_primary');
```

### Production (Supabase Dashboard)
1. Navigate to SQL Editor
2. Copy contents of `20251023_automated_phase_lifecycle.sql`
3. Execute the migration
4. Run verification queries (included at bottom of migration file)

### Vercel/Automated Deployment
If using Supabase CLI with Vercel:
```bash
npx supabase db push
```

## Rollback Instructions

If you need to rollback this migration:

```sql
-- 1. Drop the helper function
DROP FUNCTION IF EXISTS increment_tier_total(text);

-- 2. Drop the tier totals table
DROP TABLE IF EXISTS public.membership_tier_totals;

-- 3. Remove campaign columns (optional - they're harmless if left)
ALTER TABLE public.bulk_invite_campaigns 
DROP COLUMN IF EXISTS target_phase;

ALTER TABLE public.bulk_invite_campaigns 
DROP COLUMN IF EXISTS is_primary;

-- 4. Drop indexes
DROP INDEX IF EXISTS ix_membership_tier_totals_updated_at;
DROP INDEX IF EXISTS ix_bulk_invite_campaigns_target_phase;
DROP INDEX IF EXISTS ix_bulk_invite_campaigns_primary;
```

## Environment Variables

Update your `.env` file with these new variables:

```bash
# Phase Management
FOUNDING_CAP=100  # Number of founding members before phase switch

# Stripe Price IDs (TEST mode for development)
STRIPE_PRICE_FOUNDING=price_test_founding_id
STRIPE_PRICE_PREMIUM=price_test_premium_id
STRIPE_PRICE_ELITE=price_test_elite_id

# Cron Security
CRON_SECRET=your-random-secret-here
```

## Testing the Migration

### 1. Verify Table Creation
```sql
SELECT * FROM membership_tier_totals ORDER BY tier;
```
Expected: 3 rows (founding, premium, elite) with total = 0

### 2. Verify Campaign Columns
```sql
SELECT id, name, target_phase, is_primary, status 
FROM bulk_invite_campaigns 
ORDER BY created_at DESC 
LIMIT 5;
```
Expected: All existing campaigns should have `target_phase = 'founding'` and `is_primary = false`

### 3. Test Tier Increment Function
```sql
SELECT increment_tier_total('founding');
SELECT * FROM membership_tier_totals WHERE tier = 'founding';
```
Expected: `total` should be 1

### 4. Test Idempotency
Run the migration SQL file again - should complete without errors (all `IF NOT EXISTS` clauses).

## Post-Migration Setup

### 1. Tag Your Campaigns
Update existing campaigns to specify their target phase:

```sql
-- Mark your main founding campaign as primary
UPDATE bulk_invite_campaigns 
SET target_phase = 'founding', is_primary = true
WHERE name = 'Your Main Founding Campaign';

-- Create/update premium campaigns
UPDATE bulk_invite_campaigns 
SET target_phase = 'premium', is_primary = true
WHERE name = 'Your Main Premium Campaign';
```

### 2. Configure Stripe Price IDs
In your Stripe Dashboard (TEST mode):
1. Create test price IDs for each tier
2. Add metadata: `tier: founding` / `tier: premium` / `tier: elite`
3. Update your `.env` file with the price IDs

### 3. Deploy API Endpoints
The following endpoints are added by this PR:
- `/api/automation/phase-guard` - Manual/internal phase check
- `/api/cron/phase-guard` - Scheduled phase check (requires CRON_SECRET)

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

## Data Flow

### Conversion Flow
1. Stripe webhook receives `invoice.payment_succeeded`
2. Webhook determines tier from price ID or amount
3. Webhook calls `increment_tier_total(tier)`
4. Webhook marks invite as converted (existing logic)
5. Webhook calls phase guard to check if transition needed
6. Phase guard pauses Founding campaigns / activates Premium if cap reached

### Phase Guard Logic
```
if (founding_total >= FOUNDING_CAP):
  - Pause all campaigns where target_phase='founding' AND status='active'
  - Activate campaign where target_phase='premium' AND is_primary=true
  - Return phase='premium'
else:
  - Return phase='founding'
```

## Safety Features

- **Idempotent:** All operations can run multiple times safely
- **Additive:** No existing data or features are removed
- **Backwards Compatible:** Existing campaigns continue to work
- **Default Values:** All new columns have sensible defaults
- **Constraints:** Unique constraints prevent duplicate tier totals

## Support

If you encounter issues:
1. Check the verification queries in the migration file
2. Review Supabase logs for errors
3. Ensure all environment variables are set
4. Test the phase guard endpoint manually

## Breaking Changes
**None.** This migration is fully backwards-compatible.
