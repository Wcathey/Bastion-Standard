# Deployment Checklist for Vercel

## Pre-Deployment

### 1. Environment Variables

Ensure all environment variables are added to Vercel:

**Vercel Dashboard** → Your Project → Settings → Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Stripe (Test Keys - Update when going live)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# Optional
NEXT_PUBLIC_BASE_URL=https://bastion-standard.vercel.app
```

**Important**: Set these for all environments (Production, Preview, Development)

### 2. Stripe Webhook Configuration

✅ **Already Done** - Webhook configured at: `https://bastion-standard.vercel.app/api/stripe/webhook`

Verify in Stripe Dashboard → Developers → Webhooks:
- Endpoint URL: `https://bastion-standard.vercel.app/api/stripe/webhook`
- Events: 110 events selected (includes all necessary events)
- Secret: `your_stripe_webhook_secret_here`

### 3. Supabase Storage Setup

**Create `products` bucket**:

1. Supabase Dashboard → Storage → Create bucket
2. Name: `products`
3. Public: ✓ Yes
4. Policies:
   - Public SELECT (read)
   - Authenticated INSERT/UPDATE/DELETE

See `SUPABASE_STORAGE_SETUP.md` for detailed instructions.

### 4. Database Setup

Verify all tables exist:
- [ ] `customer_accounts`
- [ ] `admin_accounts`
- [ ] `orders`
- [ ] `invoices`
- [ ] `stripe_products`
- [ ] `stripe_prices`
- [ ] `inventory`
- [ ] `tickets`
- [ ] `feedback`

Check: Supabase Dashboard → Table Editor

### 5. Code Verification

Run locally first:
```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Test locally (visit http://localhost:3000)
# - Products page loads
# - Add to cart works
# - Cart page displays correctly
# - Checkout redirects to Stripe
# - Complete test purchase with 4242 4242 4242 4242
# - Verify order created in database
```

## Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Complete Stripe integration with Supabase Storage"
git push origin main
```

### 2. Vercel Auto-Deploy

Vercel will automatically deploy when you push to main.

Monitor deployment:
- Vercel Dashboard → Your Project → Deployments
- Check build logs for errors

### 3. Verify Deployment

Once deployed, test the live site:

- [ ] Visit `https://bastion-standard.vercel.app`
- [ ] Navigate to `/products` - products load from Stripe
- [ ] Add items to cart - counter updates
- [ ] Visit `/cart` - items display with correct pricing
- [ ] Click "Proceed to Checkout"
- [ ] Use test card: `4242 4242 4242 4242`, any future date, any CVC
- [ ] Complete payment → redirects to success page
- [ ] Cart clears automatically
- [ ] Check Supabase → `orders` table → new order created
- [ ] Check Stripe Dashboard → Payment successful

### 4. Test Admin Features

- [ ] Login as admin
- [ ] Visit `/dashboard/admin`
- [ ] Dashboard displays correct stats
- [ ] Navigate to `/dashboard/admin/products/new`
- [ ] Upload product image (test Supabase Storage)
- [ ] Create product with multiple pricing tiers
- [ ] Verify product appears in Stripe Dashboard
- [ ] Verify product appears on `/products` page
- [ ] Verify product image displays from Supabase Storage

### 5. Test Webhooks

- [ ] Make test purchase on live site
- [ ] Go to Stripe Dashboard → Developers → Webhooks
- [ ] Click on your webhook
- [ ] Check "Events" tab - should show recent events
- [ ] Verify `checkout.session.completed` was sent
- [ ] Check Supabase → `orders` table → order was created
- [ ] Check Supabase → `inventory` table → stock was decreased

## Post-Deployment

### 1. Monitor Logs

**Vercel Logs**:
- Vercel Dashboard → Your Project → Logs
- Watch for any errors in the first few hours

**Stripe Logs**:
- Stripe Dashboard → Developers → Logs
- Monitor webhook deliveries
- Check for failed webhooks

**Supabase Logs**:
- Supabase Dashboard → Logs
- Monitor API requests
- Check for database errors

### 2. Performance Check

- [ ] Test page load speeds (should be < 3 seconds)
- [ ] Test image loading (Supabase CDN)
- [ ] Test cart performance with multiple items
- [ ] Test checkout flow end-to-end

### 3. Add Products

Now that everything is deployed and working:

1. **Via Admin Dashboard** (Recommended):
   - Visit `/dashboard/admin/products/new`
   - Upload high-quality product images
   - Set up pricing tiers
   - Create products

