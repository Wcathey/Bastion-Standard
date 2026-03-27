import { redirect } from "next/navigation";
import CreateAdminPassword from "@/components/Admin/CreateAdminPassword";
import AdminDashboard from "@/components/Dashboard/AdminDashboard";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Fetch admin account data
  const { data: adminAccount } = await supabase
    .from("admin_accounts")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // If no admin account exists or inactive, redirect to login (should not happen with proxy verification)
  if (!adminAccount || !adminAccount.is_active) {
    redirect("/admin/login");
  }

  // Check if first-time login (needs password setup)
  if (!adminAccount.has_logged_in) {
    return <CreateAdminPassword adminAccount={adminAccount} />;
  }

  // Update last login time
  await supabase
    .from("admin_accounts")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", adminAccount.id);

  return <AdminDashboard user={user} adminAccount={adminAccount} />;
}
