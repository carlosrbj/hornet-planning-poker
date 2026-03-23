import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserPlan } from '@/lib/billing/plans'
import BillingClient from './BillingClient'

export default async function BillingPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const planId = await getUserPlan(user.id)

  return <BillingClient currentPlanId={planId} />
}
