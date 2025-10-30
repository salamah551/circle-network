-- ============================================================================
-- ARC Request Attachments Migration
-- ============================================================================
-- This migration adds support for file attachments to ARC requests
-- Includes arc_request_attachments table, RLS policies, and type column
-- ============================================================================

-- Add 'type' column to arc_requests if it doesn't exist
-- Allowed types: 'brief', 'travel', 'intel'
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'arc_requests' AND column_name = 'type'
  ) THEN
    ALTER TABLE public.arc_requests 
    ADD COLUMN type text NOT NULL DEFAULT 'brief' 
    CHECK (type IN ('brief', 'travel', 'intel'));
  END IF;
END $$;

-- Create arc_request_attachments table
CREATE TABLE IF NOT EXISTS public.arc_request_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.arc_requests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_size bigint NOT NULL, -- in bytes
  file_type text NOT NULL, -- MIME type
  storage_path text NOT NULL, -- path in Supabase Storage
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS ix_arc_request_attachments_request_id 
ON public.arc_request_attachments (request_id);

CREATE INDEX IF NOT EXISTS ix_arc_request_attachments_user_id 
ON public.arc_request_attachments (user_id);

-- Enable RLS
ALTER TABLE public.arc_request_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only read/insert their own attachments
CREATE POLICY "Users can view their own attachments"
ON public.arc_request_attachments
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attachments"
ON public.arc_request_attachments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at on arc_request_attachments
DROP TRIGGER IF EXISTS tr_arc_request_attachments_updated_at ON public.arc_request_attachments;
CREATE TRIGGER tr_arc_request_attachments_updated_at
BEFORE UPDATE ON public.arc_request_attachments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- STORAGE BUCKET SETUP (Manual step required)
-- ============================================================================
-- After running this migration, create a Supabase Storage bucket:
--
-- 1. Go to Supabase Dashboard > Storage
-- 2. Create a new bucket named: arc-uploads
-- 3. Set bucket to PRIVATE (not public)
-- 4. Add RLS policies for the bucket:
--
--    Policy 1: "Users can upload their own files"
--      Operation: INSERT
--      Policy: bucket_id = 'arc-uploads' AND auth.uid()::text = (storage.foldername(name))[1]
--
--    Policy 2: "Users can read their own files"
--      Operation: SELECT
--      Policy: bucket_id = 'arc-uploads' AND auth.uid()::text = (storage.foldername(name))[1]
--
-- File structure in bucket: {user_id}/{request_id}/{filename}
-- ============================================================================
