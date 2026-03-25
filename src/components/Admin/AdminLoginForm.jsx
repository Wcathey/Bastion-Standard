'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showPasswordReset, setShowPasswordReset] = useState(false)

  const [formData, setFormData] = useState({
    employeeId: '',
    password: '',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError(null)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: formData.employeeId,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Check if first-time login
      if (data.firstTimeLogin) {
        // Redirect to setup page
        router.push(
          `/admin/setup?employeeId=${encodeURIComponent(formData.employeeId)}`
        )
        return
      }

      // Successful login - redirect to admin dashboard
      router.push('/dashboard/admin')
      router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h2 className="text-3xl font-bold text-white">Admin Login</h2>
            <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
              SECURE
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-400">
            Employee access only. Unauthorized access is prohibited.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="employeeId"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Employee ID
              </label>
              <input
                id="employeeId"
                name="employeeId"
                type="text"
                required
                value={formData.employeeId}
                onChange={handleChange}
                placeholder="EMP-XXXXXXXX-XXXX"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Additional Links */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowPasswordReset(!showPasswordReset)}
            className="w-full text-center text-sm text-gray-400 hover:text-white hover:underline"
          >
            Forgot your password?
          </button>

          {showPasswordReset && (
            <div className="bg-gray-800 border border-gray-700 rounded-md p-4">
              <p className="text-sm text-gray-300 mb-2">
                To reset your password, you'll need to answer one of your security
                questions.
              </p>
              <Link
                href="/admin/forgot-password"
                className="inline-block text-sm font-medium text-red-400 hover:text-red-300 hover:underline"
              >
                Continue to Password Reset →
              </Link>
            </div>
          )}

          <div className="pt-4 border-t border-gray-800">
            <Link
              href="/login"
              className="block text-center text-sm text-gray-400 hover:text-white hover:underline"
            >
              ← Customer Login
            </Link>
          </div>

          <div className="text-center text-xs text-gray-500 pt-4">
            <p>
              New employee? Contact your manager to receive your Employee ID.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
