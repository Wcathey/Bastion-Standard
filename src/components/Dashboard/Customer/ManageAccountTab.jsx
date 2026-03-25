'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// Phone number validation helper
function validatePhoneNumber(phone) {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length === 10
}

// Format phone number for display
function formatPhoneNumber(phone) {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

export default function ManageAccountTab({ user, onError, onAccountUpdate }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [showPhoneEdit, setShowPhoneEdit] = useState(false)

  // Local state for complete user profile (auth + account + orders + billing)
  const [userProfile, setUserProfile] = useState({
    currentUser: null,
    accountData: null,
    orders: null, // Will be populated when orders table is created
    billing: null, // Will be populated when Stripe is integrated
  })
  const [fetchingProfile, setFetchingProfile] = useState(true)

  const [phoneInput, setPhoneInput] = useState('')

  const [addressData, setAddressData] = useState({
    billing_address_line1: '',
    billing_address_line2: '',
    billing_city: '',
    billing_state: '',
    billing_postal_code: '',
    billing_country: 'US',
    shipping_address_line1: '',
    shipping_address_line2: '',
    shipping_city: '',
    shipping_state: '',
    shipping_postal_code: '',
    shipping_country: 'US',
    use_billing_as_shipping: true,
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [successMessage, setSuccessMessage] = useState('')

  // Fetch complete user profile from Supabase on component mount
  const fetchUserProfile = async () => {
    try {
      setFetchingProfile(true)

      // Get the authenticated user
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()

      if (userError) {
        console.error('Error fetching user:', userError)
        throw userError
      }

      if (!currentUser) {
        console.error('No authenticated user found')
        return
      }

      console.log('Fetched current user:', currentUser)

      // Query accounts table filtering where currentUser.id equals user_id column
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', currentUser.id)
        .single()

      if (accountError) {
        console.error('Error fetching account:', accountError)
        throw accountError
      }

      console.log('Fetched account data:', accountData)

      // TODO: Query orders table when it's created
      // const { data: orders } = await supabase
      //   .from('orders')
      //   .select('*')
      //   .eq('user_id', currentUser.id)

      // TODO: Query billing/payment methods when Stripe is integrated
      // This would pull from Stripe API or a billing table

      // Build complete user profile object
      const profile = {
        currentUser: currentUser,
        accountData: accountData,
        orders: null, // Will be populated when orders table exists
        billing: null, // Will be populated when Stripe is integrated
      }

      console.log('Complete user profile:', profile)
      setUserProfile(profile)

      // Update address data with fetched account data
      if (accountData) {
        setAddressData({
          billing_address_line1: accountData.billing_address_line1 || '',
          billing_address_line2: accountData.billing_address_line2 || '',
          billing_city: accountData.billing_city || '',
          billing_state: accountData.billing_state || '',
          billing_postal_code: accountData.billing_postal_code || '',
          billing_country: accountData.billing_country || 'US',
          shipping_address_line1: accountData.shipping_address_line1 || '',
          shipping_address_line2: accountData.shipping_address_line2 || '',
          shipping_city: accountData.shipping_city || '',
          shipping_state: accountData.shipping_state || '',
          shipping_postal_code: accountData.shipping_postal_code || '',
          shipping_country: accountData.shipping_country || 'US',
          use_billing_as_shipping: accountData.use_billing_as_shipping ?? true,
        })
      }
    } catch (err) {
      console.error('Error in fetchUserProfile:', err)
      if (onError) {
        onError('Failed to load user profile. Please refresh the page.')
      }
    } finally {
      setFetchingProfile(false)
    }
  }

  // Fetch user profile on mount
  useEffect(() => {
    fetchUserProfile()
  }, [])

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const handlePhoneUpdate = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      onError(null)

      const cleaned = phoneInput.replace(/\D/g, '')

      if (!validatePhoneNumber(phoneInput)) {
        throw new Error('Please enter a valid 10-digit phone number')
      }

      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) throw new Error('No authenticated user')

      const { error } = await supabase
        .from('accounts')
        .update({ phone: cleaned })
        .eq('user_id', authUser.id)

      if (error) throw error

      setSuccessMessage('Phone number updated successfully!')
      setShowPhoneEdit(false)
      setPhoneInput('')

      // Refresh user profile from Supabase
      await fetchUserProfile()
      if (onAccountUpdate) await onAccountUpdate()
    } catch (err) {
      onError(err.message || 'Failed to update phone number. Please try again.')
      console.error('Phone update error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddressUpdate = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      onError(null)

      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) throw new Error('No authenticated user')

      const { error } = await supabase
        .from('accounts')
        .update(addressData)
        .eq('user_id', authUser.id)

      if (error) throw error

      setSuccessMessage('Address updated successfully!')

      // Refresh user profile from Supabase
      await fetchUserProfile()
      if (onAccountUpdate) await onAccountUpdate()
    } catch (err) {
      onError('Failed to update address. Please try again.')
      console.error('Address update error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      onError(null)

      // Validate inputs
      if (!passwordData.currentPassword) {
        throw new Error('Current password is required')
      }

      if (!passwordData.newPassword || !passwordData.confirmPassword) {
        throw new Error('Please fill in all password fields')
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('New passwords do not match')
      }

      if (passwordData.newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long')
      }

      if (passwordData.currentPassword === passwordData.newPassword) {
        throw new Error('New password must be different from current password')
      }

      // Get current user email
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        throw new Error('Unable to verify user identity')
      }

      // Verify current password by attempting to sign in
      // This is the security check - we don't change password unless we confirm the user knows the current one
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordData.currentPassword,
      })

      if (signInError) {
        throw new Error('Current password is incorrect')
      }

      // Current password verified, now update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (updateError) throw updateError

      setSuccessMessage('Password changed successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordChange(false)
    } catch (err) {
      onError(err.message || 'Failed to change password. Please try again.')
      console.error('Password change error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setLoading(true)
      onError(null)

      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) throw new Error('No authenticated user')

      // Check if user has active orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, ordered_on, shipped_on, delivered_on')
        .eq('account_id', userProfile.accountData?.id)

      if (ordersError && ordersError.code !== 'PGRST116') {
        // PGRST116 is "table does not exist" error - ignore it for now
        throw ordersError
      }

      // Check if there are any active orders (not delivered)
      const activeOrders = orders?.filter(order => !order.delivered_on) || []

      if (activeOrders.length > 0) {
        throw new Error(
          `You have ${activeOrders.length} active order(s). Please wait until all orders are delivered before deleting your account.`
        )
      }

      const { error: deleteError } = await supabase
        .from('accounts')
        .delete()
        .eq('user_id', authUser.id)

      if (deleteError) throw deleteError

      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch (err) {
      onError(err.message || 'Failed to delete account. Please contact support.')
      console.error('Account deletion error:', err)
      setShowDeleteConfirm(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Personal Information - Display Only */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Personal Information
        </h2>
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                {fetchingProfile ? 'Loading...' : (userProfile.accountData?.first_name || 'Not set')}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                {fetchingProfile ? 'Loading...' : (userProfile.accountData?.last_name || 'Not set')}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
              {user?.email}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Contact support to change your email address
            </p>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            {!showPhoneEdit ? (
              <div className="flex items-center gap-3">
                {fetchingProfile ? (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 flex-1">
                    Loading...
                  </div>
                ) : userProfile.accountData?.phone ? (
                  <>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 flex-1">
                      {formatPhoneNumber(userProfile.accountData.phone)}
                    </div>
                    <button
                      onClick={() => {
                        setPhoneInput(userProfile.accountData.phone)
                        setShowPhoneEdit(true)
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Edit
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowPhoneEdit(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M12 4v16m8-8H4" />
                    </svg>
                    Add Phone Number
                  </button>
                )}
              </div>
            ) : (
              <form onSubmit={handlePhoneUpdate} className="space-y-3">
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    setPhoneInput(value)
                  }}
                  placeholder="1234567890"
                  maxLength="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
                <p className="text-xs text-gray-500">
                  Enter 10-digit phone number (numbers only)
                </p>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading || phoneInput.length !== 10}
                    className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPhoneEdit(false)
                      setPhoneInput('')
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Address Management - keeping rest of the component the same */}
      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Address Management
        </h2>
        <form onSubmit={handleAddressUpdate} className="space-y-6">
          {/* Billing Address */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Billing Address
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1
                </label>
                <input
                  type="text"
                  value={addressData.billing_address_line1}
                  onChange={(e) =>
                    setAddressData({
                      ...addressData,
                      billing_address_line1: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={addressData.billing_address_line2}
                  onChange={(e) =>
                    setAddressData({
                      ...addressData,
                      billing_address_line2: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={addressData.billing_city}
                    onChange={(e) =>
                      setAddressData({
                        ...addressData,
                        billing_city: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={addressData.billing_state}
                    onChange={(e) =>
                      setAddressData({
                        ...addressData,
                        billing_state: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    value={addressData.billing_postal_code}
                    onChange={(e) =>
                      setAddressData({
                        ...addressData,
                        billing_postal_code: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Use Billing as Shipping Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="use_billing_as_shipping"
              checked={addressData.use_billing_as_shipping}
              onChange={(e) =>
                setAddressData({
                  ...addressData,
                  use_billing_as_shipping: e.target.checked,
                })
              }
              className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
            />
            <label
              htmlFor="use_billing_as_shipping"
              className="ml-2 block text-sm text-gray-700"
            >
              Use billing address as shipping address
            </label>
          </div>

          {/* Shipping Address (only if different from billing) */}
          {!addressData.use_billing_as_shipping && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Shipping Address
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    value={addressData.shipping_address_line1}
                    onChange={(e) =>
                      setAddressData({
                        ...addressData,
                        shipping_address_line1: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={addressData.shipping_address_line2}
                    onChange={(e) =>
                      setAddressData({
                        ...addressData,
                        shipping_address_line2: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={addressData.shipping_city}
                      onChange={(e) =>
                        setAddressData({
                          ...addressData,
                          shipping_city: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={addressData.shipping_state}
                      onChange={(e) =>
                        setAddressData({
                          ...addressData,
                          shipping_state: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      value={addressData.shipping_postal_code}
                      onChange={(e) =>
                        setAddressData({
                          ...addressData,
                          shipping_postal_code: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Saving...' : 'Save Address'}
          </button>
        </form>
      </div>

      {/* Security Settings */}
      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Security Settings
        </h2>

        {!showPasswordChange ? (
          <button
            onClick={() => setShowPasswordChange(true)}
            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Change Password
          </button>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Security:</strong> You must enter your current password to verify your identity before changing to a new password.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                required
                placeholder="Enter your current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                required
                minLength={8}
                placeholder="Enter new password"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordChange(false)
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                }}
                className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Subscription */}
      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Subscription
        </h2>
        <div className="bg-gray-50 border border-gray-200 rounded-md p-6">
          <h3 className="font-medium text-gray-900 mb-2">Premium Membership</h3>
          <p className="text-sm text-gray-600 mb-4">
            Get exclusive access to premium features, early product releases, and
            special discounts.
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-600 rounded-md text-sm">
            Coming Soon
          </div>
        </div>
      </div>

      {/* Delete Account */}
      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Danger Zone
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-6">
          <h3 className="font-medium text-red-900 mb-2">Request for Account Deletion</h3>
          <p className="text-sm text-red-700 mb-4">
            Once you delete your account, there is no going back. Please be certain. You can continue to check out as a guest even after account deletion.
          </p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Request for Account Deletion
          </button>
        </div>
      </div>

      {/* Account Deletion Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Delete Your Account?
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <p className="text-sm text-gray-700 mb-4">
              You can continue to check out as a guest. You can only delete your account if no active orders are linked to your account.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
