-- ============================================================================
-- Automated Phase Lifecycle Migration
-- ============================================================================
-- This migration adds tier-based conversion tracking and phase-aware campaign
-- management to enable automatic switching from Founding → Premium → Elite.
-- All changes are additive and backwards-compatible.
-- ============================================================================

-- ============================================================================
-- 1) MEMBERSHIP TIER TOTALS TABLE
-- ============================================================================
-- Tracks cumulative conversion counts by membership tier
-- This is the source of truth for phase determination
CREATE TABLE IF NOT EXISTS public.membership_tier_totals (
  tier text PRIMARY KEY,
  total integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Initialize default tiers
INSERT INTO public.membership_tier_totals (tier, total, updated_at)
VALUES 
  ('founding', 0, now()),
  ('premium', 0, now()),
  ('elite', 0, now())
ON CONFLICT (tier) DO NOTHING;

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS ix_membership_tier_totals_updated_at 
ON public.membership_tier_totals (updated_at);

COMMENT ON TABLE membership_tier_totals IS 
  'Source of truth for tier conversion counts - drives phase switching logic';

-- ============================================================================
-- 2) CAMPAIGN PHASE TARGETING COLUMNS
-- ============================================================================
-- Add target_phase to identify which phase a campaign belongs to
-- Add is_primary to mark the main campaign to activate when a phase opens
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bulk_invite_campaigns' 
    AND column_name = 'target_phase'
  ) THEN
    ALTER TABLE public.bulk_invite_campaigns 
    ADD COLUMN target_phase text DEFAULT 'founding';
    
    COMMENT ON COLUMN bulk_invite_campaigns.target_phase IS 
      'Phase this campaign targets: founding, premium, elite';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bulk_invite_campaigns' 
    AND column_name = 'is_primary'
  ) THEN
    ALTER TABLE public.bulk_invite_campaigns 
    ADD COLUMN is_primary boolean DEFAULT false;
    
    COMMENT ON COLUMN bulk_invite_campaigns.is_primary IS 
      'True if this is the primary campaign to activate when phase opens';
  END IF;
END $$;

-- Create index for efficient phase-based campaign queries
CREATE INDEX IF NOT EXISTS ix_bulk_invite_campaigns_target_phase 
ON public.bulk_invite_campaigns (target_phase);

CREATE INDEX IF NOT EXISTS ix_bulk_invite_campaigns_primary 
ON public.bulk_invite_campaigns (is_primary) WHERE is_primary = true;

-- ============================================================================
-- 3) HELPER FUNCTION: UPDATE TIER TOTAL (IDEMPOTENT)
-- ============================================================================
-- Increments tier total safely - can be called multiple times for same conversion
CREATE OR REPLACE FUNCTION increment_tier_total(p_tier text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.membership_tier_totals (tier, total, updated_at)
  VALUES (p_tier, 1, now())
  ON CONFLICT (tier) 
  DO UPDATE SET 
    total = membership_tier_totals.total + 1,
    updated_at = now();
END;
$$;

COMMENT ON FUNCTION increment_tier_total IS 
  'Safely increments tier conversion count (idempotent-safe)';

-- ============================================================================
-- VERIFICATION QUERIES (For testing purposes)
-- ============================================================================
-- Run these to verify the migration was successful:

-- Check membership_tier_totals table
-- SELECT * FROM membership_tier_totals ORDER BY tier;

-- Check new campaign columns exist
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'bulk_invite_campaigns'
-- AND column_name IN ('target_phase', 'is_primary');

-- Check indexes were created
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename IN ('membership_tier_totals', 'bulk_invite_campaigns')
-- AND indexname LIKE '%phase%' OR indexname LIKE '%tier%'
-- ORDER BY tablename, indexname;
