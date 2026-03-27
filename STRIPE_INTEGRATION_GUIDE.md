# Stripe Integration Guide

## Overview

This guide covers the complete Stripe integration for Bastion Standard, including products, pricing, cart management, checkout, webhooks, and admin functionality.

## What's Been Implemented

### 1. Core Shopping Experience

#### Product Display
- **Location**: `src/app/products/page.js` → `ProductsPage.jsx` → `ProductCard.jsx`
- Products are now fetched dynamically from Stripe via `/api/products`
- Supports both one-time purchases and subscriptions
- Multi-pack pricing (1-pack, 2-pack, 4-pack) with different price points
- Images from Stripe product data

#### Shopping Cart
- **Location**: `src/contexts/CartContext.jsx`
- Full cart management with localStorage persistence
- Add/remove items, update quantities
- Displays in header with item count badge
- Cart page at `/cart` with full checkout flow

#### Checkout Process
- **Location**: `src/app/api/stripe/checkout-session/route.js`
- Supports both single-item and multi-item cart checkout
- Guest checkout enabled (no login required)
- Authenticated users get customer accounts linked to Stripe
- Redirects to Stripe Hosted Checkout
- Success page clears cart automatically

### 2. Order Management

#### Database Integration
- Orders are automatically created in `orders` table after successful checkout
- Includes shipping address, order number, total amount
- Links to customer accounts (or creates guest accounts)
- Links to Stripe invoices when available
- Tracks order status: pending → processing → shipped → delivered

#### Inventory Management
- Stock quantities automatically decrease after purchase
- Tracks total sales and revenue per product
- Low stock alerts in admin dashboard
- Inventory linked to Stripe products and prices

### 3. Webhook Integration

#### Setup Required
- **Location**: `src/app/api/stripe/webhook/route.js`
- **Stripe Dashboard**: Add webhook endpoint at `https://yourdomain.com/api/stripe/webhook`

#### Events Handled:
- `checkout.session.completed` - Creates orders, updates inventory
- `payment_intent.succeeded` - Payment confirmation
- `invoice.*` - Invoice tracking for subscriptions
- `product.created/updated/deleted` - Syncs products to database
- `price.created/updated/deleted` - Syncs pricing to database
- `customer.created/updated` - Customer data tracking

#### Required Environment Variable:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

Get this from Stripe Dashboard → Developers → Webhooks after creating the endpoint.

### 4. Admin Features

#### Product Creation
- **Location**: `/dashboard/admin/products/new`
- **API**: `/api/admin/products`
- Create new products directly in Stripe from admin dashboard
- Set up multiple pricing tiers (1-pack, 2-pack, 4-pack)
- Support for subscription products with recurring billing
- Automatically creates inventory records
- Requires admin authentication

#### Features:
- Product name, description, images
- Product type and line (metadata)
- Multiple price points
- Automatic Stripe product and price creation
- Instant availability on products page

#### Stripe Analytics Dashboard
- **API**: `/api/admin/stripe-analytics`
- Real-time revenue metrics (last 30 days)
- Total customers from Stripe
- Active subscriptions count
- Monthly Recurring Revenue (MRR)
- Payment success rate
- Top products by revenue

### 5. Subscription Support

#### Features:
- Subscription products display monthly pricing
- "Save 10% with subscription!" messaging
- Separate "Subscribe" button vs "Add to Cart"
- Checkout automatically uses `subscription` mode for recurring products
- Invoices tracked in database
- Stripe handles all recurring billing automatically

## Testing Checklist

### Before Going Live

1. **Test Stripe Integration**:
   ```bash
   # Install Stripe CLI
   brew install stripe/stripe-cli/stripe

   # Login
   stripe login

   # Forward webhooks to local dev
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

2. **Test Product Flow**:
   - [ ] Visit `/products` - products load from Stripe
   - [ ] Add items to cart - counter updates in header
   - [ ] Visit `/cart` - items display correctly with pricing
   - [ ] Adjust quantities - totals update
   - [ ] Remove items - cart updates

3. **Test Checkout**:
   - [ ] Click "Proceed to Checkout"
   - [ ] Redirects to Stripe Checkout
   - [ ] Use test card: `4242 4242 4242 4242`, any future date, any CVC
   - [ ] Complete payment
   - [ ] Redirects to success page
   - [ ] Cart is cleared
   - [ ] Order created in database
   - [ ] Inventory decreased

4. **Test Admin**:
   - [ ] Login as admin
   - [ ] Visit `/dashboard/admin`
   - [ ] Click "+ Add Product"
   - [ ] Fill out form with multiple price tiers
   - [ ] Submit
   - [ ] Product appears in Stripe Dashboard
   - [ ] Product appears on `/products` page
   - [ ] Can add to cart and purchase

5. **Test Webhooks**:
   - [ ] Webhook endpoint configured in Stripe
   - [ ] `STRIPE_WEBHOOK_SECRET` set in environment
   - [ ] Make test purchase
   - [ ] Check logs for webhook events
   - [ ] Verify order created in `orders` table
   - [ ] Verify inventory updated

## Going Live

### 1. Switch to Live Keys

Update `.env.local`:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
```

