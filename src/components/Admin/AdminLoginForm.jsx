"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Authentication failed");
      }

      // Check if user exists in admin_accounts table by user_id
      const { data: adminAccount, error: adminError } = await supabase
        .from("admin_accounts")
        .select("*")
        .eq("user_id", authData.user.id)
        .single();

      if (adminError || !adminAccount) {
        await supabase.auth.signOut();
        throw new Error(
          "Access denied. This account is not authorized as an administrator.",
        );
      }

      // Check if admin is active
      if (!adminAccount.is_active) {
        await supabase.auth.signOut();
        throw new Error(
          "Your account has been deactivated. Please contact your manager.",
        );
      }

      // Successful login - redirect to admin dashboard
      // Dashboard will handle first-time password setup check
      router.push("/dashboard/admin");
      router.refresh();
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h2 className="text-3xl font-bold text-white">Admin Login</h2>
            <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
              SECURE
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-400">
            Sign in with your assigned business email and password
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Work Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="your.name@company.com"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* Additional Links */}
        <div className="space-y-3">
          <div className="pt-4 border-t border-gray-800">
            <Link
              href="/login"
              className="block text-center text-sm text-gray-400 hover:text-white hover:underline"
            >
              ← Customer Login
            </Link>
          </div>

          <div className="text-center text-xs text-gray-500 pt-4">
            <p>New employee? Contact your manager for account setup.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
