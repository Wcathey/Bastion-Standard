"use client";

export default function AIAssistant() {
  return (
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
  );
}
