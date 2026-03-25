-- =====================================================
-- Migration: 001_initial_schema.sql
-- Description: Creates initial database schema for user accounts
-- Run this in: Supabase Dashboard > SQL Editor
-- =====================================================

-- Create enum for user types
DO $$ BEGIN
  CREATE TYPE user_type AS ENUM ('customer', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create accounts table
-- This extends the auth.users table with additional profile information
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_type user_type DEFAULT 'customer' NOT NULL,

  -- Profile information
  first_name TEXT,
  last_name TEXT,
  phone TEXT,

  -- Billing information (encrypted at rest by Supabase)
  billing_address_line1 TEXT,
  billing_address_line2 TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_postal_code TEXT,
  billing_country TEXT DEFAULT 'US',

  -- Shipping information
  shipping_address_line1 TEXT,
  shipping_address_line2 TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT DEFAULT 'US',

  -- Flags
  use_billing_as_shipping BOOLEAN DEFAULT true,
  profile_completed BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS accounts_user_type_idx ON public.accounts(user_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to accounts table
DROP TRIGGER IF EXISTS set_updated_at ON public.accounts;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- Trigger Function: Auto-create account on signup
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.accounts (user_id, email_verified, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email_confirmed_at IS NOT NULL,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users (runs after user signup)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- Optional: Create first admin user
-- =====================================================

-- After running this migration, you can manually set a user as admin:
-- UPDATE public.accounts
-- SET user_type = 'admin'
-- WHERE user_id = 'YOUR_USER_UUID_HERE';

-- Or run this comment to promote a user by email:
-- UPDATE public.accounts
-- SET user_type = 'admin'
-- WHERE user_id = (
--   SELECT id FROM auth.users WHERE email = 'admin@example.com'
-- );
