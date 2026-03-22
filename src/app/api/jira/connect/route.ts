import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

export async function GET() {
  // Guard: fail early with a readable error if Jira credentials are not configured
  if (!process.env.JIRA_CLIENT_ID || !process.env.JIRA_CLIENT_SECRET) {
    return NextResponse.redirect(
      `${APP_URL}/settings/jira?error=jira_not_configured`
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${APP_URL}/login`)
  }

  const state = crypto.randomUUID()
  const cookieStore = await cookies()
  cookieStore.set('jira_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600,
    path: '/',
  })

  const params = new URLSearchParams({
    audience: 'api.atlassian.com',
    client_id: process.env.JIRA_CLIENT_ID,
    scope: 'read:jira-work write:jira-work read:sprint:jira-software offline_access',
    redirect_uri: process.env.JIRA_REDIRECT_URI!,
    state,
    response_type: 'code',
    prompt: 'consent',
  })

  return NextResponse.redirect(
    `https://auth.atlassian.com/authorize?${params.toString()}`
  )
}
