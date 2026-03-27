import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

/**
 * Proxy to handle Supabase authentication and session management
 * This runs on every request and:
 * 1. Refreshes the user's session if needed
 * 2. Protects routes that require authentication
 * 3. Handles role-based access (customer vs admin)
 */
export async function proxy(request) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { pathname } = request.nextUrl;

  // Get user session for all routes
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Admin routes - use Supabase authentication
  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/dashboard/admin");
  const isPublicAdminRoute =
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/admin/setup") ||
    pathname.startsWith("/admin/forgot-password");

  // Handle admin routes
  if (isAdminRoute) {
    // Allow public admin routes
    if (isPublicAdminRoute) {
      // Redirect authenticated admins away from login page
      if (pathname === "/admin/login" && user) {
        // Verify user is actually an admin before redirecting
        const { data: adminAccount } = await supabase
          .from("admin_accounts")
          .select("user_id")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .maybeSingle();

        if (adminAccount) {
          const redirectUrl = request.nextUrl.clone();
          redirectUrl.pathname = "/dashboard/admin";
          return NextResponse.redirect(redirectUrl);
        }
      }
      return supabaseResponse;
    }

    // Protected admin routes - require authentication and admin verification
    if (pathname.startsWith("/dashboard/admin")) {
      if (!user) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/admin/login";
        return NextResponse.redirect(redirectUrl);
      }

      // Verify user is an admin
      const { data: adminAccount } = await supabase
        .from("admin_accounts")
        .select("user_id, is_active")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!adminAccount || !adminAccount.is_active) {
        // Not an admin or inactive - redirect to admin login
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/admin/login";
        return NextResponse.redirect(redirectUrl);
      }
    }

    return supabaseResponse;
  }

  // Customer routes - use Supabase authentication

  // Protected customer routes - require authentication
  const isProtectedRoute =
    pathname.startsWith("/dashboard/customer") ||
    pathname.startsWith("/account");

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Verify customer account exists for protected routes
  if (isProtectedRoute && user) {
    const { data: account } = await supabase
      .from("customer_accounts")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!account) {
      // User authenticated but no account record - redirect to login
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Redirect authenticated users away from customer login page
  if (pathname === "/login" && user) {
    // Check if user has a customer account
    const { data: account } = await supabase
      .from("customer_accounts")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (account) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard/customer";
      return NextResponse.redirect(redirectUrl);
    }
    // If no customer account, allow them to stay on login page
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't need auth
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
