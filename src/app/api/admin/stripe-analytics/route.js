/**
 * Admin Stripe Analytics API Route
 *
 * Fetches analytics and metrics from Stripe for admin dashboard.
 * Requires admin authentication.
 */

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    // Verify admin authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Fetch recent charges (last 30 days)
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
    const charges = await stripe.charges.list({
      created: { gte: thirtyDaysAgo },
      limit: 100,
    });

    // Calculate total revenue
    const totalRevenue = charges.data.reduce((sum, charge) => {
      if (charge.status === "succeeded") {
        return sum + charge.amount;
      }
      return sum;
    }, 0);

    // Fetch customers
    const customers = await stripe.customers.list({ limit: 100 });
    const totalCustomers = customers.data.length;

    // Fetch products
    const products = await stripe.products.list({ active: true, limit: 100 });
    const totalProducts = products.data.length;

    // Fetch subscriptions
    const subscriptions = await stripe.subscriptions.list({
      status: "active",
      limit: 100,
    });
    const activeSubscriptions = subscriptions.data.length;

    // Calculate monthly recurring revenue (MRR)
    const mrr = subscriptions.data.reduce((sum, sub) => {
      if (sub.items?.data?.[0]?.price?.unit_amount) {
        return sum + sub.items.data[0].price.unit_amount;
      }
      return sum;
    }, 0);

    // Get recent payment intents for success rate
    const paymentIntents = await stripe.paymentIntents.list({
      created: { gte: thirtyDaysAgo },
      limit: 100,
    });

    const successfulPayments = paymentIntents.data.filter(
      (pi) => pi.status === "succeeded"
    ).length;
    const totalPayments = paymentIntents.data.length;
    const successRate =
      totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;

    // Get top products by revenue
    const productRevenue = {};
    for (const charge of charges.data) {
      if (charge.status === "succeeded" && charge.metadata?.product_id) {
        const productId = charge.metadata.product_id;
        productRevenue[productId] =
          (productRevenue[productId] || 0) + charge.amount;
      }
    }

    const topProducts = Object.entries(productRevenue)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([productId, revenue]) => ({
        productId,
        revenue,
      }));

    return NextResponse.json({
      success: true,
      analytics: {
        revenue: {
          total: totalRevenue,
          mrr,
          period: "last_30_days",
        },
        customers: {
          total: totalCustomers,
        },
        products: {
          total: totalProducts,
        },
        subscriptions: {
          active: activeSubscriptions,
        },
        payments: {
          successRate: successRate.toFixed(2),
          successful: successfulPayments,
          total: totalPayments,
        },
        topProducts,
      },
    });
  } catch (error) {
    console.error("Error fetching Stripe analytics:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch analytics",
        success: false,
      },
      { status: 500 }
    );
  }
}
