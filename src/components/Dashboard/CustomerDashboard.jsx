'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import ManageAccountTab from './Customer/ManageAccountTab'
import BillingTab from './Customer/BillingTab'
import TrackOrdersTab from './Customer/TrackOrdersTab'
import SupportTab from './Customer/SupportTab'

// Helper function to get time-based greeting
function getTimeBasedGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

const TABS = [
  { id: 'account', label: 'Manage Account' },
  { id: 'billing', label: 'Billing' },
  { id: 'orders', label: 'Track Orders' },
  { id: 'support', label: 'Support' },
]

export default function CustomerDashboard({ user, account: initialAccount }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('account')
  const [error, setError] = useState(null)
  const [account, setAccount] = useState(initialAccount)

  const handleSignOut = async () => {
    try {
      setLoading(true)
      setError(null)
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError
      router.push('/')
      router.refresh()
    } catch (err) {
      setError('Failed to sign out. Please try again.')
      console.error('Sign out error:', err)
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => setError(null)

  // Check if email is verified using Supabase auth data
  const isEmailVerified = !!user?.email_confirmed_at

  // Function to refresh account data
  const refreshAccount = async () => {
    try {
      const { data: updatedAccount } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (updatedAccount) {
        setAccount(updatedAccount)
      }
    } catch (err) {
      console.error('Error refreshing account:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {getTimeBasedGreeting()}, {account?.first_name || 'Customer'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing out...' : 'Sign out'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 flex justify-between items-start">
            <div>
              <p className="text-sm text-red-800">
                <strong>Error:</strong> {error}
              </p>
            </div>
            <button
              onClick={clearError}
              className="text-red-800 hover:text-red-900 ml-4"
            >
              <span className="sr-only">Dismiss</span>
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Email Verification Notice - Only show if email is NOT verified */}
        {!isEmailVerified && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-sm text-yellow-800">
              <strong>Email not verified:</strong> Please check your inbox for a
              verification email to unlock all features.
            </p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 px-4 sm:px-6" aria-label="Tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    clearError()
                  }}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex-shrink-0
                    ${
                      activeTab === tab.id
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {activeTab === 'account' && (
              <ManageAccountTab
                user={user}
                account={account}
                onError={setError}
                onSuccess={clearError}
                onAccountUpdate={refreshAccount}
              />
            )}
            {activeTab === 'billing' && (
              <BillingTab
                user={user}
                account={account}
                onError={setError}
                onSuccess={clearError}
              />
            )}
            {activeTab === 'orders' && (
              <TrackOrdersTab
                user={user}
                account={account}
                onError={setError}
                onSuccess={clearError}
              />
            )}
            {activeTab === 'support' && (
              <SupportTab
                user={user}
                account={account}
                onError={setError}
                onSuccess={clearError}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
