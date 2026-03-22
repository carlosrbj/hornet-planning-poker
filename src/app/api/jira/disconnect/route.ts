import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${APP_URL}/login`)

  await supabase
    .from('jira_connections')
    .delete()
    .eq('user_id', user.id)

  return NextResponse.redirect(`${APP_URL}/settings/jira`)
}
