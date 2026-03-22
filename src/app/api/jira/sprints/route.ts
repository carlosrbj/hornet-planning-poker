import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getValidToken } from '@/lib/jira/auth'
import { getSprints } from '@/lib/jira/api'

export async function GET(request: NextRequest) {
  const boardId = request.nextUrl.searchParams.get('boardId')
  if (!boardId) return NextResponse.json({ error: 'boardId obrigatório' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const auth = await getValidToken(user.id)
  if (!auth) return NextResponse.json({ error: 'Jira não conectado' }, { status: 403 })

  try {
    const sprints = await getSprints(auth.cloudId, auth.token, Number(boardId))
    return NextResponse.json(sprints)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
