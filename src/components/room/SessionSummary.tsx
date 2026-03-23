'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { downloadCsv } from '@/lib/utils/exportCsv'
import type { SessionRecord, IssueAnalytic } from '@/lib/types/session'

interface SessionSummaryProps {
  session: SessionRecord
  canExportCsv: boolean
  canViewDetails?: boolean
  defaultExpanded?: boolean
}

function SprintInsight({ issues }: { issues: IssueAnalytic[] }) {
  const highDivergenceIssues = issues.filter((i) => i.stats?.highDivergence)
  const avgCv = issues.length > 0
    ? Math.round(issues.reduce((sum, i) => sum + (i.stats?.coefficientOfVariation ?? 0), 0) / issues.length)
    : 0

  let level: 'consensus' | 'discussion' | 'divergence'
  let emoji: string
  let headline: string
  let text: string

  if (avgCv < 25) {
    level = 'consensus'
    emoji = '✅'
    headline = 'Time bem alinhado'
    text = 'A maioria das estimativas convergiu rapidamente. Bom sinal de entendimento compartilhado do escopo.'
  } else if (avgCv <= 60) {
    level = 'discussion'
    emoji = '💬'
    headline = 'Divergência moderada'
    text = 'Algumas issues geraram debate. Pode indicar escopo pouco claro ou diferentes interpretações de complexidade.'
  } else {
    level = 'divergence'
    emoji = '🔥'
    headline = 'Alta divergência detectada'
    text = 'O time teve visões bem diferentes em várias estimativas. Vale revisar o processo de refinamento antes do próximo sprint.'
  }

  const colors = {
    consensus: { border: 'border-[#26d07c]/20', bg: 'rgba(38,208,124,0.05)', accent: '#26d07c' },
    discussion: { border: 'border-[#ffd60a]/20', bg: 'rgba(255,214,10,0.05)', accent: '#ffd60a' },
    divergence: { border: 'border-[#ff6b6b]/20', bg: 'rgba(255,107,107,0.05)', accent: '#ff6b6b' },
  }[level]

  return (
    <div
      className={`rounded-xl border ${colors.border} p-4 space-y-2`}
      style={{ background: colors.bg }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-[#f5f7fb]">
          {emoji} {headline}
        </p>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full border"
          style={{ color: colors.accent, borderColor: colors.accent + '40', background: colors.accent + '10' }}
        >
          CV médio {avgCv}%
        </span>
      </div>
      <p className="text-xs text-[#9aa0aa] leading-relaxed">{text}</p>
      {highDivergenceIssues.length > 0 && (
        <p className="text-xs text-[#9aa0aa]">
          Issue mais divergente:{' '}
          <span className="text-[#f5f7fb] font-medium">{highDivergenceIssues[0].title}</span>
        </p>
      )}
    </div>
  )
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

export default function SessionSummary({ session, canExportCsv, canViewDetails = true, defaultExpanded = false }: SessionSummaryProps) {
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

              {/* Insight da sprint */}
              {issues.length > 0 && <SprintInsight issues={issues} />}

              {/* Stats agregadas */}
              {analytics?.summary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                canViewDetails ? (
                  <div className="space-y-2">
                    {issues.map((issue) => (
                      <ReplayIssue key={issue.issue_id} issue={issue} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {issues.slice(0, 2).map((issue) => (
                      <ReplayIssue key={issue.issue_id} issue={issue} />
                    ))}
                    {issues.length > 2 && (
                      <div className="rounded-xl border border-dashed border-[#ffd60a]/20 p-4 text-center space-y-2">
                        <p className="text-xs text-[#9aa0aa]">
                          <span className="text-[#f5f7fb] font-bold">+{issues.length - 2} issues</span> ocultas
                        </p>
                        <p className="text-xs text-[#9aa0aa]">Veja o detalhe de todas as issues e votos por rodada</p>
                        <a
                          href="/settings/billing"
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-[#111]"
                          style={{ background: 'linear-gradient(135deg, #ffd60a, #ffc300)' }}
                        >
                          🔒 Desbloquear análise completa
                        </a>
                      </div>
                    )}
                  </div>
                )
              ) : (
                <p className="text-sm text-[#9aa0aa] text-center py-4">
                  Dados detalhados não disponíveis para esta sessão.
                </p>
              )}

              {/* Export */}
              {canExportCsv && canViewDetails && issues.length > 0 && (
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
