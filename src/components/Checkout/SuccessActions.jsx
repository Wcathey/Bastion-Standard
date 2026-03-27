import Link from "next/link";

export default function SuccessActions() {
  return (
    <div className="space-y-3">
      <Link
        href="/dashboard"
        className="block w-full px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-center"
      >
        View Dashboard
      </Link>
      <Link
        href="/"
        className="block w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-center"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
