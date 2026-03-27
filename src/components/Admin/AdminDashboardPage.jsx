"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CreateAdminPassword from "@/components/Admin/CreateAdminPassword";
import AdminDashboard from "@/components/Dashboard/AdminDashboard";
import { createClient } from "@/lib/supabase/client";

export default function AdminDashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [adminAccount, setAdminAccount] = useState(null);
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false);

  useEffect(() => {
    const validateAccess = async () => {
      try {
        // Check if user is logged in
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
          router.push("/admin/login");
          return;
        }

        // Check if user exists in admin_accounts table
        const { data: admin, error: adminError } = await supabase
          .from("admin_accounts")
          .select("*")
          .eq("user_id", authUser.id)
          .maybeSingle();

        if (adminError || !admin) {
          // Not an admin - redirect to login
          router.push("/admin/login");
          return;
        }

        // Check if admin is active
        if (!admin.is_active) {
          await supabase.auth.signOut();
          router.push("/admin/login");
          return;
        }

        // Set user and admin data
        setUser(authUser);
        setAdminAccount(admin);

        // Check if first-time login (needs password setup)
        setNeedsPasswordSetup(!admin.has_logged_in);
      } catch (err) {
        console.error("Admin access validation error:", err);
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    validateAccess();
  }, [router, supabase]);

  const handlePasswordSetupComplete = () => {
    // Refresh the admin account data
    setNeedsPasswordSetup(false);
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 text-lg">Loading admin dashboard...</div>
      </div>
    );
  }

  if (!user || !adminAccount) {
    return null;
  }

  // If needs password setup, show the password creation form
  if (needsPasswordSetup) {
    return (
      <CreateAdminPassword
        adminAccount={adminAccount}
        onComplete={handlePasswordSetupComplete}
      />
    );
  }

  // Otherwise show the dashboard
  return <AdminDashboard user={user} adminAccount={adminAccount} />;
}
