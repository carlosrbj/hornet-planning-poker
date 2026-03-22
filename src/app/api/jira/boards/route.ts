import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getValidToken } from '@/lib/jira/auth'
import { getBoards } from '@/lib/jira/api'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const auth = await getValidToken(user.id)
  if (!auth) return NextResponse.json({ error: 'Jira não conectado' }, { status: 403 })

  try {
    const boards = await getBoards(auth.cloudId, auth.token)
    return NextResponse.json(boards)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
