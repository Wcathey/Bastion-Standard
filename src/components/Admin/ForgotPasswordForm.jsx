'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ForgotPasswordForm() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState(1) // 1: Enter Employee ID, 2: Select Question, 3: Answer & Reset

  const [employeeId, setEmployeeId] = useState('')
  const [selectedQuestionId, setSelectedQuestionId] = useState('')
  const [answer, setAnswer] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [userQuestions, setUserQuestions] = useState([])

  const handleEmployeeIdSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Fetch admin account to get their security questions
      const { data: admin, error: fetchError } = await supabase
        .from('admin_accounts')
        .select('id, security_answers')
        .eq('employee_id', employeeId.toUpperCase())
        .eq('is_active', true)
        .single()

      if (fetchError || !admin) {
        throw new Error('Employee ID not found')
      }

      if (!admin.security_answers || admin.security_answers.length === 0) {
        throw new Error('No security questions set up for this account')
      }

      // Fetch the actual questions
      const questionIds = admin.security_answers.map((sa) => sa.question_id)
      const { data: questions } = await supabase
        .from('security_questions')
        .select('*')
        .in('id', questionIds)

      setUserQuestions(questions || [])
      setStep(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: employeeId.toUpperCase(),
          questionId: selectedQuestionId,
          answer,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Password reset failed')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/login')
      }, 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="max-w-md w-full text-center bg-gray-800 p-8 rounded-lg">
          <div className="mb-4 text-green-400 text-5xl">✓</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Password Reset Successfully
          </h2>
          <p className="text-gray-400 mb-4">
            Redirecting to login page...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-400">
            Answer a security question to reset your password
          </p>
          <div className="mt-4 flex justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-16 rounded-full ${
                  s <= step ? 'bg-red-600' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Enter Employee ID */}
        {step === 1 && (
          <form onSubmit={handleEmployeeIdSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg">
            <div>
              <label
                htmlFor="employeeId"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Employee ID
              </label>
              <input
                id="employeeId"
                type="text"
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="EMP-XXXXXXXX-XXXX"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Continue'}
            </button>
            <Link
              href="/admin/login"
              className="block text-center text-sm text-gray-400 hover:text-white hover:underline"
            >
              ← Back to Login
            </Link>
          </form>
        )}

        {/* Step 2: Select Security Question */}
        {step === 2 && (
          <div className="space-y-6 bg-gray-800 p-6 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Select a Security Question
              </label>
              <div className="space-y-2">
                {userQuestions.map((question) => (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => {
                      setSelectedQuestionId(question.id)
                      setStep(3)
                    }}
                    className="w-full text-left px-4 py-3 bg-gray-900 border border-gray-700 rounded-md text-white hover:border-red-500 hover:bg-gray-850 transition-colors"
                  >
                    {question.question_text}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-3 px-4 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700"
            >
              Back
            </button>
          </div>
        )}

        {/* Step 3: Answer Question & Set New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-6 bg-gray-800 p-6 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Security Question
              </label>
              <p className="text-white bg-gray-900 p-3 rounded-md">
                {userQuestions.find((q) => q.id === selectedQuestionId)?.question_text}
              </p>
            </div>

            <div>
              <label htmlFor="answer" className="block text-sm font-medium text-gray-300 mb-1">
                Your Answer
              </label>
              <input
                id="answer"
                type="text"
                required
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="border-t border-gray-700 pt-4">
              <div className="mb-4">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Must be at least 8 characters long
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep(2)
                  setAnswer('')
                  setNewPassword('')
                  setConfirmPassword('')
                }}
                disabled={loading}
                className="flex-1 py-3 px-4 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
