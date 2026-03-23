import type { SessionRecord, IssueAnalytic } from '@/lib/types/session'

// ── Tipos exportados ─────────────────────────────────────────────────────────

export interface SessionMetric {
  id: string
  completedAt: string
  label: string            // "Sprint 1", "Sprint 2" ...
  avgStdDev: number        // desvio padrão médio dos votos
  avgCv: number            // coeficiente de variação médio (0-100)
  convergenceRate: number  // % de issues com consenso (cv < 25)
  totalHours: number
  avgRounds: number
  issueCount: number
}

export interface TopDivergentIssue {
  issueId: string
  title: string
  cv: number
  stdDev: number
  sessionId: string
  sessionCompletedAt: string
}

export interface AccuracyPoint {
  sessionId: string
  completedAt: string
  label: string
  estimatedHours: number
  spentHours: number
  accuracyPct: number   // spentHours / estimatedHours * 100
  delta: number         // spentHours - estimatedHours (positivo = subestimou)
}

export interface RoomAnalytics {
  sessions: SessionMetric[]
  topDivergentIssues: TopDivergentIssue[]
  accuracyPoints: AccuracyPoint[]
  overallAvgCv: number
  overallConvergenceRate: number
  improvingDivergence: boolean  // trend: última metade melhor que primeira
}

// ── Helpers internos ─────────────────────────────────────────────────────────

function issuesCv(issues: IssueAnalytic[]): number[] {
  return issues
    .map((i) => i.stats?.coefficientOfVariation ?? null)
    .filter((v): v is number => v !== null)
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

// ── Funções principais ───────────────────────────────────────────────────────

export function computeSessionMetrics(sessions: SessionRecord[]): SessionMetric[] {
  return sessions
    .filter((s) => s.vote_analytics !== null)
    .map((s, idx) => {
      const issues = s.vote_analytics!.issues
      const cvValues = issuesCv(issues)
      const stdDevValues = issues
        .map((i) => i.stats?.standardDeviation ?? null)
        .filter((v): v is number => v !== null)

      const avgCv = avg(cvValues)
      const avgStdDev = avg(stdDevValues)
      const consensusCount = issues.filter(
        (i) => i.stats && i.stats.coefficientOfVariation < 25
      ).length
      const convergenceRate = issues.length > 0
        ? (consensusCount / issues.length) * 100
        : 0

      return {
        id: s.id,
        completedAt: s.completed_at,
        label: `Sprint ${idx + 1}`,
        avgStdDev: Math.round(avgStdDev * 100) / 100,
        avgCv: Math.round(avgCv * 10) / 10,
        convergenceRate: Math.round(convergenceRate),
        totalHours: s.total_hours_estimated ?? 0,
        avgRounds: s.average_rounds ?? 1,
        issueCount: s.total_issues ?? issues.length,
      }
    })
}

export function computeTopDivergentIssues(
  sessions: SessionRecord[],
  topN = 5
): TopDivergentIssue[] {
  const all: TopDivergentIssue[] = []

  for (const session of sessions) {
    if (!session.vote_analytics) continue
    for (const issue of session.vote_analytics.issues) {
      if (!issue.stats) continue
      all.push({
        issueId: issue.issue_id,
        title: issue.title,
        cv: issue.stats.coefficientOfVariation,
        stdDev: issue.stats.standardDeviation,
        sessionId: session.id,
        sessionCompletedAt: session.completed_at,
      })
    }
  }

  return all
    .sort((a, b) => b.cv - a.cv)
    .slice(0, topN)
}

export function computeAccuracyPoints(sessions: SessionRecord[]): AccuracyPoint[] {
  return sessions
    .filter((s) => s.vote_analytics !== null)
    .map((s, idx) => {
      const issues = s.vote_analytics!.issues
      const estimated = issues.reduce((sum, i) => sum + (i.final_estimate ?? 0), 0)
      const spent = issues.reduce((sum, i) => sum + (i.spent_hours ?? 0), 0)
      const accuracyPct = estimated > 0 ? Math.round((spent / estimated) * 100) : 0

      return {
        sessionId: s.id,
        completedAt: s.completed_at,
        label: `Sprint ${idx + 1}`,
        estimatedHours: Math.round(estimated * 10) / 10,
        spentHours: Math.round(spent * 10) / 10,
        accuracyPct,
        delta: Math.round((spent - estimated) * 10) / 10,
      }
    })
    .filter((p) => p.estimatedHours > 0)
}

export function computeRoomAnalytics(sessions: SessionRecord[]): RoomAnalytics {
  const metrics = computeSessionMetrics(sessions)
  const topDivergentIssues = computeTopDivergentIssues(sessions)
  const accuracyPoints = computeAccuracyPoints(sessions)

  const allCv = metrics.map((m) => m.avgCv)
  const overallAvgCv = Math.round(avg(allCv) * 10) / 10
  const overallConvergenceRate = Math.round(avg(metrics.map((m) => m.convergenceRate)))

  // Verifica se a divergência está melhorando (metade mais recente < metade anterior)
  let improvingDivergence = false
  if (metrics.length >= 4) {
    const half = Math.floor(metrics.length / 2)
    const older = avg(metrics.slice(0, half).map((m) => m.avgCv))
    const newer = avg(metrics.slice(half).map((m) => m.avgCv))
    improvingDivergence = newer < older
  }

  return {
    sessions: metrics,
    topDivergentIssues,
    accuracyPoints,
    overallAvgCv,
    overallConvergenceRate,
    improvingDivergence,
  }
}
