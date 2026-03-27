import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Auth callback route handler
 * This handles the redirect from Supabase after email verification
 * and other OAuth flows
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const _next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      },
    );

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get the user to check their role and redirect appropriately
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if user is an admin first
        const { data: adminAccount } = await supabase
          .from("admin_accounts")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (adminAccount) {
          return NextResponse.redirect(`${origin}/dashboard/admin`);
        }

        // Check if user is a customer
        const { data: customerAccount } = await supabase
          .from("customer_accounts")
          .select("user_id, email_verified")
          .eq("user_id", user.id)
          .maybeSingle();

        if (customerAccount) {
          // Update email_verified status if confirmed
          if (user.email_confirmed_at && !customerAccount.email_verified) {
            await supabase
              .from("customer_accounts")
              .update({ email_verified: true })
              .eq("user_id", user.id);
          }

          return NextResponse.redirect(`${origin}/dashboard/customer`);
        }
      }
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
