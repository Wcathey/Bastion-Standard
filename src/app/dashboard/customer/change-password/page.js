"use client";

import { useEffect, useState } from "react";
import ChangePassword from "@/components/Dashboard/Customer/ChangePassword";
import BackNavigation from "@/components/Dashboard/Pages/BackNavigation";
import DashboardPageContainer from "@/components/Dashboard/Pages/DashboardPageContainer";
import DashboardPageLoading from "@/components/Dashboard/Pages/DashboardPageLoading";
import ErrorDisplay from "@/components/Dashboard/Pages/ErrorDisplay";
import { createClient } from "@/lib/supabase/client";

export default function ChangePasswordPage() {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setUser(user);
      setLoading(false);
    };

    getUser();
  }, [supabase.auth.getUser]);

  if (loading) {
    return <DashboardPageLoading />;
  }

  return (
    <DashboardPageContainer>
      <BackNavigation />
      <ErrorDisplay error={error} />
      <ChangePassword user={user} onError={setError} />
    </DashboardPageContainer>
  );
}
