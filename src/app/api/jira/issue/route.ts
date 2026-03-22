import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getValidToken } from '@/lib/jira/auth'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const key = request.nextUrl.searchParams.get('key')?.trim().toUpperCase()
  if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 })

  const jira = await getValidToken(user.id)
  if (!jira) return NextResponse.json({ error: 'jira_not_connected' }, { status: 403 })

  // expand=names retorna o mapa fieldId → label, permitindo encontrar campos customizados
  // (ex: "Desenvolvedor", "Prazo de Entrega") sem precisar hardcodar o customfield_XXXXX
  const res = await fetch(
    `https://api.atlassian.com/ex/jira/${jira.cloudId}/rest/api/3/issue/${key}?expand=names&fields=*all`,
    {
      headers: {
        Authorization: `Bearer ${jira.token}`,
        Accept: 'application/json',
      },
    }
  )

  if (res.status === 404) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  if (!res.ok) {
    return NextResponse.json({ error: 'jira_error' }, { status: res.status })
  }

  const data = await res.json() as {
    id: string
    key: string
    names?: Record<string, string>
    fields: Record<string, unknown> & {
      summary: string
      issuetype?: { name: string }
      status?: { name: string }
      priority?: { name: string }
      assignee?: { displayName: string } | null
      reporter?: { displayName: string } | null
      duedate?: string | null
      timespent?: number | null
      description?: unknown
    }
  }

  // Começa com os campos padrão; sobrescreve se achar campo customizado com o mesmo conceito
  let assigneeName = data.fields.assignee?.displayName ?? null
  let deadline = data.fields.duedate ?? null

  if (data.names) {
    for (const [fieldId, fieldName] of Object.entries(data.names)) {
      const lc = fieldName.toLowerCase()
      const value = data.fields[fieldId]
      if (lc === 'desenvolvedor' && value) {
        const v = value as { displayName?: string } | string
        assigneeName = typeof v === 'string' ? v : (v.displayName ?? assigneeName)
      }
      if ((lc === 'prazo de entrega' || lc === 'prazo' || lc === 'data de entrega') && value) {
        if (typeof value === 'string') deadline = value
      }
    }
  }

  return NextResponse.json({
    id: data.id,
    key: data.key,
    summary: data.fields.summary,
    issueType: data.fields.issuetype?.name ?? null,
    status: data.fields.status?.name ?? null,
    priority: data.fields.priority?.name ?? null,
    assigneeName,
    reporterName: data.fields.reporter?.displayName ?? null,
    deadline,
    spentHours: typeof data.fields.timespent === 'number' ? data.fields.timespent / 3600 : null,
  })
}
