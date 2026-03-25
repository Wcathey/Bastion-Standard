import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Admin Password Reset API Route (using security question)
 * POST /api/admin/auth/reset-password
 * Body: {
 *   employeeId,
 *   questionId,
 *   answer,
 *   newPassword
 * }
 */
export async function POST(request) {
  try {
    const { employeeId, questionId, answer, newPassword } = await request.json()

    if (!employeeId || !questionId || !answer || !newPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch admin account
    const { data: admin, error: fetchError } = await supabase
      .from('admin_accounts')
      .select('*')
      .eq('employee_id', employeeId.toUpperCase())
      .eq('is_active', true)
      .single()

    if (fetchError || !admin) {
      return NextResponse.json(
        { error: 'Invalid employee ID' },
        { status: 401 }
      )
    }

    // Check if admin has completed setup
    if (!admin.has_logged_in || !admin.security_answers) {
      return NextResponse.json(
        { error: 'Account not fully set up' },
        { status: 400 }
      )
    }

    // Find the security question in the admin's answers
    const securityAnswer = admin.security_answers.find(
      (sa) => sa.question_id === questionId
    )

    if (!securityAnswer) {
      return NextResponse.json(
        { error: 'Security question not found for this account' },
        { status: 400 }
      )
    }

    // Verify the answer
    const { data: isValid } = await supabase.rpc('verify_security_answer', {
      answer: answer,
      hash: securityAnswer.answer_hash,
    })

    if (!isValid) {
      return NextResponse.json(
        { error: 'Incorrect answer to security question' },
        { status: 401 }
      )
    }

    // Hash new password
    const { data: newPasswordHash } = await supabase.rpc('hash_admin_password', {
      p_password: newPassword,
    })

    // Update password
    const { error: updateError } = await supabase
      .from('admin_accounts')
      .update({ password_hash: newPasswordHash })
      .eq('id', admin.id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Password reset successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'An error occurred during password reset' },
      { status: 500 }
    )
  }
}
