-- Migration: 20260308_onboarding_signup.sql
-- Ensures the profiles table has the columns required for the sign-up flow
-- and that the service role can insert profiles (bypassing RLS).
-- This migration is idempotent.

-- Add full_name column if it doesn't already exist
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Add status column if it doesn't already exist (pending → active after email verify)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';

-- Add onboarding_completed flag if it doesn't already exist
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

-- Add created_at timestamp if it doesn't already exist
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Ensure RLS is enabled on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow the service role to insert new profiles (bypasses RLS by default, but
-- add an explicit policy so it's clear and auditable).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'profiles'
      AND policyname = 'service_role_insert_profiles'
  ) THEN
    CREATE POLICY service_role_insert_profiles
      ON profiles
      FOR INSERT
      TO service_role
      WITH CHECK (true);
  END IF;
END
$$;

-- Allow users to read and update their own profile row
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'profiles'
      AND policyname = 'users_own_profile'
  ) THEN
    CREATE POLICY users_own_profile
      ON profiles
      FOR ALL
      TO authenticated
      USING (id = auth.uid())
      WITH CHECK (id = auth.uid());
  END IF;
END
$$;
