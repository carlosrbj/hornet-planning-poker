// Tipos para o JSONB vote_analytics em session_history
// Estrutura gerada pela rota /api/sessions/close

export interface VoteStats {
  average: number
  median: number
  min: number
  max: number
  range: number
  standardDeviation: number
  coefficientOfVariation: number
  consensus: boolean
  strongConsensus: boolean
  highDivergence: boolean
  needsDiscussion: boolean
  totalVoters: number
}

export interface IssueAnalytic {
  issue_id: string
  title: string
  final_estimate: number | null
  round_count: number
  status: 'revealed' | 'skipped'
  spent_hours: number | null
  stats: VoteStats | null
  votes_by_round: Array<{
    round: number
    votes: Array<{ user_id: string; value: number | null }>
  }>
}

export interface VoteAnalytics {
  issues: IssueAnalytic[]
  summary: {
    avg_rounds: number
    avg_std_dev: number
    most_divergent_issue_id: string | null
    total_hours_estimated: number
  }
}

export interface SessionRecord {
  id: string
  room_id: string
  completed_at: string
  total_issues: number | null
  total_estimated: number | null
  average_rounds: number | null
  total_hours_estimated: number | null
  participants_count: number | null
  deck_type: string | null
  vote_analytics: VoteAnalytics | null
  summary: { room_name?: string; avg_std_dev?: number; most_divergent_issue_id?: string | null } | null
}
