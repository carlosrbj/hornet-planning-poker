import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { analyzeVotes } from '@/lib/utils/consensus'
import type { Database } from '@/lib/types/database'

type Room = Database['public']['Tables']['rooms']['Row']
type Issue = Database['public']['Tables']['issues']['Row']
type Vote = Database['public']['Tables']['votes']['Row']

interface ResultsPageProps {
  params: Promise<{ slug: string }>
}

interface IssueResult {
  issue: Issue
  votes: Vote[]
  analysis: ReturnType<typeof analyzeVotes>
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: roomData } = await supabase
    .from('rooms')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!roomData) notFound()
  const room = roomData as Room

  const { data: issuesData } = await supabase
    .from('issues')
    .select('*')
    .eq('room_id', room.id)
    .order('position', { ascending: true })

  const issues = (issuesData ?? []) as Issue[]

  const { data: votesData } = await supabase
    .from('votes')
    .select('*')
    .in('issue_id', issues.map((i) => i.id))

  const votes = (votesData ?? []) as Vote[]

  const results: IssueResult[] = issues
    .filter((i) => i.status === 'revealed')
    .map((issue) => {
      const issueVotes = votes.filter((v) => v.issue_id === issue.id)
      return {
        issue,
        votes: issueVotes,
        analysis: analyzeVotes(issueVotes.map((v) => v.value)),
      }
    })

  const totalHours = results.reduce((sum, r) => sum + (r.issue.final_estimate ?? 0), 0)
  const avgRounds =
    results.length > 0
      ? results.reduce((sum, r) => sum + (r.issue.round_count ?? 1), 0) / results.length
      : 0

  function exportCSV() {
    // Handled client-side via link
  }

  const csvContent =
    'Issue,Estimativa Final,Média,Mediana,Divergência (%),Rounds\n' +
    results
      .map(
        (r) =>
          `"${r.issue.title}",${r.issue.final_estimate ?? ''},${r.analysis?.average ?? ''},${r.analysis?.median ?? ''},${r.analysis?.coefficientOfVariation ?? ''},${r.issue.round_count}`
      )
      .join('\n')

  const csvHref = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/room/${slug}`}
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            ← Voltar à sala
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="font-semibold text-foreground">{room.name} — Resultados</h1>
        </div>
        <a
          href={csvHref}
          download={`${slug}-resultados.csv`}
          className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Exportar CSV
        </a>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {/* Métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Issues estimadas" value={String(results.length)} />
          <StatCard label="Total pendentes" value={String(issues.filter((i) => i.status === 'pending').length)} />
          <StatCard
            label="Total estimado"
            value={`${Math.round(totalHours * 10) / 10}h`}
            highlight
          />
          <StatCard
            label="Média de rounds"
            value={`${Math.round(avgRounds * 10) / 10}`}
          />
        </div>

        {/* Gráfico de distribuição */}
        {results.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Distribuição de estimativas
            </h2>
            <div className="space-y-3">
              {results.map((r) => {
                const maxH = Math.max(...results.map((x) => x.issue.final_estimate ?? 0), 1)
                const pct = ((r.issue.final_estimate ?? 0) / maxH) * 100
                return (
                  <div key={r.issue.id} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-32 truncate shrink-0">
                      {r.issue.jira_issue_key ?? r.issue.title.slice(0, 20)}
                    </span>
                    <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-foreground w-10 text-right shrink-0">
                      {r.issue.final_estimate ?? '?'}h
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Tabela */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Detalhamento por issue
          </h2>
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Issue</th>
                  <th className="text-right px-4 py-3 text-muted-foreground font-medium">Estimativa</th>
                  <th className="text-right px-4 py-3 text-muted-foreground font-medium">Média</th>
                  <th className="text-right px-4 py-3 text-muted-foreground font-medium">Divergência</th>
                  <th className="text-right px-4 py-3 text-muted-foreground font-medium">Rounds</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {results.map((r) => (
                  <tr key={r.issue.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-foreground font-medium truncate max-w-xs">{r.issue.title}</p>
                      {r.issue.jira_issue_key && (
                        <p className="text-xs text-muted-foreground">{r.issue.jira_issue_key}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-primary">
                      {r.issue.final_estimate ?? '?'}h
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {r.analysis?.average ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          r.analysis?.consensus
                            ? 'bg-green-500/15 text-green-600'
                            : r.analysis?.highDivergence
                            ? 'bg-accent/15 text-accent'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {r.analysis?.coefficientOfVariation ?? '?'}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {r.issue.round_count}
                    </td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhuma issue revelada ainda
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${highlight ? 'text-primary' : 'text-foreground'}`}>
        {value}
      </p>
    </div>
  )
}
