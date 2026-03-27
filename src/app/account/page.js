import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not logged in, redirect to login page
  if (!user) {
    redirect("/login");
  }

  // First check if user is an admin
  const { data: adminAccount } = await supabase
    .from("admin_accounts")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminAccount) {
    redirect("/dashboard/admin");
    return;
  }

  // Check if they have a customer account
  const { data: account } = await supabase
    .from("customer_accounts")
    .select("user_type")
    .eq("user_id", user.id)
    .maybeSingle();

  // Redirect to appropriate dashboard
  if (account) {
    redirect("/dashboard/customer");
  } else {
    // No admin account and no customer account - redirect to login
    redirect("/login");
  }
}
