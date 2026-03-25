'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function FirstTimeAdminSetup({ employeeId }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [step, setStep] = useState(1) // 1: Password, 2: Security Questions, 3: Profile
  const [availableQuestions, setAvailableQuestions] = useState([])

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    securityQuestions: [
      { questionId: '', answer: '' },
      { questionId: '', answer: '' },
      { questionId: '', answer: '' },
      { questionId: '', answer: '' },
    ],
    firstName: '',
    lastName: '',
    position: '',
    email: '',
    phone: '',
    phoneExtension: '',
  })

  // Fetch security questions
  useEffect(() => {
    const fetchQuestions = async () => {
      const { data } = await supabase
        .from('security_questions')
        .select('*')
        .eq('is_active', true)
        .order('question_text')

      if (data) {
        setAvailableQuestions(data)
      }
    }
    fetchQuestions()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setError(null)
  }

  const handleSecurityQuestionChange = (index, field, value) => {
    const updated = [...formData.securityQuestions]
    updated[index][field] = value
    setFormData({ ...formData, securityQuestions: updated })
    setError(null)
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setStep(2)
  }

  const handleSecurityQuestionsSubmit = (e) => {
    e.preventDefault()

    // Validate all 4 questions are selected and answered
    for (let i = 0; i < 4; i++) {
      if (!formData.securityQuestions[i].questionId) {
        setError(`Please select security question ${i + 1}`)
        return
      }
      if (!formData.securityQuestions[i].answer.trim()) {
        setError(`Please answer security question ${i + 1}`)
        return
      }
    }

    // Check for duplicate questions
    const questionIds = formData.securityQuestions.map((sq) => sq.questionId)
    const uniqueIds = new Set(questionIds)
    if (uniqueIds.size !== 4) {
      setError('Please select 4 different security questions')
      return
    }

    setStep(3)
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.firstName || !formData.lastName) {
      setError('First name and last name are required')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/auth/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId,
          password: formData.password,
          securityQuestions: formData.securityQuestions,
          firstName: formData.firstName,
          lastName: formData.lastName,
          position: formData.position || 'other',
          email: formData.email,
          phone: formData.phone,
          phoneExtension: formData.phoneExtension,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Setup failed')
      }

      // Redirect back to login
      router.push('/admin/login?setup=success')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">First-Time Setup</h2>
          <p className="mt-2 text-sm text-gray-400">
            Employee ID: <span className="font-mono text-white">{employeeId}</span>
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
          <p className="mt-2 text-xs text-gray-500">
            Step {step} of 3:{' '}
            {step === 1
              ? 'Set Password'
              : step === 2
                ? 'Security Questions'
                : 'Profile Information'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Password */}
        {step === 1 && (
          <form onSubmit={handlePasswordSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-4">
              Create Your Password
            </h3>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
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
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Continue to Security Questions
            </button>
          </form>
        )}

        {/* Step 2: Security Questions */}
        {step === 2 && (
          <form onSubmit={handleSecurityQuestionsSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Set Up Security Questions
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Choose 4 security questions. You'll need to answer one of these to
                reset your password if you forget it.
              </p>
            </div>

            {formData.securityQuestions.map((sq, index) => (
              <div key={index} className="space-y-3 p-4 bg-gray-900 rounded-md">
                <label className="block text-sm font-medium text-gray-300">
                  Security Question {index + 1}
                </label>
                <select
                  value={sq.questionId}
                  onChange={(e) =>
                    handleSecurityQuestionChange(index, 'questionId', e.target.value)
                  }
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select a question...</option>
                  {availableQuestions.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.question_text}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Your answer"
                  value={sq.answer}
                  onChange={(e) =>
                    handleSecurityQuestionChange(index, 'answer', e.target.value)
                  }
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            ))}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 px-4 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Continue to Profile
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Profile Information */}
        {step === 3 && (
          <form onSubmit={handleProfileSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-4">
              Complete Your Profile
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
                  First Name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-300 mb-1">
                Position
              </label>
              <select
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select position...</option>
                <option value="owner">Owner</option>
                <option value="manager">Manager</option>
                <option value="sales_associate">Sales Associate</option>
                <option value="inventory_specialist">Inventory Specialist</option>
                <option value="customer_service">Customer Service</option>
                <option value="marketing">Marketing</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label
                  htmlFor="phoneExtension"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Ext.
                </label>
                <input
                  id="phoneExtension"
                  name="phoneExtension"
                  type="text"
                  placeholder="1234"
                  value={formData.phoneExtension}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
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
                {loading ? 'Completing Setup...' : 'Complete Setup'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
