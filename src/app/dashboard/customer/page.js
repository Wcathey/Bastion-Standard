import { redirect } from "next/navigation";
import CustomerDashboard from "@/components/Dashboard/CustomerDashboard";
import { createClient } from "@/lib/supabase/server";

export default async function CustomerDashboardPage() {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch account data
  const { data: account } = await supabase
    .from("customer_accounts")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // If no account exists, redirect to login (should not happen with proxy verification)
  if (!account) {
    redirect("/login");
  }

  // Update email_verified if email is confirmed
  if (user.email_confirmed_at && account && !account.email_verified) {
    await supabase
      .from("customer_accounts")
      .update({ email_verified: true })
      .eq("user_id", user.id);

    account.email_verified = true;
  }

  return <CustomerDashboard user={user} account={account} />;
}
