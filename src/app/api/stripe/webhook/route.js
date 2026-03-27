/**
 * Stripe Webhook Handler
 *
 * Receives and processes webhook events from Stripe.
 * This handles events like:
 * - checkout.session.completed
 * - payment_intent.succeeded
 * - invoice.* events
 * - product.* and price.* events
 * - customer.* events
 *
 * IMPORTANT: Set STRIPE_WEBHOOK_SECRET in your environment variables
 */

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";

// Disable body parsing, need raw body for webhook signature verification
export const runtime = "nodejs";

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 },
    );
  }

  // Initialize Supabase client
  const supabase = await createClient();

  try {
    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        await handleCheckoutSessionCompleted(session, supabase);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        await handlePaymentIntentSucceeded(paymentIntent, supabase);
        break;
      }

      case "invoice.created":
      case "invoice.updated":
      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        await handleInvoiceEvent(invoice, supabase);
        break;
      }

      case "product.created":
      case "product.updated": {
        const product = event.data.object;
        await handleProductEvent(product, supabase);
        break;
      }

      case "product.deleted": {
        const product = event.data.object;
        await handleProductDeleted(product, supabase);
        break;
      }

      case "price.created":
      case "price.updated": {
        const price = event.data.object;
        await handlePriceEvent(price, supabase);
        break;
      }

      case "price.deleted": {
        const price = event.data.object;
        await handlePriceDeleted(price, supabase);
        break;
      }

      case "customer.created":
      case "customer.updated": {
        const customer = event.data.object;
        await handleCustomerEvent(customer, supabase);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}

// Handler functions

async function handleCheckoutSessionCompleted(session, supabase) {
  console.log("Checkout session completed:", session.id);

  // Update customer_id if user is authenticated
  if (session.metadata?.user_id && session.customer) {
    await supabase
      .from("customer_accounts")
      .update({ customer_id: session.customer })
      .eq("user_id", session.metadata.user_id);
  }

  // TODO: Create order record when user purchases
  // TODO: Update inventory quantities
}

async function handlePaymentIntentSucceeded(paymentIntent, _supabase) {
  console.log("Payment intent succeeded:", paymentIntent.id);
  // TODO: Update order status, send confirmation email
}

async function handleInvoiceEvent(invoice, supabase) {
  console.log("Invoice event:", invoice.id, invoice.status);

  // Upsert invoice to database
  const { error } = await supabase.from("invoices").upsert(
    {
      stripe_invoice_id: invoice.id,
      stripe_customer_id: invoice.customer,
      stripe_subscription_id: invoice.subscription,
      amount_due: invoice.amount_due,
      amount_paid: invoice.amount_paid,
      amount_remaining: invoice.amount_remaining,
      currency: invoice.currency,
      status: invoice.status,
      invoice_number: invoice.number,
      hosted_invoice_url: invoice.hosted_invoice_url,
      invoice_pdf: invoice.invoice_pdf,
      created: new Date(invoice.created * 1000).toISOString(),
      due_date: invoice.due_date
        ? new Date(invoice.due_date * 1000).toISOString()
        : null,
      period_start: invoice.period_start
        ? new Date(invoice.period_start * 1000).toISOString()
        : null,
      period_end: invoice.period_end
        ? new Date(invoice.period_end * 1000).toISOString()
        : null,
      paid_at: invoice.status_transitions?.paid_at
        ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
        : null,
      billing_reason: invoice.billing_reason,
      description: invoice.description,
      metadata: invoice.metadata,
    },
    { onConflict: "stripe_invoice_id" },
  );

  if (error) {
    console.error("Error upserting invoice:", error);
  }
}

async function handleProductEvent(product, supabase) {
  console.log("Product event:", product.id);

  // Upsert product to database
  const { error } = await supabase.from("stripe_products").upsert(
    {
      stripe_product_id: product.id,
      name: product.name,
      description: product.description,
      active: product.active,
      type: product.type,
      unit_label: product.unit_label,
      images: product.images,
      metadata: product.metadata,
      statement_descriptor: product.statement_descriptor,
      url: product.url,
      shippable: product.shippable,
      package_dimensions: product.package_dimensions,
      tax_code: product.tax_code,
      created: product.created,
      updated: product.updated,
    },
    { onConflict: "stripe_product_id" },
  );

  if (error) {
    console.error("Error upserting product:", error);
  }
}

async function handleProductDeleted(product, supabase) {
  console.log("Product deleted:", product.id);

  const { error } = await supabase
    .from("stripe_products")
    .delete()
    .eq("stripe_product_id", product.id);

  if (error) {
    console.error("Error deleting product:", error);
  }
}

async function handlePriceEvent(price, supabase) {
  console.log("Price event:", price.id);

  // Get the local product_id first
  const { data: productData } = await supabase
    .from("stripe_products")
    .select("id")
    .eq("stripe_product_id", price.product)
    .single();

  // Upsert price to database
  const { error } = await supabase.from("stripe_prices").upsert(
    {
      stripe_price_id: price.id,
      stripe_product_id: price.product,
      product_id: productData?.id,
      active: price.active,
      currency: price.currency,
      unit_amount: price.unit_amount,
      unit_amount_decimal: price.unit_amount_decimal,
      type: price.type,
      billing_scheme: price.billing_scheme,
      recurring_interval: price.recurring?.interval,
      recurring_interval_count: price.recurring?.interval_count,
      recurring_usage_type: price.recurring?.usage_type,
      recurring_aggregate_usage: price.recurring?.aggregate_usage,
      tiers: price.tiers,
      tiers_mode: price.tiers_mode,
      nickname: price.nickname,
      lookup_key: price.lookup_key,
      tax_behavior: price.tax_behavior,
      transform_quantity: price.transform_quantity,
      metadata: price.metadata,
      created: price.created,
    },
    { onConflict: "stripe_price_id" },
  );

  if (error) {
    console.error("Error upserting price:", error);
  }
}

async function handlePriceDeleted(price, supabase) {
  console.log("Price deleted:", price.id);

  const { error } = await supabase
    .from("stripe_prices")
    .delete()
    .eq("stripe_price_id", price.id);

  if (error) {
    console.error("Error deleting price:", error);
  }
}

async function handleCustomerEvent(customer, _supabase) {
  console.log("Customer event:", customer.id);
  // Customer data is already stored in Stripe, no need to duplicate
  // Just log for debugging purposes
}
