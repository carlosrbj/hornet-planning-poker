import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getValidToken } from '@/lib/jira/auth'
import { getSprintIssues } from '@/lib/jira/api'

export async function GET(request: NextRequest) {
  const sprintId = request.nextUrl.searchParams.get('sprintId')
  if (!sprintId) return NextResponse.json({ error: 'sprintId obrigatório' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const auth = await getValidToken(user.id)
  if (!auth) return NextResponse.json({ error: 'Jira não conectado' }, { status: 403 })

  try {
    const issues = await getSprintIssues(auth.cloudId, auth.token, Number(sprintId))
    return NextResponse.json(issues)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
