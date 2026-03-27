"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Format phone number for display
function formatPhoneNumber(phone) {
  if (!phone) return "Not set";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

// Get greeting based on time of day
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export default function ManageAccountTab({ user, onError }) {
  const _router = useRouter();
  const supabase = createClient();
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [accountData, setAccountData] = useState(null);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setFetchingProfile(true);

        // Get the authenticated user
        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!currentUser) return;

        // Query customer_accounts table
        const { data: account, error: accountError } = await supabase
          .from("customer_accounts")
          .select("*")
          .eq("user_id", currentUser.id)
          .single();

        if (accountError) throw accountError;

        setAccountData(account);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        if (onError) {
          onError("Failed to load user profile. Please refresh the page.");
        }
      } finally {
        setFetchingProfile(false);
      }
    };

    fetchUserProfile();
  }, [onError, supabase.from, supabase.auth.getUser]);

  if (fetchingProfile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading account information...</div>
      </div>
    );
  }

  const greeting = getGreeting();
  const firstName = accountData?.first_name || "User";

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {greeting}, {firstName}
        </h1>
      </div>

      {/* Account Information Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Account Information
        </h2>

        <div className="space-y-4">
          {/* Name */}
          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-sm font-medium text-gray-700">Name:</span>
            <span className="text-sm text-gray-900">
              {accountData?.first_name} {accountData?.last_name}
            </span>
          </div>

          {/* Email */}
          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-sm font-medium text-gray-700">Email:</span>
            <span className="text-sm text-gray-900">{user?.email}</span>
          </div>

          {/* Phone */}
          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-sm font-medium text-gray-700">Phone:</span>
            <span className="text-sm text-gray-900">
              {formatPhoneNumber(accountData?.phone)}
            </span>
          </div>

          {/* Billing Address */}
          <div className="grid grid-cols-[140px_1fr] gap-4 pt-4 border-t">
            <span className="text-sm font-medium text-gray-700">
              Billing Address:
            </span>
            <div className="text-sm text-gray-900">
              {accountData?.billing_address_line1 ? (
                <>
                  <div>{accountData.billing_address_line1}</div>
                  {accountData.billing_address_line2 && (
                    <div>{accountData.billing_address_line2}</div>
                  )}
                  <div>
                    {accountData.billing_city}, {accountData.billing_state}{" "}
                    {accountData.billing_postal_code}
                  </div>
                </>
              ) : (
                "Not set"
              )}
            </div>
          </div>

          {/* Shipping Address (only if different from billing) */}
          {!accountData?.use_billing_as_shipping && (
            <div className="grid grid-cols-[140px_1fr] gap-4 pt-4 border-t">
              <span className="text-sm font-medium text-gray-700">
                Shipping Address:
              </span>
              <div className="text-sm text-gray-900">
                {accountData?.shipping_address_line1 ? (
                  <>
                    <div>{accountData.shipping_address_line1}</div>
                    {accountData.shipping_address_line2 && (
                      <div>{accountData.shipping_address_line2}</div>
                    )}
                    <div>
                      {accountData.shipping_city}, {accountData.shipping_state}{" "}
                      {accountData.shipping_postal_code}
                    </div>
                  </>
                ) : (
                  "Not set"
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Links */}
        <div className="mt-8 pt-6 border-t space-y-3">
          <Link
            href="/dashboard/customer/update-account"
            className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Update Account Information
          </Link>
          <Link
            href="/dashboard/customer/change-password"
            className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Change Password
          </Link>
          <button
            onClick={() => {
              // TODO: Navigate to manage subscription when ready
              alert("Manage subscription feature coming soon");
            }}
            className="block text-sm text-blue-600 hover:text-blue-800 hover:underline text-left"
          >
            Manage Subscription
          </button>
        </div>
      </div>

      {/* Need Help Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
        <p className="text-sm text-gray-700 mb-4">
          Visit the{" "}
          <Link
            href="/faqs"
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
          >
            FAQ section
          </Link>{" "}
          for more general Q&A or speak with our{" "}
          <Link
            href="/support"
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
          >
            Virtual AI Assistant
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
