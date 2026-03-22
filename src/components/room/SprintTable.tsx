'use client'

import { motion } from 'framer-motion'
import type { Database } from '@/lib/types/database'

type Issue = Database['public']['Tables']['issues']['Row']

export interface SprintTableProps {
  issues: Issue[]
  jiraSiteName?: string | null
}

const STATUS_COLOR: Record<string, string> = {
  pending:  'bg-muted/60 text-muted-foreground',
  voting:   'bg-primary/15 text-primary',
  revealed: 'bg-green-500/15 text-green-500',
  skipped:  'bg-muted/40 text-muted-foreground/60 line-through',
}

const STATUS_LABEL: Record<string, string> = {
  pending:  'Pendente',
  voting:   'Votando',
  revealed: 'Estimado',
  skipped:  'Pulado',
}

const ISSUE_TYPE_COLOR: Record<string, string> = {
  Bug:      'bg-red-500/15 text-red-500',
  Melhoria: 'bg-blue-500/15 text-blue-400',
  Story:    'bg-purple-500/15 text-purple-400',
  Task:     'bg-cyan-500/15 text-cyan-400',
  Epic:     'bg-orange-500/15 text-orange-400',
}

function Pill({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <span className={`inline-block text-xs px-1.5 py-0.5 rounded font-medium ${colorClass}`}>
      {label}
    </span>
  )
}

export default function SprintTable({ issues, jiraSiteName }: SprintTableProps) {
  const totalEstimated = issues.reduce((sum, i) => sum + (i.final_estimate ?? 0), 0)
  const totalSpent     = issues.reduce((sum, i) => sum + (i.spent_hours ?? 0), 0)
  const estimatedCount = issues.filter((i) => i.status === 'revealed').length
  const pendingCount   = issues.filter((i) => i.status === 'pending').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full overflow-hidden"
    >
      {/* Resumo */}
      <div className="grid grid-cols-4 gap-3 px-4 py-3 border-b border-border shrink-0">
        <SummaryCard label="Issues" value={String(issues.length)} />
        <SummaryCard label="Estimadas" value={String(estimatedCount)} accent="text-green-500" />
        <SummaryCard label="Pendentes" value={String(pendingCount)} accent="text-yellow-500" />
        <SummaryCard label="Total estimado" value={`${totalEstimated.toFixed(1)}h`} accent="text-primary" />
      </div>

      {/* Tabela */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 bg-background z-10">
            <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wide">
              <th className="text-left px-3 py-2 w-6">#</th>
              <th className="text-left px-3 py-2 w-28">Chave</th>
              <th className="text-left px-3 py-2">Demanda</th>
              <th className="text-left px-3 py-2 w-24">Tipo</th>
              <th className="text-left px-3 py-2 w-32">Status Jira</th>
              <th className="text-left px-3 py-2 w-28">Desenvolvedor</th>
              <th className="text-right px-3 py-2 w-20">Estimado</th>
              <th className="text-right px-3 py-2 w-16">Gasto</th>
              <th className="text-right px-3 py-2 w-20">Dif.</th>
              <th className="text-left px-3 py-2 w-24">Criticidade</th>
              <th className="text-left px-3 py-2 w-24">Prazo</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue, idx) => {
              const diff =
                issue.final_estimate !== null && issue.spent_hours !== null
                  ? issue.final_estimate - issue.spent_hours
                  : null
              const jiraUrl =
                issue.jira_issue_key && jiraSiteName
                  ? `https://${jiraSiteName}.atlassian.net/browse/${issue.jira_issue_key}`
                  : null
              const typeColor = issue.issue_type
                ? (ISSUE_TYPE_COLOR[issue.issue_type] ?? 'bg-muted text-muted-foreground')
                : null

              return (
                <tr
                  key={issue.id}
                  className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-3 py-2 text-muted-foreground text-xs">{idx + 1}</td>
                  <td className="px-3 py-2">
                    {issue.jira_issue_key ? (
                      jiraUrl ? (
                        <a
                          href={jiraUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-primary hover:underline"
                        >
                          {issue.jira_issue_key}
                        </a>
                      ) : (
                        <span className="font-mono text-xs text-muted-foreground">
                          {issue.jira_issue_key}
                        </span>
                      )
                    ) : (
                      <span className="text-muted-foreground/40 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 max-w-xs">
                    <div className="flex items-start gap-2">
                      <span
                        className={`mt-0.5 shrink-0 text-xs px-1.5 py-0.5 rounded ${STATUS_COLOR[issue.status] ?? 'bg-muted text-muted-foreground'}`}
                      >
                        {STATUS_LABEL[issue.status] ?? issue.status}
                      </span>
                      <span className="text-foreground/90 line-clamp-2 leading-snug">{issue.title}</span>
                    </div>
                    {issue.impedimento && (
                      <p className="text-xs text-accent mt-1">⚠ {issue.impedimento}</p>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {issue.issue_type && typeColor ? (
                      <Pill label={issue.issue_type} colorClass={typeColor} />
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {issue.jira_status ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-xs text-foreground/80 truncate max-w-[112px]">
                    {issue.assignee_name ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs">
                    {issue.final_estimate !== null ? (
                      <span className="text-primary font-semibold">{issue.final_estimate}h</span>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs text-muted-foreground">
                    {issue.spent_hours !== null ? `${issue.spent_hours.toFixed(1)}h` : '—'}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs">
                    {diff !== null ? (
                      <span className={diff >= 0 ? 'text-green-500' : 'text-accent'}>
                        {diff >= 0 ? '+' : ''}{diff.toFixed(1)}h
                      </span>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {issue.criticality ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {issue.deadline
                      ? new Date(issue.deadline).toLocaleDateString('pt-BR')
                      : '—'}
                  </td>
                </tr>
              )
            })}
            {issues.length === 0 && (
              <tr>
                <td colSpan={11} className="text-center text-muted-foreground py-12 text-sm">
                  Nenhuma issue adicionada ainda.
                </td>
              </tr>
            )}
          </tbody>
          {issues.length > 0 && (totalEstimated > 0 || totalSpent > 0) && (
            <tfoot>
              <tr className="border-t border-border bg-muted/30 text-xs font-semibold">
                <td colSpan={6} className="px-3 py-2 text-muted-foreground text-right">Totais</td>
                <td className="px-3 py-2 text-right font-mono text-primary">
                  {totalEstimated.toFixed(1)}h
                </td>
                <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                  {totalSpent.toFixed(1)}h
                </td>
                <td className="px-3 py-2 text-right font-mono">
                  {(() => {
                    const d = totalEstimated - totalSpent
                    return (
                      <span className={d >= 0 ? 'text-green-500' : 'text-accent'}>
                        {d >= 0 ? '+' : ''}{d.toFixed(1)}h
                      </span>
                    )
                  })()}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </motion.div>
  )
}

function SummaryCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="bg-muted/40 rounded-lg px-3 py-2 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-bold ${accent ?? 'text-foreground'}`}>{value}</p>
    </div>
  )
}
