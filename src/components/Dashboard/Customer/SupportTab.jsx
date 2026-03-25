'use client'

import { useState } from 'react'

// FAQ Data
const FAQ_CATEGORIES = {
  orders: {
    title: 'Orders & Shipping',
    questions: [
      {
        q: 'How long does shipping take?',
        a: 'Standard shipping typically takes 5-7 business days. Expedited shipping options are available at checkout for faster delivery (2-3 business days).',
      },
      {
        q: 'Can I track my order?',
        a: 'Yes! Once your order ships, you\'ll receive an email with tracking information. You can also track your order in the "Track Orders" tab of your dashboard.',
      },
      {
        q: 'How can I cancel or modify my order?',
        a: 'Orders can be cancelled or modified within 2 hours of placement. After that, please contact our support team for assistance.',
      },
      {
        q: 'What are your shipping rates?',
        a: 'Shipping rates are calculated based on order weight and destination. Standard shipping starts at $5.99, and free shipping is available on orders over $50.',
      },
    ],
  },
  returns: {
    title: 'Returns & Refunds',
    questions: [
      {
        q: 'What is your return policy?',
        a: 'We offer a 30-day return policy on most items. Products must be unused and in original packaging. Some items like customized products are non-returnable.',
      },
      {
        q: 'How do I start a return?',
        a: 'Contact our support team through the contact form below or email support@bastionstandard.com with your order number and reason for return.',
      },
      {
        q: 'When will I receive my refund?',
        a: 'Refunds are processed within 5-7 business days of receiving your returned item. The refund will be issued to your original payment method.',
      },
      {
        q: 'Do I have to pay for return shipping?',
        a: 'Return shipping is free for defective or incorrect items. For other returns, customers are responsible for return shipping costs.',
      },
    ],
  },
  account: {
    title: 'Account & Security',
    questions: [
      {
        q: 'How do I reset my password?',
        a: 'You can change your password in the "Manage Account" tab under Security Settings. If you\'ve forgotten your password, use the "Forgot Password" link on the login page.',
      },
      {
        q: 'How do I update my account information?',
        a: 'Go to the "Manage Account" tab to update your personal information, addresses, and preferences.',
      },
      {
        q: 'Is my payment information secure?',
        a: 'Yes, we use industry-standard encryption and security measures. Payment information is processed securely through our payment provider and never stored on our servers.',
      },
      {
        q: 'How do I delete my account?',
        a: 'You can delete your account in the "Manage Account" tab under the Danger Zone section. Please note this action is permanent and cannot be undone.',
      },
    ],
  },
  products: {
    title: 'Products & Services',
    questions: [
      {
        q: 'Do you offer warranties on products?',
        a: 'Yes, most products come with a manufacturer\'s warranty. Warranty details are provided on each product page.',
      },
      {
        q: 'Can I get notifications for out-of-stock items?',
        a: 'Yes! On product pages, you can sign up for back-in-stock notifications. We\'ll email you when the item becomes available.',
      },
      {
        q: 'Do you offer bulk or wholesale pricing?',
        a: 'Yes, we offer special pricing for bulk orders. Please contact our sales team at sales@bastionstandard.com for more information.',
      },
      {
        q: 'Are your products authentic?',
        a: 'All products sold on Bastion Standard are 100% authentic and sourced directly from manufacturers or authorized distributors.',
      },
    ],
  },
}

export default function SupportTab({ user, account, onError, onSuccess }) {
  const [selectedCategory, setSelectedCategory] = useState('orders')
  const [expandedQuestions, setExpandedQuestions] = useState({})
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
  })
  const [showContactForm, setShowContactForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const toggleQuestion = (category, index) => {
    const key = `${category}-${index}`
    setExpandedQuestions({
      ...expandedQuestions,
      [key]: !expandedQuestions[key],
    })
  }

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      onError(null)

      if (!contactForm.subject || !contactForm.message) {
        throw new Error('Please fill in all fields')
      }

      // TODO: Implement actual support ticket system
      // This would typically send an email or create a support ticket
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onSuccess()
      setContactForm({ subject: '', message: '' })
      setShowContactForm(false)
      alert('Thank you for contacting us! We\'ll respond within 24 hours.')
    } catch (err) {
      onError(err.message || 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* AI Assistant Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              AI Support Assistant
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Get instant answers to your questions with our AI-powered support
              assistant. Available 24/7 to help with orders, products, and account
              questions.
            </p>
            <button
              disabled
              className="px-6 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed"
            >
              Coming Soon
            </button>
            <p className="text-xs text-gray-500 mt-2">
              This feature is currently under development
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Frequently Asked Questions
        </h2>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {Object.entries(FAQ_CATEGORIES).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === key
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.title}
            </button>
          ))}
        </div>

        {/* Questions */}
        <div className="space-y-3">
          {FAQ_CATEGORIES[selectedCategory].questions.map((faq, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleQuestion(selectedCategory, index)}
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors text-left"
              >
                <span className="font-medium text-gray-900">{faq.q}</span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    expandedQuestions[`${selectedCategory}-${index}`]
                      ? 'transform rotate-180'
                      : ''
                  }`}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              {expandedQuestions[`${selectedCategory}-${index}`] && (
                <div className="px-6 pb-4 pt-2 text-sm text-gray-600 border-t">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="border-t pt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Still Need Help?
          </h2>
          <button
            onClick={() => setShowContactForm(!showContactForm)}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm"
          >
            {showContactForm ? 'Close Form' : 'Contact Support'}
          </button>
        </div>

        {showContactForm && (
          <form
            onSubmit={handleContactSubmit}
            className="bg-white border border-gray-200 rounded-lg p-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={contactForm.subject}
                onChange={(e) =>
                  setContactForm({ ...contactForm, subject: e.target.value })
                }
                placeholder="Brief description of your issue"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={contactForm.message}
                onChange={(e) =>
                  setContactForm({ ...contactForm, message: e.target.value })
                }
                placeholder="Provide details about your question or issue"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black resize-none"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
              <button
                type="button"
                onClick={() => setShowContactForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-gray-500">
              We typically respond within 24 hours during business days
            </p>
          </form>
        )}

        {/* Contact Information */}
        {!showContactForm && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mb-3">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Email Support</h3>
              <p className="text-sm text-gray-600 mb-2">
                support@bastionstandard.com
              </p>
              <p className="text-xs text-gray-500">Response within 24 hours</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mb-3">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Phone Support</h3>
              <p className="text-sm text-gray-600 mb-2">1-800-BASTION</p>
              <p className="text-xs text-gray-500">Mon-Fri, 9AM-6PM EST</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mb-3">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Live Chat</h3>
              <p className="text-sm text-gray-600 mb-2">Available online</p>
              <p className="text-xs text-gray-500">Coming soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
