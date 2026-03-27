import Link from "next/link";

export default function FAQNeedHelp() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Still need help?
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Visit our support center for more assistance options.
      </p>
      <Link
        href="/support"
        className="inline-block px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm"
      >
        Contact Support
      </Link>
    </div>
  );
}
