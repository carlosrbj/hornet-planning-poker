import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeVotes } from '@/lib/utils/consensus'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { roomId } = body as { roomId: string }
  if (!roomId) return NextResponse.json({ error: 'roomId obrigatório' }, { status: 400 })

  // Verificar que o usuário é criador da sala
  const { data: room } = await supabase
    .from('rooms')
    .select('id, name, deck_type, created_by')
    .eq('id', roomId)
    .eq('created_by', user.id)
    .single()

  if (!room) return NextResponse.json({ error: 'Proibido' }, { status: 403 })

  // Buscar issues finalizadas (revealed ou skipped)
  const { data: issues } = await supabase
    .from('issues')
    .select('id, title, final_estimate, round_count, status, estimate_unit, spent_hours')
    .eq('room_id', roomId)
    .in('status', ['revealed', 'skipped'])
    .order('position')

  if (!issues || issues.length === 0) {
    return NextResponse.json({ error: 'Nenhuma issue finalizada encontrada' }, { status: 400 })
  }

  const issueIds = issues.map((i) => i.id)

  // Buscar votos de todas as issues
  const { data: votes } = await supabase
    .from('votes')
    .select('id, issue_id, user_id, value, round')
    .in('issue_id', issueIds)

  const allVotes = votes ?? []

  // Participantes únicos que votaram
  const participantIds = new Set(allVotes.map((v) => v.user_id))

  // Analytics por issue
  const issueAnalytics = issues.map((issue) => {
    const issueVotes = allVotes.filter((v) => v.issue_id === issue.id)
    const rounds = [...new Set(issueVotes.map((v) => v.round))].sort((a, b) => a - b)

    const votesByRound = rounds.map((round) => ({
      round,
      votes: issueVotes
        .filter((v) => v.round === round)
        .map((v) => ({ user_id: v.user_id, value: v.value })),
    }))

    const stats = analyzeVotes(issueVotes.map((v) => v.value))

    return {
      issue_id: issue.id,
      title: issue.title,
      final_estimate: issue.final_estimate,
      round_count: issue.round_count,
      status: issue.status,
      spent_hours: issue.spent_hours,
      stats,
      votes_by_round: votesByRound,
    }
  })

  // Calcular sumário agregado
  const estimatedIssues = issues.filter((i) => i.final_estimate !== null)
  const totalHoursEstimated = estimatedIssues.reduce((sum, i) => sum + (i.final_estimate ?? 0), 0)
  const avgRounds = issues.reduce((sum, i) => sum + (i.round_count ?? 1), 0) / issues.length

  const issueStdDevs = issueAnalytics
    .filter((ia) => ia.stats !== null)
    .map((ia) => ia.stats!.standardDeviation)
  const avgStdDev = issueStdDevs.length > 0
    ? issueStdDevs.reduce((a, b) => a + b, 0) / issueStdDevs.length
    : 0

  const mostDivergent = issueAnalytics.reduce((max, ia) => {
    const cv = ia.stats?.coefficientOfVariation ?? 0
    const maxCv = max?.stats?.coefficientOfVariation ?? 0
    return cv > maxCv ? ia : max
  }, issueAnalytics[0])

  const voteAnalytics = {
    issues: issueAnalytics,
    summary: {
      avg_rounds: Math.round(avgRounds * 10) / 10,
      avg_std_dev: Math.round(avgStdDev * 10) / 10,
      most_divergent_issue_id: mostDivergent?.issue_id ?? null,
      total_hours_estimated: totalHoursEstimated,
    },
  }

  // Persistir snapshot no session_history
  const { data: history, error } = await supabase
    .from('session_history')
    .insert({
      room_id: roomId,
      completed_at: new Date().toISOString(),
      total_issues: issues.length,
      total_estimated: estimatedIssues.length,
      average_rounds: Math.round(avgRounds * 10) / 10,
      total_hours_estimated: totalHoursEstimated,
      participants_count: participantIds.size,
      deck_type: room.deck_type,
      vote_analytics: voteAnalytics,
      summary: {
        room_name: room.name,
        avg_std_dev: Math.round(avgStdDev * 10) / 10,
        most_divergent_issue_id: mostDivergent?.issue_id ?? null,
      },
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ id: history.id })
}
