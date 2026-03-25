-- =====================================================
-- Migration: 007_inventory_table.sql
-- Description: Creates inventory table to track stock and product analytics
-- Run this in: Supabase Dashboard > SQL Editor
-- Depends on: 005_stripe_products_table.sql, 006_stripe_prices_table.sql
-- =====================================================

-- Create inventory table
-- This is a join table between products and prices with added inventory metadata
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Foreign keys to Stripe product and price
  stripe_product_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  product_id UUID REFERENCES public.stripe_products(id) ON DELETE CASCADE NOT NULL,
  price_id UUID REFERENCES public.stripe_prices(id) ON DELETE CASCADE NOT NULL,

  -- Stock management
  stock_quantity INTEGER DEFAULT 0 NOT NULL,
  reserved_quantity INTEGER DEFAULT 0 NOT NULL, -- Items in pending orders
  available_quantity INTEGER GENERATED ALWAYS AS (stock_quantity - reserved_quantity) STORED,

  -- Reorder management
  reorder_point INTEGER DEFAULT 10, -- Alert when stock hits this level
  reorder_quantity INTEGER DEFAULT 50, -- Suggested reorder amount
  minimum_stock_level INTEGER DEFAULT 5, -- Safety stock

  -- SKU and tracking
  sku TEXT UNIQUE, -- Internal SKU code
  barcode TEXT, -- Product barcode
  location TEXT, -- Warehouse location

  -- Cost and pricing (for analytics)
  cost_per_unit BIGINT, -- Cost in cents
  wholesale_price BIGINT, -- Wholesale price in cents

  -- Product attributes
  weight DECIMAL(10, 2), -- Weight in pounds or kg
  dimensions JSONB, -- {length, width, height, unit}

  -- Status flags
  is_active BOOLEAN DEFAULT true NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  is_on_sale BOOLEAN DEFAULT false,

  -- Sales analytics (updated via triggers or scheduled jobs)
  total_sales INTEGER DEFAULT 0,
  total_revenue BIGINT DEFAULT 0, -- Revenue in cents
  last_sold_at TIMESTAMP WITH TIME ZONE,
  times_viewed INTEGER DEFAULT 0, -- Track product page views

  -- Supplier information
  supplier_name TEXT,
  supplier_sku TEXT,
  supplier_lead_time_days INTEGER, -- Days to restock

  -- Notes and metadata
  notes TEXT,
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS inventory_product_id_idx ON public.inventory(product_id);
CREATE INDEX IF NOT EXISTS inventory_price_id_idx ON public.inventory(price_id);
CREATE INDEX IF NOT EXISTS inventory_stripe_product_id_idx ON public.inventory(stripe_product_id);
CREATE INDEX IF NOT EXISTS inventory_stripe_price_id_idx ON public.inventory(stripe_price_id);
CREATE INDEX IF NOT EXISTS inventory_sku_idx ON public.inventory(sku);
CREATE INDEX IF NOT EXISTS inventory_stock_quantity_idx ON public.inventory(stock_quantity);
CREATE INDEX IF NOT EXISTS inventory_is_active_idx ON public.inventory(is_active);
CREATE INDEX IF NOT EXISTS inventory_is_featured_idx ON public.inventory(is_featured);
CREATE INDEX IF NOT EXISTS inventory_total_sales_idx ON public.inventory(total_sales DESC);

-- Attach updated_at trigger
DROP TRIGGER IF EXISTS set_updated_at_inventory ON public.inventory;
CREATE TRIGGER set_updated_at_inventory
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create view for low stock alerts
CREATE OR REPLACE VIEW public.low_stock_inventory AS
SELECT
  i.*,
  p.name AS product_name,
  pr.unit_amount AS price_amount
FROM public.inventory i
JOIN public.stripe_products p ON i.product_id = p.id
JOIN public.stripe_prices pr ON i.price_id = pr.id
WHERE i.available_quantity <= i.reorder_point
  AND i.is_active = true
ORDER BY i.available_quantity ASC;

-- Create view for best sellers
CREATE OR REPLACE VIEW public.best_selling_products AS
SELECT
  i.*,
  p.name AS product_name,
  pr.unit_amount AS price_amount,
  (i.total_revenue::DECIMAL / NULLIF(i.total_sales, 0)) AS avg_order_value
FROM public.inventory i
JOIN public.stripe_products p ON i.product_id = p.id
JOIN public.stripe_prices pr ON i.price_id = pr.id
WHERE i.total_sales > 0
ORDER BY i.total_sales DESC, i.total_revenue DESC
LIMIT 50;

-- =====================================================
-- Notes:
-- - Links stripe products and prices to inventory
-- - available_quantity is auto-calculated: stock_quantity - reserved_quantity
-- - reserved_quantity should be updated when orders are placed/completed
-- - Use low_stock_inventory view to see products needing reorder
-- - Use best_selling_products view for sales analytics
-- - total_sales and total_revenue should be updated via webhook or scheduled job
-- - Supports features like:
--   * Low stock alerts (reorder_point)
--   * Automatic reorder suggestions
--   * Sales analytics and reporting
--   * Product performance tracking
--   * Multi-location inventory (location field)
-- =====================================================
