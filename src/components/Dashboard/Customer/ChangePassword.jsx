"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ChangePassword({ user, onError }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setVerifying(true);
      if (onError) onError(null);

      // Validate inputs
      if (!passwordData.currentPassword) {
        throw new Error("Current password is required");
      }

      if (!passwordData.newPassword || !passwordData.confirmPassword) {
        throw new Error("Please fill in all password fields");
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error("New passwords do not match");
      }

      if (passwordData.newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      if (passwordData.currentPassword === passwordData.newPassword) {
        throw new Error("New password must be different from current password");
      }

      // Get current user email
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser?.email) {
        throw new Error("Unable to verify user identity");
      }

      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: passwordData.currentPassword,
      });

      if (signInError) {
        throw new Error("Current password is incorrect");
      }

      setVerifying(false);

      // Current password verified, now update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (updateError) throw updateError;

      setSuccessMessage("Password changed successfully! Redirecting...");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Redirect back to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard/customer");
      }, 2000);
    } catch (err) {
      setVerifying(false);
      if (onError) {
        onError(err.message || "Failed to change password. Please try again.");
      }
      console.error("Password change error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Change Password
        </h1>
        <p className="text-gray-600">
          Enter your current password and choose a new password for your
          account.
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Verifying Message */}
      {verifying && !successMessage && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <p className="text-sm text-blue-800">Verifying credentials...</p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Security:</strong> You must enter your current password to
              verify your identity before changing to a new password.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password *
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              required
              placeholder="Enter your current password"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password *
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              required
              minLength={8}
              placeholder="Enter new password"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 8 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password *
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              required
              placeholder="Confirm new password"
              disabled={loading}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors font-medium"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/customer")}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
