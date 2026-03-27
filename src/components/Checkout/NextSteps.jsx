export default function NextSteps() {
  return (
    <div className="text-left mb-6">
      <h2 className="font-semibold text-gray-900 mb-2">What's Next?</h2>
      <ul className="text-sm text-gray-600 space-y-2">
        <li className="flex items-start">
          <svg
            className="h-5 w-5 text-green-500 mr-2 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>You will receive a confirmation email shortly</span>
        </li>
        <li className="flex items-start">
          <svg
            className="h-5 w-5 text-green-500 mr-2 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Track your order status in your dashboard</span>
        </li>
        <li className="flex items-start">
          <svg
            className="h-5 w-5 text-green-500 mr-2 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Your order will be processed within 1-2 business days</span>
        </li>
      </ul>
    </div>
  );
}