### 2. Configure Live Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://bastionstandard.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `invoice.*`
   - `product.*`
   - `price.*`
   - `customer.*`
4. Copy webhook secret → update `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

### 3. Add Live Products

Option A: Via Stripe Dashboard
- Products created in Stripe automatically sync via webhooks

Option B: Via Admin Dashboard
- Visit `/dashboard/admin/products/new`
- Create products with pricing
- They'll appear immediately

### 4. Configure Product Metadata

For best results, add metadata to products in Stripe Dashboard:
- `type`: Product category (e.g., "Simple: Crisp")
- `line`: Product line (e.g., "Simple Line")
- `created_at`: Timestamp

### 5. Set Initial Inventory

After products are created, update inventory quantities in Supabase:
```sql
UPDATE inventory
SET stock_quantity = 100,
    available_quantity = 100
WHERE stripe_product_id = 'prod_xxxxx';
```

## Product Structure

### One-Time Purchase Products

In Stripe Dashboard, create:
1. **Product**: "Simple: Crisp, Soap Bar"
2. **Prices** (3 separate prices):
   - Price 1: $15.99 (metadata: `quantity: 1`)
   - Price 2: $29.99 (metadata: `quantity: 2`)
   - Price 3: $54.99 (metadata: `quantity: 4`)

### Subscription Products

In Stripe Dashboard, create:
1. **Product**: "Monthly Soap Subscription"
2. **Price** (recurring):
   - Amount: $30.00
   - Billing: Monthly
   - Type: Recurring

The system automatically:
- Displays subscription badge
- Shows "Save 10%" message
- Changes button to "Subscribe"
- Uses subscription checkout mode

## Database Schema

### Orders Table
```sql
CREATE TABLE orders (
  id uuid PRIMARY KEY,
  account_id uuid REFERENCES customer_accounts(id),
  invoice_id uuid REFERENCES invoices(id),
  order_number text UNIQUE,
  total_amount bigint,
  currency text DEFAULT 'usd',
  status text DEFAULT 'pending',
  shipping_address_line1 text,
  shipping_address_line2 text,
  shipping_city text,
  shipping_state text,
  shipping_postal_code text,
  shipping_country text,
  tracking_number text,
  carrier text,
  metadata jsonb,
  ordered_on timestamp DEFAULT now(),
  shipped_on timestamp,
  delivered_on timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

### Inventory Table
Links Stripe products/prices to stock levels:
```sql
CREATE TABLE inventory (
  id uuid PRIMARY KEY,
  stripe_product_id text NOT NULL,
  stripe_price_id text NOT NULL,
  product_id uuid REFERENCES stripe_products(id),
  price_id uuid REFERENCES stripe_prices(id),
  stock_quantity integer DEFAULT 0,
  reserved_quantity integer DEFAULT 0,
  available_quantity integer DEFAULT (stock_quantity - reserved_quantity),
  reorder_point integer DEFAULT 10,
  total_sales integer DEFAULT 0,
  total_revenue bigint DEFAULT 0,
  last_sold_at timestamp,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

## API Endpoints

### Public Endpoints

- `GET /api/products` - Fetch all active products from Stripe
- `POST /api/stripe/checkout-session` - Create checkout session
- `POST /api/stripe/webhook` - Receive Stripe webhook events

### Admin Endpoints (Requires Authentication)

- `POST /api/admin/products` - Create new product in Stripe
- `GET /api/admin/stripe-analytics` - Get Stripe analytics data

## Troubleshooting

### Products Not Loading
- Check Stripe API keys are correct
- Verify products are active in Stripe Dashboard
- Check browser console for errors
- Verify `/api/products` returns data

### Cart Not Persisting
- Check browser localStorage is enabled
- Clear cache and try again
- Verify CartProvider wraps app in `layout.js`

### Checkout Failing
- Verify Stripe publishable key is correct
- Check network tab for API errors
- Ensure line items have valid price IDs
- Test with Stripe test card: 4242 4242 4242 4242

### Orders Not Creating
- Verify webhook is configured and receiving events
- Check webhook secret is correct in environment
- View webhook logs in Stripe Dashboard
- Check application logs for errors
- Ensure `checkout.session.completed` event is enabled

### Inventory Not Updating
- Verify webhook is processing `checkout.session.completed`
- Check inventory records exist for the price IDs
- Review webhook handler logs for errors
- Ensure `stripe_price_id` matches between inventory and Stripe

## Support

For issues:
1. Check Stripe Dashboard → Developers → Logs
2. Check application logs
3. Review webhook event logs
4. Test with Stripe CLI for local debugging

## Next Steps

1. **Set up Stripe Webhook** (Required for production)
2. **Add your live products** via admin dashboard or Stripe Dashboard
3. **Test complete purchase flow** with test cards
4. **Update inventory quantities** in database
5. **Monitor webhook events** in Stripe Dashboard
6. **Set up email notifications** for order confirmations (future enhancement)

## Additional Notes

- All prices are stored in cents (e.g., $15.99 = 1599)
- Guest checkout is supported - no login required
- Customers are encouraged to create accounts for order tracking
- Subscription management happens in Stripe Customer Portal
- Shipping costs calculated at checkout by Stripe
- Tax calculation can be enabled in Stripe settings
