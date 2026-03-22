import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getValidToken } from '@/lib/jira/auth'
import { updateIssueEstimate } from '@/lib/jira/api'

interface SyncItem {
  jiraIssueId: string
  jiraIssueKey: string
  estimate: number
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const auth = await getValidToken(user.id)
  if (!auth) return NextResponse.json({ error: 'Jira não conectado' }, { status: 403 })

  const body = await request.json() as { items: SyncItem[] }
  const results: { key: string; success: boolean; error?: string }[] = []

  for (const item of body.items) {
    try {
      await updateIssueEstimate(auth.cloudId, auth.token, item.jiraIssueId, item.estimate)
      results.push({ key: item.jiraIssueKey, success: true })
    } catch (err) {
      results.push({
        key: item.jiraIssueKey,
        success: false,
        error: err instanceof Error ? err.message : 'Erro',
      })
    }
  }

  return NextResponse.json({ results })
}
