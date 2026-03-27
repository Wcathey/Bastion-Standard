import { createClient } from "@/lib/supabase/server";

export default async function TestDataPage() {
  const supabase = await createClient();

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-8">No user logged in</div>;
  }

  // Get account with explicit column selection
  const { data: account, error } = await supabase
    .from("customer_accounts")
    .select(
      "id, user_id, first_name, last_name, email, phone, user_type, created_at",
    )
    .eq("user_id", user.id)
    .single();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Database Test Page</h1>

      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Auth User Data</h2>
        <pre className="text-xs bg-white p-4 rounded overflow-auto">
          {JSON.stringify(
            {
              id: user.id,
              email: user.email,
              email_confirmed_at: user.email_confirmed_at,
              user_metadata: user.user_metadata,
              raw_user_meta_data: user.raw_user_meta_data,
            },
            null,
            2,
          )}
        </pre>
      </div>

      <div className="p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">
          Customer Accounts Table Data
        </h2>
        {error
          ? <div className="text-red-600">
              <p className="font-semibold">Error:</p>
              <pre className="text-xs bg-white p-4 rounded mt-2">
                {JSON.stringify(error, null, 2)}
              </pre>
            </div>
          : <pre className="text-xs bg-white p-4 rounded overflow-auto">
              {JSON.stringify(account, null, 2)}
            </pre>}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This page shows raw data from your database.
          Navigate to:{" "}
          <code className="bg-white px-2 py-1 rounded">
            /dashboard/customer/test-data
          </code>
        </p>
      </div>
    </div>
  );
}
