-- =====================================================
-- Migration: 002_invoices_table.sql
-- Description: Creates invoices table for Stripe billing
-- Run this in: Supabase Dashboard > SQL Editor
-- =====================================================

-- Create invoices table
-- This stores invoice information from Stripe
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Stripe identifiers
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT,

  -- Invoice details
  amount_due BIGINT NOT NULL, -- Amount in cents
  amount_paid BIGINT, -- Amount in cents
  amount_remaining BIGINT, -- Amount in cents
  currency TEXT DEFAULT 'usd' NOT NULL,

  -- Status and dates
  status TEXT NOT NULL, -- draft, open, paid, uncollectible, void
  invoice_number TEXT,
  hosted_invoice_url TEXT,
  invoice_pdf TEXT,

  -- Dates
  created TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,

  -- Billing details
  billing_reason TEXT, -- subscription_create, subscription_cycle, manual, etc.
  description TEXT,

  -- Metadata
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS invoices_stripe_invoice_id_idx ON public.invoices(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS invoices_stripe_customer_id_idx ON public.invoices(stripe_customer_id);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON public.invoices(status);
CREATE INDEX IF NOT EXISTS invoices_created_idx ON public.invoices(created);

-- Attach updated_at trigger
DROP TRIGGER IF EXISTS set_updated_at_invoices ON public.invoices;
CREATE TRIGGER set_updated_at_invoices
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- Notes:
-- - This table syncs with Stripe invoices via webhooks
-- - Amount fields are in cents (e.g., $10.00 = 1000)
-- - stripe_customer_id links to accounts.customer_id
-- - Use Stripe API or webhooks to populate this table
-- =====================================================