2. **Via Stripe Dashboard** (Alternative):
   - Products will sync via webhooks
   - Manually add images to Supabase Storage

### 4. Update Inventory

Set initial stock quantities:

```sql
-- In Supabase SQL Editor
UPDATE inventory
SET
  stock_quantity = 100,
  available_quantity = 100
WHERE stripe_product_id IN (
  SELECT stripe_product_id
  FROM stripe_products
  WHERE active = true
);
```

## Going Live (Production)

### When Ready to Accept Real Payments:

1. **Switch to Live Stripe Keys**:
   ```env
   # Update in Vercel Environment Variables
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
   STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
   ```

2. **Create Live Webhook**:
   - Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://bastion-standard.vercel.app/api/stripe/webhook`
   - Select all 110 events (same as test)
   - Copy new webhook secret
   - Update in Vercel: `STRIPE_WEBHOOK_SECRET=whsec_live_xxxxxxxxxxxxx`

3. **Redeploy Vercel**:
   - Vercel will redeploy with new environment variables
   - Or trigger manual redeploy: Vercel Dashboard → Deployments → Redeploy

4. **Test with Live Card**:
   - Make small test purchase with real card
   - Verify order creation
   - Refund test order in Stripe

5. **Remove Test Products** (if any):
   - Keep only real products
   - Update inventory quantities
   - Ensure all product images are high quality

## Troubleshooting

### Products Not Loading
- Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set in Vercel
- Check Stripe API keys are correct
- Check Vercel logs for API errors

### Checkout Not Working
- Verify `STRIPE_SECRET_KEY` is set
- Check webhook endpoint is correct
- Test with Stripe test card: 4242 4242 4242 4242

### Orders Not Creating
- Check webhook secret is correct
- Verify webhook is receiving events (Stripe Dashboard)
- Check Vercel function logs during checkout
- Verify database tables exist

### Images Not Displaying
- Verify Supabase Storage `products` bucket exists
- Check bucket is public
- Verify images were uploaded correctly
- Check browser console for image load errors

### Build Errors
- Check for TypeScript/linting errors
- Run `npm run build` locally first
- Check Vercel build logs for specific errors

## Security Checklist

- [ ] All sensitive keys are in environment variables (not committed)
- [ ] Webhook signature verification is enabled
- [ ] Admin routes require authentication
- [ ] Database RLS policies are configured
- [ ] HTTPS is enabled (automatic on Vercel)
- [ ] CORS is configured correctly

## Performance Optimization

### Already Implemented:
- ✅ Image optimization via Next.js Image component
- ✅ Lazy loading of product images
- ✅ CDN for Supabase Storage images
- ✅ Vercel Edge Network
- ✅ localStorage for cart (no API calls)

### Future Enhancements:
- [ ] Add image compression pipeline
- [ ] Implement ISR (Incremental Static Regeneration) for products
- [ ] Add Redis cache for frequently accessed data
- [ ] Optimize bundle size (code splitting)

## Support Resources

- **Vercel**: https://vercel.com/docs
- **Stripe**: https://stripe.com/docs
- **Supabase**: https://supabase.com/docs
- **Next.js**: https://nextjs.org/docs

## Emergency Contacts

If something goes wrong:

1. **Check Status Pages**:
   - https://www.vercel-status.com/
   - https://status.stripe.com/
   - https://status.supabase.com/

2. **Quick Rollback**:
   - Vercel Dashboard → Deployments
   - Find last working deployment
   - Click "⋮" menu → "Promote to Production"

3. **Disable Webhooks** (if needed):
   - Stripe Dashboard → Webhooks
   - Toggle webhook off temporarily

## Success Criteria

Your site is successfully deployed when:

- ✅ Products load from Stripe API
- ✅ Images display from Supabase Storage
- ✅ Shopping cart works (add/remove/update)
- ✅ Checkout redirects to Stripe
- ✅ Test payments succeed
- ✅ Orders are created in database
- ✅ Inventory updates after purchase
- ✅ Webhooks are receiving events
- ✅ Admin can create new products
- ✅ No console errors
- ✅ No Vercel function errors
- ✅ Page loads are fast (< 3s)

## Next Steps After Deployment

1. Monitor first few orders closely
2. Test all edge cases (empty cart, failed payment, etc.)
3. Set up email notifications (future enhancement)
4. Add more products via admin dashboard
5. Promote your store!

---

**Deployment Date**: _________
**Deployed By**: _________
**Version**: _________
**Status**: ⬜ Test / ⬜ Production
