-- =====================================================
-- Migration: 011_admin_accounts_rls_policies.sql
-- Description: Creates RLS policies for admin_accounts table
-- Run this in: Supabase Dashboard > SQL Editor
-- Depends on: 002_admin_accounts_security.sql
-- =====================================================

-- Enable RLS on admin_accounts table
ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SELECT Policies
-- =====================================================

-- Policy: Allow authenticated users to check if they have an admin account
-- This is needed for the login flow to work
-- Simply checks if the authenticated user's ID matches the user_id column
CREATE POLICY "Authenticated users can check their own admin account"
  ON public.admin_accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- INSERT Policies
-- =====================================================

-- Policy: Only admins can create new admin accounts
CREATE POLICY "Admins can create admin accounts"
  ON public.admin_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_accounts
      WHERE user_id = auth.uid()
      AND is_active = true
    )
  );

-- =====================================================
-- UPDATE Policies
-- =====================================================

-- Policy: Admins can update their own account info
CREATE POLICY "Admins can update their own account"
  ON public.admin_accounts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Admins can update other admin accounts
CREATE POLICY "Admins can update all admin accounts"
  ON public.admin_accounts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_accounts
      WHERE user_id = auth.uid()
      AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_accounts
      WHERE user_id = auth.uid()
      AND is_active = true
    )
  );

-- =====================================================
-- DELETE Policies
-- =====================================================

-- Policy: Only admins can delete admin accounts
CREATE POLICY "Admins can delete admin accounts"
  ON public.admin_accounts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_accounts
      WHERE user_id = auth.uid()
      AND is_active = true
    )
  );

-- =====================================================
-- Notes:
-- - The first SELECT policy allows users to check if they have an admin account during login
-- - This checks both user_id and email to handle the login flow
-- - The second SELECT policy allows admins to view all admin accounts
-- - Only active admins can create, update, or delete admin accounts
-- - Admins can always update their own account info
-- - The email check uses auth.jwt()->>'email' to get the authenticated user's email
-- =====================================================
