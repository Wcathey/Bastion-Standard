/**
 * Admin Products API Route
 *
 * Handles creating and managing products in Stripe and database.
 * Requires admin authentication.
 */

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    // Verify admin authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: adminAccount } = await supabase
      .from("admin_accounts")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!adminAccount) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const {
      name,
      description,
      images = [],
      metadata = {},
      prices = [], // Array of pricing tiers
      isSubscription = false,
    } = await request.json();

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    if (!prices || prices.length === 0) {
      return NextResponse.json(
        { error: "At least one price is required" },
        { status: 400 }
      );
    }

    // Create product in Stripe
    const stripeProduct = await stripe.products.create({
      name,
      description,
      images,
      metadata: {
        ...metadata,
        created_by: user.id,
        created_at: new Date().toISOString(),
      },
      shippable: !isSubscription,
      active: true,
    });

    console.log("Stripe product created:", stripeProduct.id);

    // Create prices in Stripe
    const stripePrices = [];
    for (const priceData of prices) {
      const priceParams = {
        product: stripeProduct.id,
        currency: "usd",
        metadata: {
          quantity: priceData.quantity || 1,
        },
      };

      if (isSubscription) {
        // Subscription pricing
        priceParams.recurring = {
          interval: priceData.interval || "month",
          interval_count: priceData.intervalCount || 1,
        };
        priceParams.unit_amount = priceData.amount;
      } else {
        // One-time pricing
        priceParams.unit_amount = priceData.amount;

        // Add nickname for multi-pack pricing
        if (priceData.quantity > 1) {
          priceParams.nickname = `${priceData.quantity}-Pack`;
        }
      }

      const stripePrice = await stripe.prices.create(priceParams);
      stripePrices.push(stripePrice);
    }

    console.log(`Created ${stripePrices.length} prices for product`);

    // Store in Supabase (webhook will handle this, but we can do it sync too)
    const { data: dbProduct, error: dbError } = await supabase
      .from("stripe_products")
      .insert({
        stripe_product_id: stripeProduct.id,
        name: stripeProduct.name,
        description: stripeProduct.description,
        active: stripeProduct.active,
        images: stripeProduct.images,
        metadata: stripeProduct.metadata,
        shippable: stripeProduct.shippable,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Error storing product in database:", dbError);
    }

    // Store prices in database
    for (const stripePrice of stripePrices) {
      const { error: priceError } = await supabase
        .from("stripe_prices")
        .insert({
          stripe_price_id: stripePrice.id,
          stripe_product_id: stripeProduct.id,
          active: stripePrice.active,
          currency: stripePrice.currency,
          unit_amount: stripePrice.unit_amount,
          type: stripePrice.type,
          recurring_interval: stripePrice.recurring?.interval,
          recurring_interval_count: stripePrice.recurring?.interval_count,
          nickname: stripePrice.nickname,
          metadata: stripePrice.metadata,
        });

      if (priceError) {
        console.error("Error storing price in database:", priceError);
      }

      // Create inventory record for each price
      if (dbProduct) {
        const { data: priceRecord } = await supabase
          .from("stripe_prices")
          .select("id")
          .eq("stripe_price_id", stripePrice.id)
          .single();

        if (priceRecord) {
          await supabase.from("inventory").insert({
            stripe_product_id: stripeProduct.id,
            stripe_price_id: stripePrice.id,
            product_id: dbProduct.id,
            price_id: priceRecord.id,
            stock_quantity: 100, // Default stock
            is_active: true,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      product: {
        id: stripeProduct.id,
        name: stripeProduct.name,
        prices: stripePrices.map(p => ({
          id: p.id,
          amount: p.unit_amount,
        })),
      },
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to create product",
        success: false,
      },
      { status: 500 }
    );
  }
}
