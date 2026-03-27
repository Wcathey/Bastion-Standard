import { redirect } from "next/navigation";
import FirstTimeAdminSetup from "@/components/Admin/FirstTimeAdminSetup";

export const metadata = {
  title: "Admin Setup - Bastion Standard",
  description: "First-time admin account setup",
};

export default function AdminSetupPage({ searchParams }) {
  const employeeId = searchParams.employeeId;

  if (!employeeId) {
    redirect("/admin/login");
  }

  return <FirstTimeAdminSetup employeeId={employeeId} />;
}
