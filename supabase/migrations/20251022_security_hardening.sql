-- ============================================================================
-- Security Hardening and Reliability Migration
-- ============================================================================
-- This migration adds database constraints, indexes, and idempotency tables
-- to improve reliability, analytics integrity, and inbox placement.
-- All changes are additive and backwards-compatible.
-- ============================================================================

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
COMMENT ON TABLE stripe_events IS 
  'Idempotency table for Stripe webhook events to prevent duplicate processing';

-- ============================================================================
-- VERIFICATION QUERIES (For testing purposes)
-- ============================================================================
-- Run these to verify the migration was successful:

-- Check stripe_events table exists
-- SELECT table_name, column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'stripe_events'
-- ORDER BY ordinal_position;
