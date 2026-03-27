/**
 * Payment Intent API Route
 *
 * Creates a Stripe Payment Intent for one-time payments.
 * This is used for card payments with Stripe Elements.
 */

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const { amount, currency = "usd", metadata = {} } = await request.json();

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create Stripe customer
    const { data: account } = await supabase
      .from("customer_accounts")
      .select("customer_id, first_name, last_name")
      .eq("user_id", user.id)
      .single();

    let customerId = account?.customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name:
          account?.first_name && account?.last_name
            ? `${account.first_name} ${account.last_name}`
            : undefined,
        metadata: {
          account_id: account?.id,
          user_id: user.id,
        },
      });

      customerId = customer.id;

      // Save customer ID to database
      await supabase
        .from("customer_accounts")
        .update({ customer_id: customerId })
        .eq("user_id", user.id);
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency,
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        user_id: user.id,
        account_id: account?.id,
        ...metadata,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Payment intent error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
