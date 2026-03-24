'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import UpgradePrompt from '@/components/billing/UpgradePrompt'
import { fadeSlideUp, staggerContainer } from '@/lib/utils/animations'
import type { PlanId } from '@/lib/billing/plans'
import type { RoomAnalytics, SessionMetric, AccuracyPoint, HardIssue } from '@/lib/billing/analytics'
import type { SessionRecord } from '@/lib/types/session'

interface AnalyticsClientProps {
  roomName: string
  roomSlug: string
  planId: PlanId
  hasAnalytics: boolean
  hasCompareSprints: boolean
  analytics: RoomAnalytics
  allSessions: SessionRecord[]
  userDisplayName?: string
  userAvatarUrl?: string | null
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function DivLabel({ cv }: { cv: number }) {
  if (cv < 25) return <span className="text-[#26d07c] text-xs font-semibold">Consenso</span>
  if (cv < 60) return <span className="text-[#ffd60a] text-xs font-semibold">Discussão</span>
  return <span className="text-[#ff6b6b] text-xs font-semibold">Alta divergência</span>
}

function TrendArrow({ improving }: { improving: boolean }) {
  return improving
    ? <span className="text-[#26d07c] font-bold text-sm">↘ melhorando</span>
    : <span className="text-[#ff6b6b] font-bold text-sm">↗ aumentando</span>
}

function RoundsBar({ rounds, max }: { rounds: number; max: number }) {
  const pct = max > 1 ? ((rounds - 1) / (max - 1)) * 100 : 100
  const color = rounds >= 4 ? '#ff6b6b' : rounds >= 3 ? '#ffd60a' : '#9aa0aa'
  return (
    <div className="w-16 h-1.5 rounded-full bg-white/5 shrink-0 overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  )
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

// ── SVG Bar Chart ─────────────────────────────────────────────────────────────

function BarChart({
  data,
  valueKey,
  labelKey,
  color = '#ffd60a',
  maxValue,
}: {
  data: SessionMetric[]
  valueKey: keyof SessionMetric
  labelKey: keyof SessionMetric
  color?: string
  maxValue?: number
}) {
  if (data.length === 0) return <p className="text-xs text-[#9aa0aa] text-center py-4">Nenhum dado disponível.</p>

  const values = data.map((d) => Number(d[valueKey]))
  const max = maxValue ?? Math.max(...values, 1)
  const barW = Math.max(20, Math.min(48, Math.floor(360 / data.length) - 8))
  const chartW = data.length * (barW + 8)
  const chartH = 120

  return (
    <div className="overflow-x-auto">
      <svg width={Math.max(chartW, 300)} height={chartH + 32} className="block mx-auto">
        {data.map((d, i) => {
          const val = Number(d[valueKey])
          const barH = Math.max(4, Math.round((val / max) * chartH))
          const x = i * (barW + 8)
          const y = chartH - barH
          return (
            <g key={d.id}>
              <rect
                x={x} y={y} width={barW} height={barH}
                rx={4} fill={color} opacity={0.85}
              />
              <text
                x={x + barW / 2} y={y - 4}
                textAnchor="middle" fontSize={10} fill={color} fontWeight={600}
              >
                {val}
              </text>
              <text
                x={x + barW / 2} y={chartH + 16}
                textAnchor="middle" fontSize={9} fill="#9aa0aa"
              >
                {String(d[labelKey])}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ── Linha de comparação simples ───────────────────────────────────────────────

function AccuracyChart({ data }: { data: AccuracyPoint[] }) {
  if (data.length === 0) return (
    <p className="text-xs text-[#9aa0aa] text-center py-4">
      Sem dados de horas gastas. Dados vêm do campo <code className="font-mono">timetracking</code> do Jira.
    </p>
  )

  const maxH = Math.max(...data.flatMap((p) => [p.estimatedHours, p.spentHours]), 1)
  const barW = Math.max(16, Math.min(40, Math.floor(360 / data.length / 2) - 4))
  const gap = barW
  const groupW = barW * 2 + gap
  const chartH = 120

  return (
    <div className="overflow-x-auto">
      <svg width={Math.max(data.length * (groupW + 12), 300)} height={chartH + 40} className="block mx-auto">
        {/* Legenda */}
        <rect x={0} y={0} width={10} height={10} rx={2} fill="#ffd60a" />
        <text x={14} y={9} fontSize={9} fill="#9aa0aa">Estimado</text>
        <rect x={70} y={0} width={10} height={10} rx={2} fill="#60a5fa" />
        <text x={84} y={9} fontSize={9} fill="#9aa0aa">Gasto (Jira)</text>

        {data.map((p, i) => {
          const x = i * (groupW + 12)
          const estH = Math.max(4, Math.round((p.estimatedHours / maxH) * chartH))
          const spH = Math.max(4, Math.round((p.spentHours / maxH) * chartH))
          return (
            <g key={p.sessionId} transform="translate(0, 16)">
              {/* Estimado */}
              <rect x={x} y={chartH - estH} width={barW} height={estH} rx={3} fill="#ffd60a" opacity={0.85} />
              {/* Gasto */}
              <rect x={x + barW + 4} y={chartH - spH} width={barW} height={spH} rx={3} fill="#60a5fa" opacity={0.85} />
              {/* Delta */}
              <text
                x={x + groupW / 2} y={chartH + 14}
                textAnchor="middle" fontSize={9} fill={p.delta > 0 ? '#ff6b6b' : '#26d07c'}
              >
                {p.delta > 0 ? `+${p.delta}h` : `${p.delta}h`}
              </text>
              <text
                x={x + groupW / 2} y={chartH + 26}
                textAnchor="middle" fontSize={8} fill="#9aa0aa"
              >
                {p.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ── Comparação de 2 sessões ───────────────────────────────────────────────────

function SprintComparison({
  sessions,
  metrics,
}: {
  sessions: SessionRecord[]
  metrics: SessionMetric[]
}) {
  const [idA, setIdA] = useState(sessions[0]?.id ?? '')
  const [idB, setIdB] = useState(sessions[1]?.id ?? '')

  const mA = metrics.find((m) => m.id === idA)
  const mB = metrics.find((m) => m.id === idB)

  function MetricRow({ label, a, b, unit = '', lowerBetter = false }: {
    label: string; a: number; b: number; unit?: string; lowerBetter?: boolean
  }) {
    const better = lowerBetter ? a < b : a > b
    return (
      <tr className="border-t border-white/5">
        <td className="py-2.5 pr-4 text-xs text-[#9aa0aa]">{label}</td>
        <td className={`py-2.5 text-center text-sm font-bold ${mA && mB ? (better ? 'text-[#26d07c]' : 'text-[#f5f7fb]') : 'text-[#f5f7fb]'}`}>
          {a}{unit}
        </td>
        <td className={`py-2.5 text-center text-sm font-bold ${mA && mB ? (!better ? 'text-[#26d07c]' : 'text-[#f5f7fb]') : 'text-[#f5f7fb]'}`}>
          {b}{unit}
        </td>
      </tr>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {(['A', 'B'] as const).map((slot) => {
          const selectedId = slot === 'A' ? idA : idB
          const setSelected = slot === 'A' ? setIdA : setIdB
          return (
            <div key={slot}>
              <label className="block text-xs text-[#9aa0aa] mb-1.5 font-medium">Sprint {slot}</label>
              <select
                value={selectedId}
                onChange={(e) => setSelected(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#111] border border-white/10 rounded-lg text-[#f5f7fb] focus:outline-none focus:border-[#ffd60a]/40"
              >
                {sessions.map((s, i) => (
                  <option key={s.id} value={s.id}>
                    Sprint {i + 1} — {fmtDate(s.completed_at)}
                  </option>
                ))}
              </select>
            </div>
          )
        })}
      </div>

      {mA && mB && (
        <div className="rounded-[16px] border border-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-white/[0.03]">
                <th className="py-2.5 px-4 text-left text-xs text-[#9aa0aa] font-medium">Métrica</th>
                <th className="py-2.5 text-center text-xs text-[#9aa0aa] font-medium">{mA.label}</th>
                <th className="py-2.5 text-center text-xs text-[#9aa0aa] font-medium">{mB.label}</th>
              </tr>
            </thead>
            <tbody className="px-4">
              <MetricRow label="Issues estimadas" a={mA.issueCount} b={mB.issueCount} />
              <MetricRow label="Horas estimadas" a={mA.totalHours} b={mB.totalHours} unit="h" />
              <MetricRow label="Divergência média" a={mA.avgCv} b={mB.avgCv} unit="%" lowerBetter />
              <MetricRow label="Convergência" a={mA.convergenceRate} b={mB.convergenceRate} unit="%" />
              <MetricRow label="Rounds médios/issue" a={mA.avgRounds} b={mB.avgRounds} lowerBetter />
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AnalyticsClient({
  roomName,
  roomSlug,
  planId,
  hasAnalytics,
  hasCompareSprints,
  analytics,
  allSessions,
  userDisplayName,
  userAvatarUrl,
}: AnalyticsClientProps) {
  const lastSession = analytics.sessions[analytics.sessions.length - 1] ?? null
  const hasData = analytics.sessions.length > 0

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f7fb] font-sans relative overflow-x-hidden">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundSize: '40px 40px',
          backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
        }}
      />
      <div
        className="fixed top-[-20%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(255,214,10,0.06), transparent 70%)' }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar userDisplayName={userDisplayName} userAvatarUrl={userAvatarUrl} />

        <main className="flex-1 w-full max-w-[900px] mx-auto px-4 md:px-6 pt-[42px] pb-[64px]">

          {/* Breadcrumb */}
          <motion.div variants={fadeSlideUp} initial="hidden" animate="visible"
            className="flex items-center gap-2 text-sm text-[#9aa0aa] mb-8 flex-wrap"
          >
            <Link href="/dashboard" className="hover:text-[#f5f7fb] transition-colors">Dashboard</Link>
            <span>/</span>
            <Link href={`/room/${roomSlug}`} className="hover:text-[#f5f7fb] transition-colors">{roomName}</Link>
            <span>/</span>
            <span className="text-[#f5f7fb]">Analytics</span>
          </motion.div>

          {/* Header */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-10">
            <motion.div variants={fadeSlideUp} className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <span className="inline-flex items-center gap-2 text-[#fff3ad] text-xs font-extrabold tracking-widest uppercase mb-3 before:content-[''] before:w-[22px] before:h-[2px] before:rounded-full before:bg-[#ffd60a]">
                  Analytics
                </span>
                <h1 className="text-[clamp(1.6rem,3vw,2.4rem)] font-bold tracking-[-0.04em] leading-tight">
                  {roomName}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/room/${roomSlug}/history`}
                  className="px-4 py-2 rounded-xl border border-white/8 text-sm text-[#9aa0aa] hover:text-[#f5f7fb] hover:border-white/15 transition-all"
                >
                  Histórico →
                </Link>
              </div>
            </motion.div>
          </motion.div>

          {/* Sem dados */}
          {!hasData && (
            <motion.div variants={fadeSlideUp} initial="hidden" animate="visible"
              className="text-center py-20 text-[#9aa0aa]"
            >
              <div className="text-5xl mb-4">📊</div>
              <p className="text-lg font-medium text-[#f5f7fb] mb-2">Nenhuma sessão encerrada ainda</p>
              <p className="text-sm">Analytics ficam disponíveis após encerrar a primeira sessão.</p>
              <Link href={`/room/${roomSlug}`}
                className="inline-block mt-6 px-6 py-2.5 rounded-xl text-sm font-bold text-[#111]"
                style={{ background: 'linear-gradient(135deg, #ffd60a, #ffc300)' }}
              >
                Ir para a sala →
              </Link>
            </motion.div>
          )}

          {hasData && (
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">

              {/* ── Cards de visão geral (visível para todos) ── */}
              <motion.div variants={fadeSlideUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  {
                    label: 'Divergência média',
                    value: lastSession ? `${lastSession.avgCv}%` : '—',
                    sub: 'última sessão',
                    accent: false,
                  },
                  {
                    label: 'Consenso',
                    value: lastSession ? `${lastSession.convergenceRate}%` : '—',
                    sub: 'issues com acordo',
                    accent: true,
                  },
                  {
                    label: 'Rounds médios',
                    value: lastSession ? `${lastSession.avgRounds}` : '—',
                    sub: 'por issue',
                    accent: false,
                  },
                  {
                    label: 'Horas estimadas',
                    value: lastSession ? `${lastSession.totalHours}h` : '—',
                    sub: 'última sessão',
                    accent: false,
                  },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="rounded-[16px] p-4 border border-white/5 bg-white/[0.03]"
                  >
                    <strong className={`block text-[1.4rem] font-bold mb-1 ${card.accent ? 'text-[#26d07c]' : 'text-[#ffd60a]'}`}>
                      {card.value}
                    </strong>
                    <p className="text-xs font-medium text-[#f5f7fb]">{card.label}</p>
                    <p className="text-xs text-[#9aa0aa]">{card.sub}</p>
                  </div>
                ))}
              </motion.div>

              {/* ── Leitura narrativa do time ── */}
              {lastSession && (
                <motion.div variants={fadeSlideUp}
                  className="rounded-[20px] border border-white/5 bg-white/[0.02] p-5"
                >
                  <p className="text-[0.65rem] font-extrabold text-[#9aa0aa] uppercase tracking-widest mb-2">
                    Leitura do time
                  </p>
                  {lastSession.avgCv < 25 ? (
                    <p className="text-sm text-[#f5f7fb] leading-relaxed">
                      O time está estimando com{' '}
                      <span className="text-[#26d07c] font-semibold">alto alinhamento</span>.{' '}
                      A divergência está baixa — bom sinal de entendimento compartilhado do escopo.
                    </p>
                  ) : lastSession.avgCv < 60 ? (
                    <p className="text-sm text-[#f5f7fb] leading-relaxed">
                      O time está apresentando{' '}
                      <span className="text-[#ffd60a] font-semibold">divergência moderada</span>{' '}
                      nas estimativas. Algumas issues geram debate — pode indicar escopo pouco claro
                      ou diferentes interpretações de complexidade.
                    </p>
                  ) : (
                    <p className="text-sm text-[#f5f7fb] leading-relaxed">
                      O time está com{' '}
                      <span className="text-[#ff6b6b] font-semibold">alta divergência</span>{' '}
                      nas estimativas. Isso pode indicar falta de alinhamento ou escopo pouco definido.
                      Considere revisar o processo de refinamento antes do próximo sprint.
                    </p>
                  )}
                  {analytics.sessions.length >= 4 && (
                    <p className="text-xs text-[#9aa0aa] mt-2">
                      Tendência:{' '}
                      {analytics.improvingDivergence
                        ? '↘ divergência diminuindo — o time está convergindo mais rápido.'
                        : '↗ divergência aumentando — vale atenção ao alinhamento do time.'}
                    </p>
                  )}
                </motion.div>
              )}

              {/* ── Issues mais divergentes da última sessão (visível para todos) ── */}
              {lastSession && analytics.topDivergentIssues.length > 0 && (
                <motion.div variants={fadeSlideUp}
                  className="rounded-[20px] border border-white/5 bg-white/[0.02] p-5"
                >
                  <h2 className="text-sm font-semibold text-[#f5f7fb] mb-4">Issues com maior divergência</h2>
                  <div className="space-y-3">
                    {analytics.topDivergentIssues.map((issue) => (
                      <div key={`${issue.sessionId}-${issue.issueId}`} className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#f5f7fb] truncate">{issue.title}</p>
                          <p className="text-xs text-[#9aa0aa]">{fmtDate(issue.sessionCompletedAt)}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <DivLabel cv={issue.cv} />
                          <p className="text-xs text-[#9aa0aa]">{issue.cv.toFixed(0)}% CV</p>
                        </div>
                        {/* Barra visual */}
                        <div className="w-20 h-1.5 rounded-full bg-white/5 shrink-0 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(issue.cv, 100)}%`,
                              background: issue.cv < 25 ? '#26d07c' : issue.cv < 60 ? '#ffd60a' : '#ff6b6b',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Teaser para plano Pro */}
                  {!hasAnalytics && (
                    <div className="mt-4 pt-4 border-t border-white/5 text-center">
                      <p className="text-xs text-[#9aa0aa] mb-3">
                        Divergência média desta sessão: <strong className="text-[#ffd60a]">{lastSession.avgCv}%</strong>.
                        Quer ver como evoluiu nos últimos sprints?
                      </p>
                      <UpgradePrompt
                        feature="Evolução histórica de divergência"
                        plan="Pro"
                        description="Veja a tendência de divergência do time sprint a sprint."
                        compact
                      />
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── Issues com mais rounds (Pro gate) ── */}
              <motion.div variants={fadeSlideUp}
                className={`rounded-[20px] border p-5 relative overflow-hidden ${hasAnalytics ? 'border-white/5 bg-white/[0.02]' : 'border-[#ffd60a]/10'}`}
                style={!hasAnalytics ? { background: 'linear-gradient(180deg, rgba(255,214,10,0.04), rgba(255,255,255,0.01))' } : {}}
              >
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-[#f5f7fb]">Issues com mais rounds de votação</h2>
                  <p className="text-xs text-[#9aa0aa] mt-0.5">
                    Candidatas a refinamento extra — exigiram maior número de revisões para convergir
                  </p>
                </div>

                {hasAnalytics ? (
                  analytics.hardIssues.length === 0 ? (
                    <p className="text-xs text-[#9aa0aa] text-center py-6">
                      Nenhuma issue precisou de mais de 1 rodada ainda. Bom sinal! 🎉
                    </p>
                  ) : (() => {
                    const maxRounds = Math.max(...analytics.hardIssues.map((i: HardIssue) => i.rounds))
                    const totalMultiRound = analytics.hardIssues.length
                    return (
                      <div className="space-y-4">
                        {/* Insight textual */}
                        <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                          <p className="text-xs text-[#9aa0aa] leading-relaxed">
                            <span className="text-[#ffd60a] font-semibold">{totalMultiRound} issue{totalMultiRound !== 1 ? 's' : ''}</span>
                            {' '}precisaram de mais de 1 rodada de votação.
                            {maxRounds >= 3 && (
                              <> A mais complexa chegou a <span className="text-[#ff6b6b] font-semibold">{maxRounds} rodadas</span>.</>
                            )}
                            {' '}Revisar o detalhamento destas issues no refinamento pode reduzir o tempo de cerimônia.
                          </p>
                        </div>

                        {/* Lista */}
                        <div className="space-y-3">
                          {analytics.hardIssues.map((issue: HardIssue) => (
                            <div key={issue.issueId} className="flex items-center gap-3">
                              {/* Rounds badge */}
                              <div className={`shrink-0 w-8 h-8 rounded-lg grid place-items-center text-xs font-extrabold border ${
                                issue.rounds >= 4
                                  ? 'border-[#ff6b6b]/30 bg-[#ff6b6b]/10 text-[#ff6b6b]'
                                  : issue.rounds >= 3
                                    ? 'border-[#ffd60a]/30 bg-[#ffd60a]/10 text-[#ffd60a]'
                                    : 'border-white/10 bg-white/5 text-[#9aa0aa]'
                              }`}>
                                ×{issue.rounds}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-[#f5f7fb] truncate">{issue.title}</p>
                                <p className="text-xs text-[#9aa0aa]">
                                  {issue.sessionLabel}
                                  {issue.estimate != null && <> · {issue.estimate}h estimada</>}
                                </p>
                              </div>

                              <div className="shrink-0 text-right">
                                <DivLabel cv={issue.cv} />
                                <RoundsBar rounds={issue.rounds} max={maxRounds} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()
                ) : (
                  <div className="relative">
                    <div className="blur-sm pointer-events-none select-none opacity-40 space-y-3 py-2">
                      {[
                        { title: 'Migração do serviço de pagamento', rounds: 4, sprint: 'Sprint 2' },
                        { title: 'Refatoração do módulo de auth', rounds: 3, sprint: 'Sprint 3' },
                        { title: 'Integração com API externa', rounds: 2, sprint: 'Sprint 1' },
                      ].map((item) => (
                        <div key={item.title} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg border border-[#ffd60a]/30 bg-[#ffd60a]/10 grid place-items-center text-xs font-extrabold text-[#ffd60a]">
                            ×{item.rounds}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#f5f7fb] truncate">{item.title}</p>
                            <p className="text-xs text-[#9aa0aa]">{item.sprint}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <UpgradePrompt
                        feature="Issues com mais rounds"
                        plan="Pro"
                        description="Identifique quais issues exigiram mais revisões e onde focar o refinamento."
                      />
                    </div>
                  </div>
                )}
              </motion.div>

              {/* ── Evolução de divergência (Pro gate) ── */}
              <motion.div variants={fadeSlideUp}
                className={`rounded-[20px] border p-5 relative overflow-hidden ${hasAnalytics ? 'border-white/5 bg-white/[0.02]' : 'border-[#ffd60a]/10'}`}
                style={!hasAnalytics ? { background: 'linear-gradient(180deg, rgba(255,214,10,0.04), rgba(255,255,255,0.01))' } : {}}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-[#f5f7fb]">Evolução de divergência por sprint</h2>
                  {hasAnalytics && analytics.sessions.length >= 4 && (
                    <TrendArrow improving={analytics.improvingDivergence} />
                  )}
                </div>

                {hasAnalytics ? (
                  analytics.sessions.length < 2 ? (
                    <p className="text-xs text-[#9aa0aa] text-center py-6">
                      Encerre pelo menos 2 sessões para ver a evolução.
                    </p>
                  ) : (
                    <BarChart
                      data={analytics.sessions}
                      valueKey="avgCv"
                      labelKey="label"
                      color="#ffd60a"
                      maxValue={100}
                    />
                  )
                ) : (
                  <div className="relative">
                    {/* Preview desfocado */}
                    <div className="blur-sm pointer-events-none select-none opacity-40">
                      <BarChart
                        data={[
                          { id: '1', completedAt: '', label: 'Sprint 1', avgCv: 62, avgStdDev: 2, convergenceRate: 40, totalHours: 45, avgRounds: 2.1, issueCount: 10 },
                          { id: '2', completedAt: '', label: 'Sprint 2', avgCv: 48, avgStdDev: 1.8, convergenceRate: 55, totalHours: 52, avgRounds: 1.8, issueCount: 12 },
                          { id: '3', completedAt: '', label: 'Sprint 3', avgCv: 35, avgStdDev: 1.4, convergenceRate: 70, totalHours: 38, avgRounds: 1.5, issueCount: 9 },
                        ] as SessionMetric[]}
                        valueKey="avgCv"
                        labelKey="label"
                        color="#ffd60a"
                        maxValue={100}
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <UpgradePrompt
                        feature="Evolução por sprint"
                        plan="Pro"
                        description="Veja a tendência de divergência sprint a sprint e saiba se o time está melhorando."
                      />
                    </div>
                  </div>
                )}
              </motion.div>

              {/* ── Taxa de convergência (Pro gate) ── */}
              {hasAnalytics && analytics.sessions.length >= 2 && (
                <motion.div variants={fadeSlideUp}
                  className="rounded-[20px] border border-white/5 bg-white/[0.02] p-5"
                >
                  <h2 className="text-sm font-semibold text-[#f5f7fb] mb-1">Convergência por sprint</h2>
                  <p className="text-xs text-[#9aa0aa] mb-4">% de issues onde o time chegou a consenso (CV &lt; 25%)</p>
                  <BarChart
                    data={analytics.sessions}
                    valueKey="convergenceRate"
                    labelKey="label"
                    color="#26d07c"
                    maxValue={100}
                  />
                </motion.div>
              )}

              {/* ── Estimado vs Gasto (Pro gate) ── */}
              <motion.div variants={fadeSlideUp}
                className={`rounded-[20px] border p-5 relative overflow-hidden ${hasAnalytics ? 'border-white/5 bg-white/[0.02]' : 'border-[#ffd60a]/10'}`}
                style={!hasAnalytics ? { background: 'linear-gradient(180deg, rgba(255,214,10,0.04), rgba(255,255,255,0.01))' } : {}}
              >
                <h2 className="text-sm font-semibold text-[#f5f7fb] mb-1">Estimado vs Gasto real</h2>
                <p className="text-xs text-[#9aa0aa] mb-4">Requer dados de <code className="font-mono">timetracking</code> preenchidos no Jira</p>

                {hasAnalytics ? (
                  <AccuracyChart data={analytics.accuracyPoints} />
                ) : (
                  <div className="relative">
                    <div className="blur-sm pointer-events-none select-none opacity-40 py-6 text-center">
                      <div className="text-4xl mb-2">📈</div>
                      <p className="text-sm text-[#9aa0aa]">Gráfico de precisão de estimativa</p>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <UpgradePrompt
                        feature="Precisão de estimativa"
                        plan="Pro"
                        description="Compare o que o time estimou com o que foi gasto de acordo com o Jira."
                        compact
                      />
                    </div>
                  </div>
                )}
              </motion.div>

              {/* ── Comparação entre 2 sprints (Pro gate) ── */}
              <motion.div variants={fadeSlideUp}
                className={`rounded-[20px] border p-5 relative overflow-hidden ${hasCompareSprints ? 'border-white/5 bg-white/[0.02]' : 'border-[#ffd60a]/10'}`}
                style={!hasCompareSprints ? { background: 'linear-gradient(180deg, rgba(255,214,10,0.04), rgba(255,255,255,0.01))' } : {}}
              >
                <h2 className="text-sm font-semibold text-[#f5f7fb] mb-4">Comparar dois sprints</h2>
                {hasCompareSprints && allSessions.length >= 2 ? (
                  <SprintComparison sessions={allSessions} metrics={analytics.sessions} />
                ) : hasCompareSprints && allSessions.length < 2 ? (
                  <p className="text-xs text-[#9aa0aa] text-center py-6">
                    Encerre pelo menos 2 sessões para comparar sprints.
                  </p>
                ) : (
                  <UpgradePrompt
                    feature="Comparação entre sprints"
                    plan="Pro"
                    description="Selecione dois sprints e compare métricas lado a lado."
                  />
                )}
              </motion.div>

            </motion.div>
          )}
        </main>
      </div>
    </div>
  )
}
