-- =====================================================
-- Migration: 005_stripe_products_table.sql
-- Description: Creates stripe_products table to sync products from Stripe
-- Run this in: Supabase Dashboard > SQL Editor
-- Based on: Stripe Product API - https://stripe.com/docs/api/products
-- =====================================================

-- Create stripe_products table
-- This stores product information synced from Stripe
CREATE TABLE IF NOT EXISTS public.stripe_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Stripe identifiers
  stripe_product_id TEXT UNIQUE NOT NULL,

  -- Product details
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true NOT NULL,

  -- Product attributes
  type TEXT, -- good, service
  unit_label TEXT, -- e.g., "per seat", "per user"

  -- Media
  images TEXT[], -- Array of image URLs

  -- Organization
  metadata JSONB,

  -- SEO and display
  statement_descriptor TEXT,
  url TEXT, -- Product URL

  -- Physical product attributes (optional)
  shippable BOOLEAN,
  package_dimensions JSONB, -- {height, length, width, weight}

  -- Tax information
  tax_code TEXT,

  -- Stripe timestamps
  created BIGINT, -- Unix timestamp from Stripe
  updated BIGINT, -- Unix timestamp from Stripe

  -- Local timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS stripe_products_stripe_product_id_idx ON public.stripe_products(stripe_product_id);
CREATE INDEX IF NOT EXISTS stripe_products_active_idx ON public.stripe_products(active);
CREATE INDEX IF NOT EXISTS stripe_products_name_idx ON public.stripe_products(name);

-- Attach updated_at trigger
DROP TRIGGER IF EXISTS set_updated_at_stripe_products ON public.stripe_products;
CREATE TRIGGER set_updated_at_stripe_products
  BEFORE UPDATE ON public.stripe_products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- Notes:
-- - This table syncs with Stripe products via webhooks
-- - stripe_product_id is the unique identifier from Stripe (e.g., "prod_...")
-- - Use active = true to show products on the storefront
-- - images array stores URLs to product images
-- - metadata can store custom key-value pairs
-- - Sync via Stripe webhooks: product.created, product.updated, product.deleted
-- =====================================================
