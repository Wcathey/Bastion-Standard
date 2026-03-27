export default function OrderReference({ sessionId }) {
  if (!sessionId) return null;

  return (
    <div className="bg-gray-50 rounded-md p-4 mb-6">
      <p className="text-sm text-gray-500 mb-1">Order Reference</p>
      <p className="text-xs font-mono text-gray-700 break-all">{sessionId}</p>
    </div>
  );
}
