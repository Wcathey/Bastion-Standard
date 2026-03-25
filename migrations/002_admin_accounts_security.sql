-- =====================================================
-- Migration: 002_admin_accounts_security.sql
-- Description: Creates admin accounts system with enhanced security
-- Run this in: Supabase Dashboard > SQL Editor
-- Dependencies: 001_initial_schema.sql
-- =====================================================

-- =====================================================
-- Security Questions Table
-- =====================================================

-- Create security questions table with predefined questions
CREATE TABLE IF NOT EXISTS public.security_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_text TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed security questions (10+ options)
INSERT INTO public.security_questions (question_text) VALUES
  ('What was the name of your first pet?'),
  ('What city were you born in?'),
  ('What is your mother''s maiden name?'),
  ('What was the name of your first school?'),
  ('What is your favorite book?'),
  ('What was your childhood nickname?'),
  ('What is the name of the street you grew up on?'),
  ('What was your first car make and model?'),
  ('What is your favorite movie?'),
  ('What was the name of your first employer?'),
  ('What is your favorite food?'),
  ('What was your high school mascot?')
ON CONFLICT (question_text) DO NOTHING;

-- =====================================================
-- Admin Accounts Table
-- =====================================================

-- Create enum for employee positions
DO $$ BEGIN
  CREATE TYPE employee_position AS ENUM (
    'owner',
    'manager',
    'sales_associate',
    'inventory_specialist',
    'customer_service',
    'marketing',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create admin_accounts table
CREATE TABLE IF NOT EXISTS public.admin_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL UNIQUE,

  -- Authentication
  password_hash TEXT,
  has_logged_in BOOLEAN DEFAULT false NOT NULL,

  -- Security Questions (encrypted JSONB)
  -- Format: [{"question_id": "uuid", "answer_hash": "hashed_answer"}, ...]
  security_answers JSONB,

  -- Employee Information
  first_name TEXT,
  last_name TEXT,
  position employee_position,
  email TEXT UNIQUE,
  phone TEXT,
  phone_extension TEXT,

  -- Account Status
  is_active BOOLEAN DEFAULT true NOT NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS admin_accounts_employee_id_idx ON public.admin_accounts(employee_id);
CREATE INDEX IF NOT EXISTS admin_accounts_email_idx ON public.admin_accounts(email);
CREATE INDEX IF NOT EXISTS admin_accounts_is_active_idx ON public.admin_accounts(is_active);

-- Attach updated_at trigger to admin_accounts table
DROP TRIGGER IF EXISTS set_updated_at ON public.admin_accounts;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.admin_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- Admin Session Tokens Table
-- For tracking active admin sessions
-- =====================================================

CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_account_id UUID REFERENCES public.admin_accounts(id) ON DELETE CASCADE NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS admin_sessions_token_idx ON public.admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS admin_sessions_admin_id_idx ON public.admin_sessions(admin_account_id);
CREATE INDEX IF NOT EXISTS admin_sessions_expires_idx ON public.admin_sessions(expires_at);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on security_questions
ALTER TABLE public.security_questions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active security questions (for selection during setup)
CREATE POLICY "Active security questions are viewable by all"
  ON public.security_questions
  FOR SELECT
  USING (is_active = true);

-- Enable RLS on admin_accounts
ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything (for API endpoints)
CREATE POLICY "Service role has full access to admin_accounts"
  ON public.admin_accounts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Enable RLS on admin_sessions
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can manage sessions
CREATE POLICY "Service role has full access to admin_sessions"
  ON public.admin_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to generate unique employee ID
CREATE OR REPLACE FUNCTION public.generate_employee_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  id_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate format: EMP-YYYYMMDD-XXXX (e.g., EMP-20260323-A1B2)
    new_id := 'EMP-' ||
              TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
              UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));

    -- Check if ID already exists
    SELECT EXISTS(
      SELECT 1 FROM public.admin_accounts WHERE employee_id = new_id
    ) INTO id_exists;

    EXIT WHEN NOT id_exists;
  END LOOP;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired admin sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_admin_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.admin_sessions
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to hash security answers (using pgcrypto extension)
-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.hash_security_answer(answer TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Normalize answer: lowercase, trim whitespace
  RETURN crypt(LOWER(TRIM(answer)), gen_salt('bf', 8));
END;
$$ LANGUAGE plpgsql;

-- Function to verify security answer
CREATE OR REPLACE FUNCTION public.verify_security_answer(answer TEXT, hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN hash = crypt(LOWER(TRIM(answer)), hash);
END;
$$ LANGUAGE plpgsql;

-- Function to hash admin password
CREATE OR REPLACE FUNCTION public.hash_admin_password(p_password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(p_password, gen_salt('bf', 10));
END;
$$ LANGUAGE plpgsql;

-- Function to verify admin password
CREATE OR REPLACE FUNCTION public.verify_admin_password(p_employee_id TEXT, p_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  SELECT password_hash INTO stored_hash
  FROM public.admin_accounts
  WHERE employee_id = p_employee_id
  AND is_active = true;

  IF stored_hash IS NULL THEN
    RETURN false;
  END IF;

  RETURN stored_hash = crypt(p_password, stored_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Example: Create First Admin Account
-- =====================================================

-- Uncomment and modify to create your first admin account:
-- INSERT INTO public.admin_accounts (
--   employee_id,
--   first_name,
--   last_name,
--   position,
--   email,
--   is_active
-- ) VALUES (
--   public.generate_employee_id(),
--   'John',
--   'Doe',
--   'owner',
--   'owner@bastionstandard.com',
--   true
-- );

-- To retrieve the generated employee_id:
-- SELECT employee_id, first_name, last_name, email
-- FROM public.admin_accounts
-- WHERE email = 'owner@bastionstandard.com';

-- =====================================================
-- Notes
-- =====================================================

-- Security Answer Storage Format (JSONB):
-- [
--   {
--     "question_id": "uuid-of-question",
--     "answer_hash": "bcrypt-hashed-answer"
--   },
--   {
--     "question_id": "uuid-of-question-2",
--     "answer_hash": "bcrypt-hashed-answer-2"
--   },
--   ...
-- ]

-- Password hashing is handled by Next.js API routes using bcrypt
-- Security answers are hashed using PostgreSQL's crypt() function with bcrypt

-- Employee ID Format: EMP-YYYYMMDD-XXXX
-- Example: EMP-20260323-A1B2
