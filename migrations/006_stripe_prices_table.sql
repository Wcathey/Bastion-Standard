-- =====================================================
-- Migration: 006_stripe_prices_table.sql
-- Description: Creates stripe_prices table to sync prices from Stripe
-- Run this in: Supabase Dashboard > SQL Editor
-- Depends on: 005_stripe_products_table.sql
-- Based on: Stripe Price API - https://stripe.com/docs/api/prices
-- =====================================================

-- Create stripe_prices table
-- This stores price information synced from Stripe
CREATE TABLE IF NOT EXISTS public.stripe_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Stripe identifiers
  stripe_price_id TEXT UNIQUE NOT NULL,
  stripe_product_id TEXT NOT NULL,

  -- Foreign key to local products table
  product_id UUID REFERENCES public.stripe_products(id) ON DELETE CASCADE,

  -- Price details
  active BOOLEAN DEFAULT true NOT NULL,
  currency TEXT DEFAULT 'usd' NOT NULL,
  unit_amount BIGINT, -- Amount in cents (null for metered billing)
  unit_amount_decimal TEXT, -- For more precision

  -- Billing details
  type TEXT NOT NULL, -- one_time or recurring
  billing_scheme TEXT, -- per_unit or tiered

  -- Recurring details (if type = recurring)
  recurring_interval TEXT, -- day, week, month, year
  recurring_interval_count INTEGER, -- e.g., 3 for "every 3 months"
  recurring_usage_type TEXT, -- metered or licensed
  recurring_aggregate_usage TEXT, -- sum, last_during_period, last_ever, max

  -- Tiered pricing
  tiers JSONB, -- For tiered pricing structures
  tiers_mode TEXT, -- graduated or volume

  -- Display
  nickname TEXT,
  lookup_key TEXT, -- Custom identifier

  -- Tax behavior
  tax_behavior TEXT, -- unspecified, inclusive, exclusive

  -- Transform quantity (for unit conversions)
  transform_quantity JSONB, -- {divide_by: number, round: up|down}

  -- Metadata
  metadata JSONB,

  -- Stripe timestamps
  created BIGINT, -- Unix timestamp from Stripe

  -- Local timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS stripe_prices_stripe_price_id_idx ON public.stripe_prices(stripe_price_id);
CREATE INDEX IF NOT EXISTS stripe_prices_stripe_product_id_idx ON public.stripe_prices(stripe_product_id);
CREATE INDEX IF NOT EXISTS stripe_prices_product_id_idx ON public.stripe_prices(product_id);
CREATE INDEX IF NOT EXISTS stripe_prices_active_idx ON public.stripe_prices(active);
CREATE INDEX IF NOT EXISTS stripe_prices_lookup_key_idx ON public.stripe_prices(lookup_key);

-- Attach updated_at trigger
DROP TRIGGER IF EXISTS set_updated_at_stripe_prices ON public.stripe_prices;
CREATE TRIGGER set_updated_at_stripe_prices
  BEFORE UPDATE ON public.stripe_prices
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- Notes:
-- - This table syncs with Stripe prices via webhooks
-- - stripe_price_id is the unique identifier from Stripe (e.g., "price_...")
-- - stripe_product_id links to the Stripe product
-- - product_id is the foreign key to our local stripe_products table
-- - unit_amount is in cents (e.g., $10.00 = 1000)
-- - type can be "one_time" for single purchases or "recurring" for subscriptions
-- - Sync via Stripe webhooks: price.created, price.updated, price.deleted
-- - Use lookup_key for easy price references in code
-- =====================================================
