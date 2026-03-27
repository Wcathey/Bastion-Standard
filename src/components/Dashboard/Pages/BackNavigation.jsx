"use client";

export default function BackNavigation() {
  return (
    <div className="mb-6">
      <button
        onClick={() => window.history.back()}
        className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
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
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Back to Account
      </button>
    </div>
  );
}
