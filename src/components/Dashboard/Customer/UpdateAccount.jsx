"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Phone number validation helper
function validatePhoneNumber(phone) {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length === 10;
}

// Format phone number for display
function _formatPhoneNumber(phone) {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export default function UpdateAccount({ user, onError }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");

  // Form data state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    billing_address_line1: "",
    billing_address_line2: "",
    billing_city: "",
    billing_state: "",
    billing_postal_code: "",
    billing_country: "US",
    shipping_address_line1: "",
    shipping_address_line2: "",
    shipping_city: "",
    shipping_state: "",
    shipping_postal_code: "",
    shipping_country: "US",
    use_billing_as_shipping: true,
  });

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
        const { data: accountData, error: accountError } = await supabase
          .from("customer_accounts")
          .select("*")
          .eq("user_id", currentUser.id)
          .single();

        if (accountError) throw accountError;

        // Populate form with existing data
        setFormData({
          first_name: accountData.first_name || "",
          last_name: accountData.last_name || "",
          email: currentUser.email || "",
          phone: accountData.phone || "",
          billing_address_line1: accountData.billing_address_line1 || "",
          billing_address_line2: accountData.billing_address_line2 || "",
          billing_city: accountData.billing_city || "",
          billing_state: accountData.billing_state || "",
          billing_postal_code: accountData.billing_postal_code || "",
          billing_country: accountData.billing_country || "US",
          shipping_address_line1: accountData.shipping_address_line1 || "",
          shipping_address_line2: accountData.shipping_address_line2 || "",
          shipping_city: accountData.shipping_city || "",
          shipping_state: accountData.shipping_state || "",
          shipping_postal_code: accountData.shipping_postal_code || "",
          shipping_country: accountData.shipping_country || "US",
          use_billing_as_shipping: accountData.use_billing_as_shipping ?? true,
        });
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

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (onError) onError(null);

      // Validate phone number if provided
      if (formData.phone && !validatePhoneNumber(formData.phone)) {
        throw new Error("Please enter a valid 10-digit phone number");
      }

      // Get current user
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) throw new Error("No authenticated user");

      // Clean phone number
      const cleanedPhone = formData.phone.replace(/\D/g, "");

      // Prepare update data (excluding read-only fields)
      const updateData = {
        phone: cleanedPhone,
        billing_address_line1: formData.billing_address_line1,
        billing_address_line2: formData.billing_address_line2,
        billing_city: formData.billing_city,
        billing_state: formData.billing_state,
        billing_postal_code: formData.billing_postal_code,
        billing_country: formData.billing_country,
        shipping_address_line1: formData.shipping_address_line1,
        shipping_address_line2: formData.shipping_address_line2,
        shipping_city: formData.shipping_city,
        shipping_state: formData.shipping_state,
        shipping_postal_code: formData.shipping_postal_code,
        shipping_country: formData.shipping_country,
        use_billing_as_shipping: formData.use_billing_as_shipping,
      };

      // Single query to update all account data
      const { error } = await supabase
        .from("customer_accounts")
        .update(updateData)
        .eq("user_id", authUser.id);

      if (error) throw error;

      setSuccessMessage("Account information updated successfully!");

      // Redirect back to account management after 2 seconds
      setTimeout(() => {
        router.push("/dashboard/customer");
      }, 2000);
    } catch (err) {
      if (onError) {
        onError(
          err.message ||
            "Failed to update account information. Please try again.",
        );
      }
      console.error("Account update error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (fetchingProfile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading account information...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Update Account Information
        </h1>
        <p className="text-gray-600">
          Update your account details below. Fields marked with * are required.
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Personal Information
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Cannot be changed</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  handleInputChange("phone", value);
                }}
                placeholder="1234567890"
                maxLength="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter 10-digit phone number (numbers only)
              </p>
            </div>
          </div>
        </div>

        {/* Billing Address */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Billing Address
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 1 *
              </label>
              <input
                type="text"
                value={formData.billing_address_line1}
                onChange={(e) =>
                  handleInputChange("billing_address_line1", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 2 (Optional)
              </label>
              <input
                type="text"
                value={formData.billing_address_line2}
                onChange={(e) =>
                  handleInputChange("billing_address_line2", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.billing_city}
                  onChange={(e) =>
                    handleInputChange("billing_city", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.billing_state}
                  onChange={(e) =>
                    handleInputChange("billing_state", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zip Code *
                </label>
                <input
                  type="text"
                  value={formData.billing_postal_code}
                  onChange={(e) =>
                    handleInputChange("billing_postal_code", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Use Billing as Shipping Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="use_billing_as_shipping"
            checked={formData.use_billing_as_shipping}
            onChange={(e) =>
              handleInputChange("use_billing_as_shipping", e.target.checked)
            }
            className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
          />
          <label
            htmlFor="use_billing_as_shipping"
            className="ml-2 block text-sm text-gray-700"
          >
            Use billing address as shipping address
          </label>
        </div>

        {/* Shipping Address (only if different from billing) */}
        {!formData.use_billing_as_shipping && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Shipping Address
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  value={formData.shipping_address_line1}
                  onChange={(e) =>
                    handleInputChange("shipping_address_line1", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  required={!formData.use_billing_as_shipping}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={formData.shipping_address_line2}
                  onChange={(e) =>
                    handleInputChange("shipping_address_line2", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.shipping_city}
                    onChange={(e) =>
                      handleInputChange("shipping_city", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    required={!formData.use_billing_as_shipping}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.shipping_state}
                    onChange={(e) =>
                      handleInputChange("shipping_state", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    required={!formData.use_billing_as_shipping}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zip Code *
                  </label>
                  <input
                    type="text"
                    value={formData.shipping_postal_code}
                    onChange={(e) =>
                      handleInputChange("shipping_postal_code", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    required={!formData.use_billing_as_shipping}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors font-medium"
          >
            {loading ? "Updating..." : "Update Account Information"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/customer")}
            className="px-8 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
