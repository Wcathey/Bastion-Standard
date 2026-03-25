'use client'

import { useState } from 'react'
import Link from 'next/link'

// Dummy ACTIVE orders data (only processing, shipped, out_for_delivery)
// Delivered orders are moved to Billing tab as invoices
const DUMMY_ACTIVE_ORDERS = [
  {
    id: 'ORD-2024-002',
    date: '2024-03-18',
    status: 'shipped',
    items: [{ name: 'Survival Kit', quantity: 1, price: 149.99 }],
    total: 149.99,
    tracking_number: '1Z999AA10123456785',
    estimated_delivery: '2024-03-25',
  },
  {
    id: 'ORD-2024-003',
    date: '2024-03-15',
    status: 'processing',
    items: [
      { name: 'Camping Tent', quantity: 1, price: 299.99 },
      { name: 'Sleeping Bag', quantity: 2, price: 79.99 },
    ],
    total: 459.97,
    estimated_delivery: '2024-03-28',
  },
  {
    id: 'ORD-2024-004',
    date: '2024-03-22',
    status: 'out_for_delivery',
    items: [{ name: 'Tactical Flashlight', quantity: 3, price: 39.99 }],
    total: 119.97,
    tracking_number: '1Z999AA10123456786',
    estimated_delivery: '2024-03-24',
  },
]

const ORDER_STATUSES = {
  processing: {
    label: 'Processing',
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Your order is being prepared',
  },
  shipped: {
    label: 'Shipped',
    color: 'bg-blue-100 text-blue-800',
    description: 'Your order is on its way',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    color: 'bg-purple-100 text-purple-800',
    description: 'Your order is out for delivery',
  },
}

export default function TrackOrdersTab({ user, account, onError, onSuccess }) {
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [trackingInput, setTrackingInput] = useState('')

  const handleTrackOrder = (e) => {
    e.preventDefault()
    if (!trackingInput.trim()) {
      onError('Please enter a tracking number')
      return
    }
    // TODO: Implement actual order tracking
    onError('Order tracking integration coming soon.')
  }

  const getOrderProgress = (status) => {
    const steps = ['processing', 'shipped', 'out_for_delivery']
    const currentIndex = steps.indexOf(status)
    return ((currentIndex + 1) / steps.length) * 100
  }

  return (
    <div className="space-y-8">
      {/* Track Order by Number */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Track Your Order
        </h2>
        <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={trackingInput}
            onChange={(e) => setTrackingInput(e.target.value)}
            placeholder="Enter tracking number or order ID"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            Track
          </button>
        </form>
      </div>

      {/* Active Orders */}
      <div className="border-t pt-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Active Orders</h2>
            <p className="text-sm text-gray-500 mt-1">
              Orders currently being processed or in transit
            </p>
          </div>
          <Link
            href="/products"
            className="text-sm font-medium text-black hover:underline"
          >
            Browse Products
          </Link>
        </div>

        {DUMMY_ACTIVE_ORDERS.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No active orders</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any orders in progress
            </p>
            <div className="mt-6">
              <Link
                href="/products"
                className="inline-flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {DUMMY_ACTIVE_ORDERS.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-gray-500">Order Number</p>
                      <p className="font-medium text-gray-900">{order.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Order Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="font-medium text-gray-900">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      ORDER_STATUSES[order.status].color
                    }`}
                  >
                    {ORDER_STATUSES[order.status].label}
                  </span>
                </div>

                {/* Order Details */}
                <div className="px-6 py-4">
                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Tracking Information */}
                  {order.status !== 'processing' && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900">
                          Delivery Progress
                        </p>
                        <p className="text-xs text-gray-500">
                          Est. delivery: {new Date(
                            order.estimated_delivery
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div
                          className="bg-black h-2 rounded-full transition-all duration-500"
                          style={{ width: `${getOrderProgress(order.status)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span className="font-semibold text-black">
                          Processing
                        </span>
                        <span
                          className={
                            order.status === 'shipped' || order.status === 'out_for_delivery'
                              ? 'font-semibold text-black'
                              : ''
                          }
                        >
                          Shipped
                        </span>
                        <span
                          className={
                            order.status === 'out_for_delivery'
                              ? 'font-semibold text-black'
                              : ''
                          }
                        >
                          Out for Delivery
                        </span>
                      </div>
                      {order.tracking_number && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-gray-600">
                            Tracking Number:{' '}
                            <span className="font-mono font-medium text-gray-900">
                              {order.tracking_number}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {order.status === 'processing' && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600">
                        <strong>Status:</strong> {ORDER_STATUSES[order.status].description}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Estimated delivery: {new Date(
                          order.estimated_delivery
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {/* Order Actions */}
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() =>
                        setSelectedOrder(
                          selectedOrder === order.id ? null : order.id
                        )
                      }
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      View Details
                    </button>
                    {order.status === 'processing' && (
                      <button className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50 transition-colors">
                        Cancel Order
                      </button>
                    )}
                    {order.tracking_number && (
                      <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        Track Package
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="border-t pt-8">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Once your order is delivered, it will be moved to the
            Billing tab where you can view the invoice and download receipt.
          </p>
        </div>
      </div>
    </div>
  )
}
