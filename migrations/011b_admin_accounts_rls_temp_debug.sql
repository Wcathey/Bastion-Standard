-- =====================================================
-- Migration: 011b_admin_accounts_rls_temp_debug.sql
-- Description: TEMPORARY - Allows all authenticated users to view admin_accounts for debugging
-- Run this in: Supabase Dashboard > SQL Editor
-- IMPORTANT: This is for debugging only - remove after testing
-- =====================================================

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Authenticated users can check their own admin account" ON public.admin_accounts;
DROP POLICY IF EXISTS "Admins can view all admin accounts" ON public.admin_accounts;

-- Create temporary wide-open SELECT policy for debugging
CREATE POLICY "TEMP - All authenticated users can view admin accounts"
  ON public.admin_accounts
  FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- Notes:
-- - This policy allows ANY authenticated user to view ALL admin accounts
-- - This is ONLY for debugging - use it to confirm RLS is the issue
-- - Once you confirm login works, remove this policy and use the proper one
-- - To remove: DROP POLICY "TEMP - All authenticated users can view admin accounts" ON public.admin_accounts;
-- - Then re-run the proper policy from 011_admin_accounts_rls_policies.sql
-- =====================================================
