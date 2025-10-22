-- ============================================================================
-- Security Hardening and Reliability Migration
-- ============================================================================
-- This migration adds database constraints, indexes, and idempotency tables
-- to improve reliability, analytics integrity, and inbox placement.
-- All changes are additive and backwards-compatible.
-- ============================================================================

-- ============================================================================
-- A) DATABASE CONSTRAINTS AND INDEXES
-- ============================================================================

-- A1) Unique email per campaign (case-insensitive)
-- Prevents duplicate invites within the same campaign
CREATE UNIQUE INDEX IF NOT EXISTS ux_bulk_invites_campaign_email 
ON public.bulk_invites (campaign_id, lower(email));

-- A1) One event per invite per type
-- Prevents duplicate event recording for better analytics integrity
CREATE UNIQUE INDEX IF NOT EXISTS ux_bulk_invite_events_one_per_type 
ON public.bulk_invite_events (invite_id, event);

-- A1) Lookup indexes for better query performance
CREATE INDEX IF NOT EXISTS ix_bulk_invites_campaign 
ON public.bulk_invites (campaign_id);

CREATE INDEX IF NOT EXISTS ix_bulk_invites_email_lower 
ON public.bulk_invites (lower(email));

CREATE INDEX IF NOT EXISTS ix_bulk_invite_events_invite_event 
ON public.bulk_invite_events (invite_id, event);

-- A1) Suppressions unique (case-insensitive)
-- Ensures email addresses are only suppressed once
CREATE UNIQUE INDEX IF NOT EXISTS ux_bulk_invite_suppressions_email 
ON public.bulk_invite_suppressions (lower(email));

-- A2) Foreign key constraints (if not present)
-- Add foreign key from bulk_invites.campaign_id to bulk_invite_campaigns.id
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_bulk_invites_campaign_id'
  ) THEN
    ALTER TABLE public.bulk_invites 
    ADD CONSTRAINT fk_bulk_invites_campaign_id 
    FOREIGN KEY (campaign_id) 
    REFERENCES public.bulk_invite_campaigns(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key from bulk_invite_events.invite_id to bulk_invites.id
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_bulk_invite_events_invite_id'
  ) THEN
    ALTER TABLE public.bulk_invite_events 
    ADD CONSTRAINT fk_bulk_invite_events_invite_id 
    FOREIGN KEY (invite_id) 
    REFERENCES public.bulk_invites(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- A3) STRIPE WEBHOOK IDEMPOTENCY TABLE
-- ============================================================================
-- This table prevents duplicate processing of Stripe webhook events
-- by storing event IDs that have already been handled.
CREATE TABLE IF NOT EXISTS public.stripe_events (
  event_id text PRIMARY KEY,
  received_at timestamptz DEFAULT now()
);

-- Add index for cleanup queries (optional but recommended)
CREATE INDEX IF NOT EXISTS ix_stripe_events_received_at 
ON public.stripe_events (received_at);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON INDEX ux_bulk_invites_campaign_email IS 
  'Ensures unique email addresses per campaign (case-insensitive)';

COMMENT ON INDEX ux_bulk_invite_events_one_per_type IS 
  'Prevents duplicate event recording - one event per invite per type';

COMMENT ON INDEX ux_bulk_invite_suppressions_email IS 
  'Ensures email addresses are only suppressed once (case-insensitive)';

COMMENT ON TABLE stripe_events IS 
  'Idempotency table for Stripe webhook events to prevent duplicate processing';

COMMENT ON CONSTRAINT fk_bulk_invites_campaign_id ON bulk_invites IS 
  'CASCADE deletes invites when campaign is deleted';

COMMENT ON CONSTRAINT fk_bulk_invite_events_invite_id ON bulk_invite_events IS 
  'CASCADE deletes events when invite is deleted';

-- ============================================================================
-- VERIFICATION QUERIES (For testing purposes)
-- ============================================================================
-- Run these to verify the migration was successful:

-- Check indexes were created
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename IN ('bulk_invites', 'bulk_invite_events', 'bulk_invite_suppressions', 'stripe_events')
-- ORDER BY tablename, indexname;

-- Check foreign key constraints
-- SELECT conname, conrelid::regclass, confrelid::regclass, confdeltype
-- FROM pg_constraint
-- WHERE conname IN ('fk_bulk_invites_campaign_id', 'fk_bulk_invite_events_invite_id');

-- Check stripe_events table exists
-- SELECT table_name, column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'stripe_events'
-- ORDER BY ordinal_position;
