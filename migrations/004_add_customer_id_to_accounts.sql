-- =====================================================
-- Migration: 004_add_customer_id_to_accounts.sql
-- Description: Adds customer_id column to accounts table for Stripe integration
-- Run this in: Supabase Dashboard > SQL Editor
-- Depends on: 001_initial_schema.sql
-- =====================================================

-- Add customer_id column to accounts table
-- This will store the Stripe customer ID for each account
ALTER TABLE public.accounts
ADD COLUMN IF NOT EXISTS customer_id TEXT UNIQUE;

-- Create index for faster Stripe customer lookups
CREATE INDEX IF NOT EXISTS accounts_customer_id_idx ON public.accounts(customer_id);

-- =====================================================
-- Notes:
-- - customer_id will be populated when user first checks out via Stripe
-- - This links the local account to the Stripe customer record
-- - Can be NULL for accounts that haven't made a purchase yet
-- - UNIQUE constraint ensures one-to-one mapping with Stripe customers
-- =====================================================
