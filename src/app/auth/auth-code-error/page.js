import Link from 'next/link'

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Authentication Error
        </h1>
        <p className="text-gray-600 mb-8">
          There was an error verifying your email. The link may have expired or
          already been used.
        </p>
        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full bg-black text-white py-3 px-6 rounded-md hover:bg-gray-800 transition-colors"
          >
            Go to Login
          </Link>
          <Link
            href="/"
            className="block w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-50 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}
