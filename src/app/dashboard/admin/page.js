import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/Dashboard/AdminDashboard'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch account data
  const { data: account } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Ensure user is an admin
  if (!account || account.user_type !== 'admin') {
    redirect('/dashboard/customer')
  }

  return <AdminDashboard user={user} account={account} />
}
