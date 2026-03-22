import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types/database'

type JiraConnection = Database['public']['Tables']['jira_connections']['Row']

export async function getValidToken(userId: string): Promise<{ token: string; cloudId: string } | null> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('jira_connections')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!data) return null
  const connection = data as JiraConnection

  const expiresAt = new Date(connection.token_expires_at)
  const isExpired = expiresAt.getTime() - Date.now() < 5 * 60 * 1000 // renova 5min antes

  if (isExpired) {
    const refreshed = await refreshToken(connection)
    if (!refreshed) return null
    return { token: refreshed, cloudId: connection.cloud_id }
  }

  return { token: connection.access_token, cloudId: connection.cloud_id }
}

async function refreshToken(connection: JiraConnection): Promise<string | null> {
  const supabase = await createClient()

  const res = await fetch('https://auth.atlassian.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      client_id: process.env.JIRA_CLIENT_ID,
      client_secret: process.env.JIRA_CLIENT_SECRET,
      refresh_token: connection.refresh_token,
    }),
  })

  if (!res.ok) return null

  const data = await res.json() as {
    access_token: string
    refresh_token: string
    expires_in: number
  }

  const expiresAt = new Date(Date.now() + data.expires_in * 1000)

  await supabase
    .from('jira_connections')
    .update({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', connection.id)

  return data.access_token
}
