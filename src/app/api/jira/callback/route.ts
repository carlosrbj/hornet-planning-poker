import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(`${APP_URL}/settings/jira?error=access_denied`)
  }

  // Validar CSRF state
  const cookieStore = await cookies()
  const savedState = cookieStore.get('jira_oauth_state')?.value
  cookieStore.delete('jira_oauth_state')

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(`${APP_URL}/settings/jira?error=invalid_state`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${APP_URL}/login`)

  // Trocar code por tokens
  const tokenRes = await fetch('https://auth.atlassian.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: process.env.JIRA_CLIENT_ID,
      client_secret: process.env.JIRA_CLIENT_SECRET,
      code,
      redirect_uri: process.env.JIRA_REDIRECT_URI,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${APP_URL}/settings/jira?error=token_exchange`)
  }

  const tokens = await tokenRes.json() as {
    access_token: string
    refresh_token: string
    expires_in: number
  }

  // Buscar cloudId
  const resourcesRes = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })

  if (!resourcesRes.ok) {
    return NextResponse.redirect(`${APP_URL}/settings/jira?error=resources`)
  }

  const resources = await resourcesRes.json() as Array<{ id: string; name: string }>
  const site = resources[0]

  if (!site) {
    return NextResponse.redirect(`${APP_URL}/settings/jira?error=no_site`)
  }

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)

  await supabase.from('jira_connections').upsert(
    {
      user_id: user.id,
      cloud_id: site.id,
      site_name: site.name,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,cloud_id' }
  )

  return NextResponse.redirect(`${APP_URL}/settings/jira?status=connected`)
}
