import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types/database'

type JiraConnection = Database['public']['Tables']['jira_connections']['Row']

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('jira_connections')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!data) return NextResponse.json({ error: 'Jira não conectado' }, { status: 404 })

  const connection = data as JiraConnection

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

  if (!res.ok) {
    return NextResponse.json({ error: 'Falha ao atualizar token. Reconecte o Jira.' }, { status: 400 })
  }

  const tokenData = await res.json() as {
    access_token: string
    refresh_token: string
    expires_in: number
  }

  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)

  await supabase
    .from('jira_connections')
    .update({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', connection.id)

  return NextResponse.json({
    ok: true,
    expires_at: expiresAt.toISOString(),
  })
}
