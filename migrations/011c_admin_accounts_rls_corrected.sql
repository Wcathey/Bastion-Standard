-- =====================================================
-- Migration: 011c_admin_accounts_rls_corrected.sql
-- Description: Corrected RLS policies for admin_accounts table
-- Run this in: Supabase Dashboard > SQL Editor
-- Run AFTER removing the temporary debug policy
-- =====================================================

-- First, drop the temporary debug policy
DROP POLICY IF EXISTS "TEMP - All authenticated users can view admin accounts" ON public.admin_accounts;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Authenticated users can check their own admin account" ON public.admin_accounts;
DROP POLICY IF EXISTS "Admins can view all admin accounts" ON public.admin_accounts;
DROP POLICY IF EXISTS "Admins can create admin accounts" ON public.admin_accounts;
DROP POLICY IF EXISTS "Admins can update their own account" ON public.admin_accounts;
DROP POLICY IF EXISTS "Admins can update all admin accounts" ON public.admin_accounts;
DROP POLICY IF EXISTS "Admins can delete admin accounts" ON public.admin_accounts;

-- =====================================================
-- SELECT Policy - Critical for Login
-- =====================================================

-- Policy: Allow authenticated users to view their own admin account
-- This checks if the logged-in user's ID matches the user_id column
CREATE POLICY "Users can view their own admin account"
  ON public.admin_accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- UPDATE Policy
-- =====================================================

-- Policy: Admins can update their own account
-- This allows admins to update their has_logged_in flag and other info
CREATE POLICY "Admins can update their own account"
  ON public.admin_accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- INSERT Policy
-- =====================================================

-- Policy: Service role can insert (admins created via Supabase dashboard or API)
-- Note: Regular users cannot create admin accounts
-- Admins must be created via service_role or by existing admins through a special endpoint
CREATE POLICY "Service role can insert admin accounts"
  ON public.admin_accounts
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- =====================================================
-- DELETE Policy
-- =====================================================

-- Policy: Service role can delete (admin removal via Supabase dashboard or API)
CREATE POLICY "Service role can delete admin accounts"
  ON public.admin_accounts
  FOR DELETE
  TO service_role
  USING (true);

-- =====================================================
-- Notes:
-- - The SELECT policy uses auth.uid() = user_id to allow users to check if they're an admin
-- - UPDATE policy allows admins to update their own account (needed for has_logged_in flag)
-- - INSERT/DELETE are restricted to service_role only for security
-- - To create new admins, use Supabase dashboard or create a server-side API route
-- - This prevents privilege escalation attacks
-- =====================================================
