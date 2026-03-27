"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CreateAdminPassword({ adminAccount, onComplete }) {
  const supabase = createClient();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Validate passwords match
      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error("New passwords do not match");
      }

      // Validate password strength
      if (formData.newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      // Verify current password by attempting to sign in again
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: formData.currentPassword,
      });

      if (verifyError) {
        throw new Error("Current password is incorrect");
      }

      // Update password using Supabase auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (updateError) throw updateError;

      // Update has_logged_in flag in admin_accounts
      const { error: updateAdminError } = await supabase
        .from("admin_accounts")
        .update({
          has_logged_in: true,
          last_login_at: new Date().toISOString(),
        })
        .eq("id", adminAccount.id);

      if (updateAdminError) throw updateAdminError;

      // Success - call the completion handler if provided, otherwise reload page
      if (onComplete) {
        onComplete();
      } else {
        window.location.reload();
      }
    } catch (err) {
      setError(err.message || "Failed to update password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h2 className="text-3xl font-bold text-white">
              Create New Password
            </h2>
            <span className="px-2 py-1 bg-yellow-600 text-white text-xs font-bold rounded">
              REQUIRED
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-400">
            For security, you must create a new password before accessing the
            admin dashboard
          </p>
          {adminAccount && (
            <p className="mt-2 text-xs text-gray-500">
              Logged in as: {adminAccount.email}
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Password Change Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Current Password (Temporary)
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter your temporary password"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                This is the temporary password provided by your manager
              </p>
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Create a strong password"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters long
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your new password"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-md p-4">
            <p className="text-sm text-yellow-200">
              <strong>Security Notice:</strong> After creating your new
              password, you'll have full access to the admin dashboard. Keep
              your password secure and never share it with anyone.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Updating Password..." : "Create Password & Continue"}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-4">
          <p>Need help? Contact your system administrator</p>
        </div>
      </div>
    </div>
  );
}
