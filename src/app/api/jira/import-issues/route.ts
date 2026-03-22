import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface ImportItem {
  title: string
  jira_issue_key: string
  jira_issue_id: string
  position: number
  jira_status?: string | null
  issue_type?: string | null
  criticality?: string | null
  assignee_name?: string | null
  reporter_name?: string | null
  deadline?: string | null
  spent_hours?: number | null
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as { roomId: string; issues: ImportItem[] }

  const { error } = await supabase.from('issues').insert(
    body.issues.map((item) => ({
      room_id: body.roomId,
      title: item.title,
      jira_issue_key: item.jira_issue_key,
      jira_issue_id: item.jira_issue_id,
      position: item.position,
      status: 'pending' as const,
      jira_status: item.jira_status ?? null,
      issue_type: item.issue_type ?? null,
      criticality: item.criticality ?? null,
      assignee_name: item.assignee_name ?? null,
      reporter_name: item.reporter_name ?? null,
      deadline: item.deadline ?? null,
      spent_hours: item.spent_hours ?? null,
    }))
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
