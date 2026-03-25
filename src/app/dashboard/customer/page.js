import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CustomerDashboard from '@/components/Dashboard/CustomerDashboard'

export default async function CustomerDashboardPage() {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch account data
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // If no account exists, create one
  if (accountError?.code === 'PGRST116') {
    const { data: newAccount } = await supabase
      .from('accounts')
      .insert({
        user_id: user.id,
        first_name: user.user_metadata?.first_name || user.raw_user_meta_data?.first_name,
        last_name: user.user_metadata?.last_name || user.raw_user_meta_data?.last_name,
        email_verified: !!user.email_confirmed_at,
        user_type: 'customer',
      })
      .select()
      .single()

    return <CustomerDashboard user={user} account={newAccount} />
  }

  // Ensure user is a customer
  if (account?.user_type === 'admin') {
    redirect('/dashboard/admin')
  }

  // Update email_verified if email is confirmed
  if (user.email_confirmed_at && account && !account.email_verified) {
    await supabase
      .from('accounts')
      .update({ email_verified: true })
      .eq('user_id', user.id)

    account.email_verified = true
  }

  return <CustomerDashboard user={user} account={account} />
}
