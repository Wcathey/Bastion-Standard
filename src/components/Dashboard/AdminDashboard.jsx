"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminDashboard({ user, adminAccount }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Dashboard data state
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    inStockProducts: 0,
    totalRevenue: 0,
    revenueGrowth: 0,
  });

  const [recentTickets, setRecentTickets] = useState([]);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  const fetchDashboardData = async () => {
    setDataLoading(true);
    try {
      // Fetch products from Stripe API (like products page does)
      const stripeProductsResponse = await fetch("/api/products");
      const stripeProductsData = await stripeProductsResponse.json();
      const stripeProducts = stripeProductsData.success ? stripeProductsData.products : [];

      // Fetch all data in parallel
      const [
        customersData,
        ordersData,
        inventoryData,
        ticketsData,
        feedbackData,
        lowStockData,
        recentOrdersData,
      ] = await Promise.all([
        // Total customers
        supabase
          .from("customer_accounts")
          .select("id", { count: "exact", head: true })
          .eq("user_type", "customer"),

        // Total orders and revenue
        supabase
          .from("orders")
          .select("total_amount, status, created_at"),

        // Inventory
        supabase
          .from("inventory")
          .select("stock_quantity, available_quantity"),

        // Recent tickets
        supabase
          .from("tickets")
          .select(
            "id, subject, priority, submitted_at, completed_at, assigned_to",
          )
          .order("submitted_at", { ascending: false })
          .limit(5),

        // Recent feedback
        supabase
          .from("feedback")
          .select("id, category, status, priority, created_at")
          .order("created_at", { ascending: false })
          .limit(5),

        // Low stock items
        supabase
          .from("inventory")
          .select(`
            id,
            sku,
            stock_quantity,
            available_quantity,
            reorder_point,
            product_id,
            stripe_products (
              name
            )
          `)
          .lte("available_quantity", "reorder_point")
          .eq("is_active", true)
          .order("available_quantity", { ascending: true })
          .limit(5),

        // Recent orders
        supabase
          .from("orders")
          .select(`
            id,
            order_number,
            total_amount,
            status,
            ordered_on,
            account_id,
            accounts (
              first_name,
              last_name
            )
          `)
          .order("ordered_on", { ascending: false })
          .limit(5),
      ]);

      // Calculate stats
      const totalCustomers = customersData.count || 0;

      const orders = ordersData.data || [];
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(
        (o) => o.status === "pending" || o.status === "processing",
      ).length;

      // Calculate revenue (excluding cancelled orders)
      const totalRevenue = orders
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, order) => sum + (order.total_amount || 0), 0);

      // Calculate revenue growth (compare this month vs last month)
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const thisMonthRevenue = orders
        .filter(
          (o) =>
            o.status !== "cancelled" &&
            new Date(o.created_at) >= thisMonthStart,
        )
        .reduce((sum, order) => sum + (order.total_amount || 0), 0);

      const lastMonthRevenue = orders
        .filter(
          (o) =>
            o.status !== "cancelled" &&
            new Date(o.created_at) >= lastMonthStart &&
            new Date(o.created_at) < thisMonthStart,
        )
        .reduce((sum, order) => sum + (order.total_amount || 0), 0);

      const revenueGrowth =
        lastMonthRevenue > 0
          ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          : 0;

      // Use Stripe products data
      const totalProducts = stripeProducts.filter((p) => p.active).length;

      const inventory = inventoryData.data || [];
      const inStockProducts = inventory.filter(
        (i) => i.stock_quantity > 0,
      ).length;

      setStats({
        totalCustomers,
        totalOrders,
        pendingOrders,
        totalProducts,
        inStockProducts,
        totalRevenue,
        revenueGrowth,
      });

      setRecentTickets(ticketsData.data || []);
      setRecentFeedback(feedbackData.data || []);
      setLowStockItems(lowStockData.data || []);
      setRecentOrders(recentOrdersData.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const formatCurrency = (amountInCents) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format((amountInCents || 0) / 100);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      open: "bg-yellow-100 text-yellow-800",
      in_review: "bg-blue-100 text-blue-800",
      in_progress: "bg-purple-100 text-purple-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      urgent: "bg-red-600 text-white",
      high: "bg-orange-600 text-white",
      medium: "bg-yellow-600 text-white",
      low: "bg-green-600 text-white",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded ${
          colors[priority] || colors.medium
        }`}
      >
        {priority?.toUpperCase() || "MEDIUM"}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
              ADMIN
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Welcome, {adminAccount?.first_name || "Admin"} ({user?.email})
          </p>
        </div>
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? "Signing out..." : "Sign out"}
        </button>
      </div>

      {/* Loading State */}
      {dataLoading && (
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-3 text-gray-600">
              Loading dashboard data...
            </span>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      {!dataLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(stats.totalRevenue)}
            </p>
            <p
              className={`text-sm mt-2 ${
                stats.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {stats.revenueGrowth >= 0 ? "+" : ""}
              {stats.revenueGrowth.toFixed(1)}% from last month
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Orders</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalOrders}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {stats.pendingOrders} pending
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Customers</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalCustomers}
            </p>
            <p className="text-sm text-gray-500 mt-2">Total registered</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Products</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalProducts}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {stats.inStockProducts} in stock
            </p>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      {!dataLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Orders
              </h2>
              <button
                onClick={() => router.push("/dashboard/admin/orders")}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View all →
              </button>
            </div>
            <div className="p-6">
              {recentOrders.length === 0 ? (
                <p className="text-sm text-gray-500">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex justify-between items-start border-b border-gray-200 pb-4 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.order_number ||
                            `Order #${order.id.slice(0, 8)}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.accounts?.first_name}{" "}
                          {order.accounts?.last_name}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(order.ordered_on)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </p>
                        <span
                          className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                            order.status,
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Quick Actions
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <button
                onClick={() => router.push("/dashboard/admin/products/new")}
                className="w-full text-left px-4 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                + Add Product
              </button>
              <button
                onClick={() => router.push("/dashboard/admin/orders")}
                className="w-full text-left px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                View All Orders
              </button>
              <button
                onClick={() => router.push("/dashboard/admin/inventory")}
                className="w-full text-left px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Manage Inventory
              </button>
              <button
                onClick={() => router.push("/dashboard/admin/analytics")}
                className="w-full text-left px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                View Analytics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tickets, Feedback, and Inventory Grid */}
      {!dataLoading && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Tickets */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Tickets
                </h2>
                <button
                  onClick={() => router.push("/dashboard/admin/tickets")}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View all →
                </button>
              </div>
              <div className="p-6">
                {recentTickets.length === 0 ? (
                  <p className="text-sm text-gray-500">No tickets yet</p>
                ) : (
                  <div className="space-y-4">
                    {recentTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="border-b border-gray-200 pb-3 last:border-0"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-gray-900 text-sm">
                            {ticket.subject}
                          </p>
                          {getPriorityBadge(ticket.priority)}
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{formatDate(ticket.submitted_at)}</span>
                          <span
                            className={`px-2 py-1 rounded ${
                              ticket.completed_at
                                ? "bg-green-100 text-green-800"
                                : ticket.assigned_to
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {ticket.completed_at
                              ? "Completed"
                              : ticket.assigned_to
                                ? "Assigned"
                                : "Unassigned"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Feedback */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Feedback
                </h2>
                <button
                  onClick={() => router.push("/dashboard/admin/feedback")}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View all →
                </button>
              </div>
              <div className="p-6">
                {recentFeedback.length === 0 ? (
                  <p className="text-sm text-gray-500">No feedback yet</p>
                ) : (
                  <div className="space-y-4">
                    {recentFeedback.map((feedback) => (
                      <div
                        key={feedback.id}
                        className="border-b border-gray-200 pb-3 last:border-0"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-gray-900 text-sm">
                            {feedback.category}
                          </p>
                          {getPriorityBadge(feedback.priority)}
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500">
                            {formatDate(feedback.created_at)}
                          </span>
                          <span
                            className={`px-2 py-1 rounded ${getStatusColor(
                              feedback.status,
                            )}`}
                          >
                            {feedback.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Low Stock and Inventory Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Low Stock Alerts */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  Low Stock Alerts
                </h2>
                <button
                  onClick={() => router.push("/dashboard/admin/inventory")}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View inventory →
                </button>
              </div>
              <div className="p-6">
                {lowStockItems.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    All products are well-stocked
                  </p>
                ) : (
                  <div className="space-y-3">
                    {lowStockItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center border-b border-gray-200 pb-3 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {item.stripe_products?.name || "Unknown Product"}
                          </p>
                          <p className="text-xs text-gray-500">
                            SKU: {item.sku || "N/A"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold text-sm ${
                              item.available_quantity === 0
                                ? "text-red-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {item.available_quantity} left
                          </p>
                          <p className="text-xs text-gray-500">
                            Reorder at {item.reorder_point}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Business Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Business Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Total Products:</span>
                  <span className="font-semibold text-gray-900">
                    {stats.totalProducts}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">
                    Products In Stock:
                  </span>
                  <span className="font-semibold text-gray-900">
                    {stats.inStockProducts}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">
                    Total Customers:
                  </span>
                  <span className="font-semibold text-gray-900">
                    {stats.totalCustomers}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Total Orders:</span>
                  <span className="font-semibold text-gray-900">
                    {stats.totalOrders}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">
                    Pending Tickets:
                  </span>
                  <span className="font-semibold text-gray-900">
                    {
                      recentTickets.filter(
                        (t) => !t.completed_at && !t.assigned_to,
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Open Feedback:</span>
                  <span className="font-semibold text-gray-900">
                    {recentFeedback.filter((f) => f.status === "open").length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
