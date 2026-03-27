"use client";

export default function ContactInformation() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
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
  );
}
