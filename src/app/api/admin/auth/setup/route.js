import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Admin First-Time Setup API Route
 * POST /api/admin/auth/setup
 * Body: {
 *   employeeId,
 *   password,
 *   securityQuestions: [
 *     { questionId, answer },
 *     { questionId, answer },
 *     { questionId, answer },
 *     { questionId, answer }
 *   ],
 *   firstName,
 *   lastName,
 *   position,
 *   email,
 *   phone,
 *   phoneExtension
 * }
 */
export async function POST(request) {
  try {
    const {
      employeeId,
      password,
      securityQuestions,
      firstName,
      lastName,
      position,
      email,
      phone,
      phoneExtension,
    } = await request.json()

    // Validation
    if (!employeeId || !password || !securityQuestions || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (securityQuestions.length !== 4) {
      return NextResponse.json(
        { error: 'Exactly 4 security questions are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify admin account exists and hasn't been set up
    const { data: admin, error: fetchError } = await supabase
      .from('admin_accounts')
      .select('*')
      .eq('employee_id', employeeId.toUpperCase())
      .eq('has_logged_in', false)
      .single()

    if (fetchError || !admin) {
      return NextResponse.json(
        { error: 'Invalid employee ID or account already set up' },
        { status: 401 }
      )
    }

    // Hash security answers using database function
    const securityAnswersData = []
    for (const sq of securityQuestions) {
      const { data: hash } = await supabase.rpc('hash_security_answer', {
        answer: sq.answer,
      })

      securityAnswersData.push({
        question_id: sq.questionId,
        answer_hash: hash,
      })
    }

    // Hash password using database function
    const { data: passwordHash } = await supabase.rpc('hash_admin_password', {
      p_password: password,
    })

    // Update admin account with all information
    const { error: updateError } = await supabase
      .from('admin_accounts')
      .update({
        password_hash: passwordHash,
        security_answers: securityAnswersData,
        first_name: firstName,
        last_name: lastName,
        position: position,
        email: email,
        phone: phone || null,
        phone_extension: phoneExtension || null,
        has_logged_in: true,
      })
      .eq('id', admin.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to complete setup' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Account setup completed successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Admin setup error:', error)
    return NextResponse.json(
      { error: 'An error occurred during setup' },
      { status: 500 }
    )
  }
}
