-- =====================================================
-- Migration: 003_remove_password_storage.sql
-- Description: Removes password storage from admin_accounts table
--              Supabase auth handles all authentication securely
-- Run this in: Supabase Dashboard > SQL Editor
-- Dependencies: 002_admin_accounts_security.sql
-- =====================================================

-- =====================================================
-- Remove Password Hash Column
-- =====================================================

-- Drop the password_hash column from admin_accounts table
-- Supabase auth.users table already handles authentication securely
ALTER TABLE public.admin_accounts
DROP COLUMN IF EXISTS password_hash;

-- =====================================================
-- Remove Password-Related Functions
-- =====================================================

-- Drop password hashing function
DROP FUNCTION IF EXISTS public.hash_admin_password(TEXT);

-- Drop password verification function
DROP FUNCTION IF EXISTS public.verify_admin_password(TEXT, TEXT);

-- =====================================================
-- Notes
-- =====================================================

-- Admin authentication should be handled through Supabase Auth:
-- 1. Create admin users in auth.users table via Supabase Dashboard or Auth API
-- 2. Link admin_accounts.employee_id to auth.users.id or use auth.users.email
-- 3. Use Supabase's built-in authentication methods (JWT, session management)
-- 4. Security questions remain for additional verification/account recovery

-- Recommended approach:
-- - Store auth.users.id as a foreign key in admin_accounts if not already present
-- - Use employee_id as a unique identifier for business logic
-- - Map employee_id to auth.users via email or a separate linking table
