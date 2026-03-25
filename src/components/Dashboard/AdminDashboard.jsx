'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminDashboard({ user, account }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
              ADMIN
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Welcome, {account?.first_name || 'Admin'} ({user?.email})
          </p>
        </div>
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? 'Signing out...' : 'Sign out'}
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500 mb-1">Total Sales</p>
          <p className="text-3xl font-bold text-gray-900">$0</p>
          <p className="text-sm text-green-600 mt-2">+0% from last month</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500 mb-1">Orders</p>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600 mt-2">0 pending</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500 mb-1">Customers</p>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-green-600 mt-2">+0 new this week</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500 mb-1">Products</p>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-600 mt-2">0 in stock</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Orders
            </h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-500">No orders yet</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h2>
          </div>
          <div className="p-6 space-y-3">
            <button className="w-full text-left px-4 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
              + Add Product
            </button>
            <button className="w-full text-left px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              View All Orders
            </button>
            <button className="w-full text-left px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              Manage Inventory
            </button>
            <button className="w-full text-left px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              View Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inventory Management */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Inventory Management
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Track and manage your product inventory
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Products:</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Low Stock Items:</span>
              <span className="font-medium text-yellow-600">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Out of Stock:</span>
              <span className="font-medium text-red-600">0</span>
            </div>
          </div>
        </div>

        {/* Analytics & Reports */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Analytics & Reports
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            View detailed analytics and generate reports
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Revenue (MTD):</span>
              <span className="font-medium">$0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Profit Margin:</span>
              <span className="font-medium">0%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Order Value:</span>
              <span className="font-medium">$0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Note about future features */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This is the admin dashboard foundation. Future
          features will include: product management, order processing, customer
          management, inventory tracking, analytics, schedules, and full CRM
          functionality. 2FA authentication will be added for enhanced admin
          security.
        </p>
      </div>
    </div>
  )
}
