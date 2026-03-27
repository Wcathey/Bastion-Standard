import Link from "next/link";

export default function FAQLink() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Frequently Asked Questions
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Find answers to common questions about orders, returns, account
        management, and products.
      </p>
      <Link
        href="/faqs"
        className="inline-block px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm"
      >
        View FAQs
      </Link>
    </div>
  );
}
