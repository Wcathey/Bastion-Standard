"use client";

import { useState } from "react";

// Dummy payment methods
const DUMMY_PAYMENT_METHODS = [
  {
    id: "1",
    type: "card",
    brand: "Visa",
    last4: "4242",
    exp_month: 12,
    exp_year: 2025,
    is_default: true,
  },
  {
    id: "2",
    type: "card",
    brand: "Mastercard",
    last4: "5555",
    exp_month: 6,
    exp_year: 2026,
    is_default: false,
  },
];

// Dummy invoices (completed orders)
const DUMMY_INVOICES = [
  {
    id: "INV-2024-001",
    order_id: "ORD-2024-001",
    date: "2024-03-15",
    amount: 49.99,
    status: "paid",
    description: "Order #ORD-2024-001",
    payment_method_last4: "4242",
  },
  {
    id: "INV-2024-002",
    order_id: "ORD-2023-045",
    date: "2024-02-15",
    amount: 129.99,
    status: "paid",
    description: "Order #ORD-2023-045",
    payment_method_last4: "4242",
  },
  {
    id: "INV-2024-003",
    order_id: "ORD-2023-023",
    date: "2024-01-15",
    amount: 79.99,
    status: "paid",
    description: "Order #ORD-2023-023",
    payment_method_last4: "5555",
  },
];

export default function BillingTab({ user, account, onError, onSuccess }) {
  const [showAddPayment, setShowAddPayment] = useState(false);

  const handleAddPaymentMethod = (e) => {
    e.preventDefault();
    // TODO: Integrate with Stripe
    onError(
      "Payment integration coming soon. This feature requires Stripe setup.",
    );
    setShowAddPayment(false);
  };

  const handleSetDefault = (_methodId) => {
    // TODO: Integrate with Stripe
    onError(
      "Payment integration coming soon. This feature requires Stripe setup.",
    );
  };

  const handleRemovePayment = (_methodId) => {
    // TODO: Integrate with Stripe
    onError(
      "Payment integration coming soon. This feature requires Stripe setup.",
    );
  };

  const handleDownloadInvoice = (_invoiceId) => {
    // TODO: Integrate with Stripe
    onError(
      "Invoice download coming soon. This feature requires Stripe setup.",
    );
  };

  return (
    <div className="space-y-8">
      {/* Stripe Integration Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Payment and billing features are currently
          using dummy data. Stripe integration is required to enable full
          functionality.
        </p>
      </div>

      {/* Payment Methods */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Payment Methods
          </h2>
          <button
            onClick={() => setShowAddPayment(!showAddPayment)}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm"
          >
            {showAddPayment ? "Cancel" : "Add Payment Method"}
          </button>
        </div>

        {/* Add Payment Form */}
        {showAddPayment && (
          <div className="mb-6 bg-gray-50 border border-gray-200 rounded-md p-6">
            <h3 className="font-medium text-gray-900 mb-4">
              Add New Payment Method
            </h3>
            <form onSubmit={handleAddPaymentMethod} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  disabled
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVC
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    disabled
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                Add Card
              </button>
              <p className="text-xs text-gray-500">
                This is a demo form. Stripe integration required for real
                payments.
              </p>
            </form>
          </div>
        )}

        {/* Payment Methods List */}
        <div className="space-y-4">
          {DUMMY_PAYMENT_METHODS.map((method) => (
            <div
              key={method.id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                  {method.brand === "Visa" && (
                    <span className="text-xs font-bold text-blue-600">
                      VISA
                    </span>
                  )}
                  {method.brand === "Mastercard" && (
                    <span className="text-xs font-bold text-red-600">MC</span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {method.brand} •••• {method.last4}
                  </p>
                  <p className="text-sm text-gray-500">
                    Expires {method.exp_month}/{method.exp_year}
                  </p>
                </div>
                {method.is_default && (
                  <span className="px-2 py-1 bg-black text-white text-xs rounded">
                    Default
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {!method.is_default && (
                  <button
                    onClick={() => handleSetDefault(method.id)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Set as Default
                  </button>
                )}
                <button
                  onClick={() => handleRemovePayment(method.id)}
                  className="px-3 py-1 border border-red-300 rounded-md text-sm text-red-700 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billing History / Previous Orders */}
      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Previous Orders & Invoices
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          View completed orders and download invoices
        </p>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {DUMMY_INVOICES.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.order_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(invoice.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${invoice.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    •••• {invoice.payment_method_last4}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        invoice.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleDownloadInvoice(invoice.id)}
                      className="text-black hover:underline"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {DUMMY_INVOICES.length === 0 && (
          <div className="text-center py-8 bg-white border border-gray-200 rounded-lg">
            <p className="text-gray-500">No previous orders available</p>
          </div>
        )}
      </div>
    </div>
  );
}
