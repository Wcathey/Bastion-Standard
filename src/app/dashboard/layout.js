import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Dashboard layout - ensures user is authenticated
 * This wraps all dashboard routes (customer and admin)
 */
export default async function DashboardLayout({ children }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
