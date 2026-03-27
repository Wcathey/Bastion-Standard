export default function ErrorDisplay({ error }) {
  if (!error) return null;

  return (
    <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
      <p className="text-sm text-red-800">{error}</p>
    </div>
  );
}
