/**
 * Admin Inventory Management API
 *
 * POST - Create or update inventory records for products
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Helper to generate SKU from product name and pack size
 */
function generateSKU(productName, packSize) {
  const baseSlug = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${baseSlug}-${packSize}pack`;
}

/**
 * POST - Create or update inventory records
 */
export async function POST(request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify admin role
    const { data: account } = await supabase
      .from("accounts")
      .select("user_type")
      .eq("user_id", user.id)
      .single();

    if (!account || account.user_type !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { inventoryItems } = body; // Array of { stripe_product_id, stripe_price_id, pack_size, stock_quantity }

    if (!inventoryItems || !Array.isArray(inventoryItems)) {
      return NextResponse.json(
        { error: "Invalid request. Expected inventoryItems array." },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const item of inventoryItems) {
      const { stripe_product_id, stripe_price_id, pack_size, stock_quantity, product_name } = item;

      if (!stripe_product_id || !stripe_price_id || stock_quantity == null) {
        errors.push({
          stripe_product_id,
          pack_size,
          error: "Missing required fields. Need stripe_product_id, stripe_price_id, and stock_quantity"
        });
        continue;
      }

      try {
        // Get product UUID from stripe_products table
        const { data: productData, error: productError } = await supabase
          .from("stripe_products")
          .select("id")
          .eq("stripe_product_id", stripe_product_id)
          .single();

        if (productError || !productData) {
          // Product doesn't exist in stripe_products table, need to insert it first
          const { data: newProduct, error: insertProductError } = await supabase
            .from("stripe_products")
            .insert({
              stripe_product_id: stripe_product_id,
              name: product_name || "Unknown Product",
              active: true,
            })
            .select("id")
            .single();

          if (insertProductError) {
            errors.push({
              stripe_product_id,
              error: `Failed to create product: ${insertProductError.message}`
            });
            continue;
          }

          var product_uuid = newProduct.id;
        } else {
          var product_uuid = productData.id;
        }

        // Get price UUID from stripe_prices table
        const { data: priceData, error: priceError } = await supabase
          .from("stripe_prices")
          .select("id")
          .eq("stripe_price_id", stripe_price_id)
          .single();

        if (priceError || !priceData) {
          // Price doesn't exist, create it
          const { data: newPrice, error: insertPriceError } = await supabase
            .from("stripe_prices")
            .insert({
              stripe_price_id: stripe_price_id,
              product_id: product_uuid,
              active: true,
            })
            .select("id")
            .single();

          if (insertPriceError) {
            errors.push({
              stripe_product_id,
              stripe_price_id,
              error: `Failed to create price: ${insertPriceError.message}`
            });
            continue;
          }

          var price_uuid = newPrice.id;
        } else {
          var price_uuid = priceData.id;
        }

        // Generate SKU
        const sku = generateSKU(product_name || stripe_product_id, pack_size);

        // Check if inventory record already exists
        const { data: existingInventory } = await supabase
          .from("inventory")
          .select("id")
          .eq("stripe_product_id", stripe_product_id)
          .eq("stripe_price_id", stripe_price_id)
          .single();

        if (existingInventory) {
          // Update existing record
          const { data: updatedInventory, error: updateError } = await supabase
            .from("inventory")
            .update({
              stock_quantity: stock_quantity,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingInventory.id)
            .select()
            .single();

          if (updateError) {
            errors.push({
              stripe_product_id,
              error: `Update failed: ${updateError.message}`
            });
            continue;
          }

          results.push({
            action: "updated",
            inventory: updatedInventory
          });
        } else {
          // Create new inventory record
          const { data: newInventory, error: insertError } = await supabase
            .from("inventory")
            .insert({
              stripe_product_id,
              stripe_price_id,
              product_id: product_uuid,
              price_id: price_uuid,
              stock_quantity,
              sku,
              is_active: true,
            })
            .select()
            .single();

          if (insertError) {
            errors.push({
              stripe_product_id,
              stripe_price_id,
              error: `Insert failed: ${insertError.message}`
            });
            continue;
          }

          results.push({
            action: "created",
            inventory: newInventory
          });
        }
      } catch (err) {
        errors.push({
          stripe_product_id,
          error: err.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors: errors.length > 0 ? errors : undefined,
      message: `Processed ${results.length} items successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}`
    });

  } catch (error) {
    console.error("Error managing inventory:", error);
    return NextResponse.json(
      { error: error.message || "Failed to manage inventory" },
      { status: 500 }
    );
  }
}
