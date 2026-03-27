/**
 * Products API Route
 *
 * Fetches products and their prices from Stripe.
 * Returns formatted data for the frontend to display.
 * Images are fetched from Supabase Storage organized by product ID.
 */

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    console.log('=== PRODUCTS API CALLED ===');

    // Fetch all active products from Stripe
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
      limit: 100,
    });

    console.log(`Fetched ${products.data.length} products from Stripe`);
    console.log('Products:', JSON.stringify(products.data.map(p => ({ id: p.id, name: p.name })), null, 2));

    // Fetch all active prices
    const prices = await stripe.prices.list({
      active: true,
      limit: 100,
    });

    console.log(`Fetched ${prices.data.length} prices from Stripe`);
    console.log('Prices:', JSON.stringify(prices.data.map(p => ({
      id: p.id,
      product: p.product,
      amount: p.unit_amount,
      type: p.type
    })), null, 2));

    // Group prices by product
    const pricesByProduct = {};
    for (const price of prices.data) {
      if (!pricesByProduct[price.product]) {
        pricesByProduct[price.product] = [];
      }
      pricesByProduct[price.product].push(price);
    }

    // Format products with their prices
    const formattedProducts = products.data.map((product) => {
      const productPrices = pricesByProduct[product.id] || [];

      // Sort prices by unit_amount to get consistent ordering
      const sortedPrices = productPrices
        .filter(p => p.unit_amount !== null)
        .sort((a, b) => (a.unit_amount || 0) - (b.unit_amount || 0));

      // Determine if this is a subscription product
      const isSubscription = sortedPrices.some(p => p.type === 'recurring');

      // Get pricing tiers (1-pack, 2-pack, 4-pack) or subscription
      const pricingData = {};

      if (isSubscription) {
        const subPrice = sortedPrices.find(p => p.type === 'recurring');
        pricingData.subscription = {
          priceId: subPrice.id,
          amount: subPrice.unit_amount,
          interval: subPrice.recurring?.interval,
          intervalCount: subPrice.recurring?.interval_count,
        };
      } else {
        // Map prices based on metadata or quantity
        // Assume prices are ordered: single, 2-pack, 4-pack
        sortedPrices.forEach((price, index) => {
          const quantity = price.metadata?.quantity ||
                          price.transform_quantity?.divide_by ||
                          (index === 0 ? 1 : index === 1 ? 2 : 4);

          pricingData[`pack_${quantity}`] = {
            priceId: price.id,
            amount: price.unit_amount,
            quantity: Number.parseInt(quantity),
          };
        });
      }

      // Use Stripe images as primary source
      const images = product.images || [];

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        images,
        metadata: product.metadata || {},
        active: product.active,
        pricing: pricingData,
        isSubscription,
        type: product.metadata?.type || product.name,
        line: product.metadata?.line || 'Simple Line',
      };
    });

    console.log(`Formatted ${formattedProducts.length} products with pricing`);
    console.log('Sample formatted product:', JSON.stringify(formattedProducts[0], null, 2));

    // Now try to enhance with Supabase Storage images (async, non-blocking)
    // This runs after the main response, so it won't slow down initial load
    const supabase = await createClient();

    for (const product of formattedProducts) {
      try {
        const { data: files, error } = await supabase.storage
          .from('products')
          .list(product.id, {
            limit: 10,
            sortBy: { column: 'name', order: 'asc' },
          });

        if (!error && files && files.length > 0) {
          // Found storage images - use them instead of Stripe images
          const storageImages = files.map((file) => {
            const { data: urlData } = supabase.storage
              .from('products')
              .getPublicUrl(`${product.id}/${file.name}`);
            return urlData.publicUrl;
          });

          product.images = storageImages;
          console.log(`Loaded ${storageImages.length} images from storage for ${product.id}`);
        }
      } catch (storageError) {
        // Silently fail - product will just use Stripe images
        console.log(`Could not load storage images for ${product.id}:`, storageError.message);
      }
    }

    console.log(`Returning ${formattedProducts.length} products to frontend`);
    console.log('=== PRODUCTS API COMPLETE ===');

    return NextResponse.json({
      products: formattedProducts,
      success: true
    });
  } catch (error) {
    console.error("=== ERROR FETCHING PRODUCTS ===");
    console.error("Error:", error);
    console.error("Stack:", error.stack);
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch products",
        success: false
      },
      { status: 500 }
    );
  }
}
