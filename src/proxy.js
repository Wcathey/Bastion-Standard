import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

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
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { pathname } = request.nextUrl

  // Admin routes - separate authentication (JWT-based, not Supabase)
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/dashboard/admin')
  const isPublicAdminRoute = pathname.startsWith('/admin/login') ||
                             pathname.startsWith('/admin/setup') ||
                             pathname.startsWith('/admin/forgot-password')

  // Handle admin routes separately
  if (isAdminRoute) {
    // Allow public admin routes
    if (isPublicAdminRoute) {
      return supabaseResponse
    }

    // Check for admin session cookie
    const adminSession = request.cookies.get('admin_session')
    if (!adminSession && pathname.startsWith('/dashboard/admin')) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/admin/login'
      return NextResponse.redirect(redirectUrl)
    }

    return supabaseResponse
  }

  // Customer routes - use Supabase authentication
  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected customer routes - require authentication
  const isProtectedRoute =
    pathname.startsWith('/dashboard/customer') || pathname.startsWith('/account')

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from customer login page
  if (pathname === '/login' && user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard/customer'
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
