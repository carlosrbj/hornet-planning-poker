'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { downloadCsv } from '@/lib/utils/exportCsv'
import type { SessionRecord, IssueAnalytic } from '@/lib/types/session'

interface SessionSummaryProps {
  session: SessionRecord
  canExportCsv: boolean
  defaultExpanded?: boolean
}

function DivergenceBadge({ cv }: { cv: number }) {
  if (cv < 25) return <span className="text-[0.7rem] font-bold px-2 py-0.5 rounded-full bg-[#26d07c]/10 text-[#26d07c] border border-[#26d07c]/20">consenso</span>
  if (cv > 60) return <span className="text-[0.7rem] font-bold px-2 py-0.5 rounded-full bg-[#ff6b6b]/10 text-[#ff6b6b] border border-[#ff6b6b]/20">alta divergência</span>
  return <span className="text-[0.7rem] font-bold px-2 py-0.5 rounded-full bg-[#ffd60a]/10 text-[#ffd60a] border border-[#ffd60a]/20">discussão</span>
}

function ReplayIssue({ issue }: { issue: IssueAnalytic }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-[#f5f7fb] leading-tight">{issue.title}</p>
        <div className="flex items-center gap-2 shrink-0">
          {issue.status === 'skipped' ? (
            <span className="text-[0.7rem] text-[#9aa0aa] border border-white/10 px-2 py-0.5 rounded-full">pulada</span>
          ) : (
            <span className="text-sm font-bold text-[#ffd60a]">
              {issue.final_estimate != null ? `${issue.final_estimate}h` : '—'}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-[#9aa0aa]">
        <span>{issue.round_count ?? 1} rodada{(issue.round_count ?? 1) !== 1 ? 's' : ''}</span>
        {issue.stats && <DivergenceBadge cv={issue.stats.coefficientOfVariation} />}
        {issue.spent_hours != null && issue.final_estimate != null && (
          <span className={
            issue.spent_hours > issue.final_estimate
              ? 'text-[#ff6b6b]'
              : 'text-[#26d07c]'
          }>
            gasto: {issue.spent_hours}h
          </span>
        )}
      </div>

      {/* Votos por rodada */}
      {issue.votes_by_round.map((r) => (
        <div key={r.round} className="flex items-center gap-2 text-xs text-[#9aa0aa]">
          <span className="shrink-0 text-white/30">R{r.round}:</span>
          <div className="flex flex-wrap gap-1">
            {r.votes.map((v, i) => (
              <span
                key={i}
                className="px-1.5 py-0.5 rounded bg-white/5 border border-white/[0.06] text-[#f5f7fb]"
              >
                {v.value ?? '?'}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function SessionSummary({ session, canExportCsv, defaultExpanded = false }: SessionSummaryProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const date = new Date(session.completed_at)
  const dateLabel = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  const timeLabel = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const analytics = session.vote_analytics
  const issues = analytics?.issues ?? []

  function handleExportCsv() {
    const rows = issues.map((i) => ({
      'Issue': i.title,
      'Estimativa (h)': i.final_estimate ?? '',
      'Status': i.status === 'skipped' ? 'Pulada' : 'Estimada',
      'Rodadas': i.round_count ?? 1,
      'Média votos': i.stats?.average ?? '',
      'Mediana': i.stats?.median ?? '',
      'Desvio padrão': i.stats?.standardDeviation ?? '',
      'CV (%)': i.stats?.coefficientOfVariation ?? '',
      'Convergência': i.stats?.consensus ? 'Sim' : 'Não',
      'Gasto real (h)': i.spent_hours ?? '',
    }))
    const slug = `sessao-${date.toISOString().slice(0, 10)}`
    downloadCsv(rows, slug)
  }

  return (
    <div className="rounded-[20px] border border-white/5 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))' }}
    >
      {/* Header da sessão */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="shrink-0 w-9 h-9 rounded-xl bg-[#ffd60a]/10 border border-[#ffd60a]/20 flex items-center justify-center text-base">
            📋
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#f5f7fb] truncate">{dateLabel} às {timeLabel}</p>
            <p className="text-xs text-[#9aa0aa] mt-0.5">
              {session.total_estimated ?? 0}/{session.total_issues ?? 0} issues estimadas
              {session.total_hours_estimated ? ` · ${session.total_hours_estimated}h` : ''}
              {session.participants_count ? ` · ${session.participants_count} participantes` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Stats rápidas */}
          {analytics?.summary && (
            <div className="hidden sm:flex items-center gap-4 text-xs text-[#9aa0aa]">
              <span>
                <strong className="text-[#f5f7fb]">{analytics.summary.avg_rounds}</strong> rodadas/issue
              </span>
              <span>
                <strong className={analytics.summary.avg_std_dev > 2 ? 'text-[#ffd60a]' : 'text-[#26d07c]'}>
                  σ {analytics.summary.avg_std_dev}
                </strong>
              </span>
            </div>
          )}
          <span className="text-[#9aa0aa] text-lg leading-none">{expanded ? '↑' : '↓'}</span>
        </div>
      </button>

      {/* Conteúdo expandido */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-3 border-t border-white/5 pt-4">

              {/* Stats agregadas */}
              {analytics?.summary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {[
                    { label: 'Issues', value: session.total_issues ?? 0, accent: false },
                    { label: 'Estimadas', value: session.total_estimated ?? 0, accent: true },
                    { label: 'Total horas', value: `${session.total_hours_estimated ?? 0}h`, accent: true },
                    { label: 'Média rodadas', value: analytics.summary.avg_rounds, accent: false },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5">
                      <strong className={`block text-base font-bold mb-0.5 ${s.accent ? 'text-[#ffd60a]' : 'text-[#f5f7fb]'}`}>
                        {s.value}
                      </strong>
                      <span className="text-xs text-[#9aa0aa]">{s.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Lista de issues */}
              {issues.length > 0 ? (
                <div className="space-y-2">
                  {issues.map((issue) => (
                    <ReplayIssue key={issue.issue_id} issue={issue} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#9aa0aa] text-center py-4">
                  Dados detalhados não disponíveis para esta sessão.
                </p>
              )}

              {/* Export */}
              {canExportCsv && issues.length > 0 && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleExportCsv}
                    className="text-xs font-bold px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-[#9aa0aa] hover:border-[#ffd60a]/20 hover:text-[#ffd60a] transition-all"
                  >
                    Exportar CSV ↓
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
