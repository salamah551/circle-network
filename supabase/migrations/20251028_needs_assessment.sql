-- ============================================================================
-- Needs Assessment Migration
-- ============================================================================
-- This migration adds a needs_assessment JSONB column to profiles table
-- to store personalized onboarding quiz responses for new members
-- ============================================================================

-- Add needs_assessment column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS needs_assessment JSONB DEFAULT NULL;

-- Add needs_assessment_completed_at timestamp
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS needs_assessment_completed_at TIMESTAMPTZ DEFAULT NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS ix_profiles_needs_assessment_completed 
ON public.profiles (needs_assessment_completed_at) 
WHERE needs_assessment_completed_at IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN profiles.needs_assessment IS 
  'Stores personalized onboarding quiz responses including industry, goals, travel profile, and motivation';

COMMENT ON COLUMN profiles.needs_assessment_completed_at IS 
  'Timestamp when the member completed the needs assessment quiz';
