-- =====================================================
-- Migration: 003_orders_table.sql
-- Description: Creates orders table to track customer orders
-- Run this in: Supabase Dashboard > SQL Editor
-- Depends on: 001_initial_schema.sql, 002_invoices_table.sql
-- =====================================================

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Foreign keys
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,

  -- Order tracking
  ordered_on TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  shipped_on TIMESTAMP WITH TIME ZONE,
  delivered_on TIMESTAMP WITH TIME ZONE,

  -- Product availability flag
  product_available BOOLEAN DEFAULT true NOT NULL,

  -- Order details
  order_number TEXT UNIQUE,
  total_amount BIGINT, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending' NOT NULL, -- pending, processing, shipped, delivered, cancelled

  -- Shipping information (snapshot at time of order)
  shipping_address_line1 TEXT,
  shipping_address_line2 TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT,

  -- Tracking information
  tracking_number TEXT,
  carrier TEXT,

  -- Metadata
  metadata JSONB,
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS orders_account_id_idx ON public.orders(account_id);
CREATE INDEX IF NOT EXISTS orders_invoice_id_idx ON public.orders(invoice_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(status);
CREATE INDEX IF NOT EXISTS orders_ordered_on_idx ON public.orders(ordered_on);
CREATE INDEX IF NOT EXISTS orders_order_number_idx ON public.orders(order_number);

-- Attach updated_at trigger
DROP TRIGGER IF EXISTS set_updated_at_orders ON public.orders;
CREATE TRIGGER set_updated_at_orders
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- Notes:
-- - account_id links to the customer's account
-- - invoice_id links to the Stripe invoice (optional)
-- - Use delivered_on IS NULL to check for active orders
-- - Shipping address is a snapshot from time of order
-- - Status values: pending, processing, shipped, delivered, cancelled
-- =====================================================
