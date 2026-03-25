import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

/**
 * Admin Login API Route
 * POST /api/admin/auth/login
 * Body: { employeeId, password }
 */
export async function POST(request) {
  try {
    const { employeeId, password } = await request.json()

    if (!employeeId || !password) {
      return NextResponse.json(
        { error: 'Employee ID and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch admin account by employee ID
    const { data: admin, error: fetchError } = await supabase
      .from('admin_accounts')
      .select('*')
      .eq('employee_id', employeeId.toUpperCase())
      .eq('is_active', true)
      .single()

    if (fetchError || !admin) {
      return NextResponse.json(
        { error: 'Invalid employee ID or password' },
        { status: 401 }
      )
    }

    // Check if first-time login
    if (!admin.has_logged_in) {
      return NextResponse.json(
        {
          firstTimeLogin: true,
          adminId: admin.id,
          employeeId: admin.employee_id,
        },
        { status: 200 }
      )
    }

    // Verify password using RPC function
    const { data: isValid, error: verifyError } = await supabase.rpc(
      'verify_admin_password',
      {
        p_employee_id: employeeId.toUpperCase(),
        p_password: password,
      }
    )

    if (verifyError || !isValid) {
      return NextResponse.json(
        { error: 'Invalid employee ID or password' },
        { status: 401 }
      )
    }

    // Update last login time
    await supabase
      .from('admin_accounts')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', admin.id)

    // Create session token
    const token = await new SignJWT({
      adminId: admin.id,
      employeeId: admin.employee_id,
      role: 'admin',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(JWT_SECRET)

    // Store session in database
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    await supabase.from('admin_sessions').insert({
      admin_account_id: admin.id,
      session_token: token,
      expires_at: expiresAt.toISOString(),
    })

    // Set HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return NextResponse.json(
      {
        success: true,
        admin: {
          id: admin.id,
          employeeId: admin.employee_id,
          firstName: admin.first_name,
          lastName: admin.last_name,
          position: admin.position,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
