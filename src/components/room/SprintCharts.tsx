'use client'

import { motion } from 'framer-motion'
import type { Database } from '@/lib/types/database'

type Issue = Database['public']['Tables']['issues']['Row']

export interface SprintChartsProps {
  issues: Issue[]
}

// ─── helpers ────────────────────────────────────────────────────────────────

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item) || 'Sem info'
    acc[k] = acc[k] ? [...acc[k], item] : [item]
    return acc
  }, {})
}

const PALETTE = [
  '#F59E0B', '#3B82F6', '#10B981', '#EF4444',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
]

// ─── Donut simples ───────────────────────────────────────────────────────────

interface DonutSlice { label: string; value: number; color: string }

function Donut({ slices, size = 120 }: { slices: DonutSlice[]; size?: number }) {
  const total = slices.reduce((s, d) => s + d.value, 0)
  if (total === 0) return <p className="text-xs text-muted-foreground">Sem dados</p>

  const r = 40
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  let offset = 0

  const arcs = slices.map((s) => {
    const pct = s.value / total
    const dash = pct * circumference
    const arc = { ...s, dash, offset, pct }
    offset += dash
    return arc
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={18} />
      {arcs.map((arc, i) => (
        <motion.circle
          key={arc.label}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={arc.color}
          strokeWidth={18}
          strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
          strokeDashoffset={circumference / 4 - arc.offset}
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${arc.dash} ${circumference - arc.dash}` }}
          transition={{ delay: i * 0.08, duration: 0.6, ease: 'easeOut' }}
        />
      ))}
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize={14} fontWeight="bold" fill="currentColor">
        {total}
      </text>
    </svg>
  )
}

// ─── Barra horizontal ────────────────────────────────────────────────────────

interface BarItem { label: string; value: number; subValue?: number; color?: string }

function HorizontalBars({
  items,
  max,
  unit = '',
  secondaryLabel,
}: {
  items: BarItem[]
  max: number
  unit?: string
  secondaryLabel?: string
}) {
  if (items.length === 0) return <p className="text-xs text-muted-foreground">Sem dados</p>
  const safeMax = max || 1

  return (
    <div className="space-y-2 w-full">
      {items.map((item, i) => (
        <div key={item.label}>
          <div className="flex items-center justify-between mb-0.5 text-xs">
            <span className="text-foreground/80 truncate max-w-[160px]" title={item.label}>
              {item.label}
            </span>
            <span className="text-muted-foreground ml-2 shrink-0">
              {item.value}{unit}
              {item.subValue !== undefined && secondaryLabel && (
                <span className="text-muted-foreground/60 ml-1">
                  / {item.subValue.toFixed(1)}{unit} {secondaryLabel}
                </span>
              )}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: item.color ?? PALETTE[i % PALETTE.length] }}
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / safeMax) * 100}%` }}
              transition={{ delay: i * 0.06, duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          {item.subValue !== undefined && (
            <div className="h-1 rounded-full bg-muted overflow-hidden mt-0.5">
              <motion.div
                className="h-full rounded-full opacity-40"
                style={{ backgroundColor: item.color ?? PALETTE[i % PALETTE.length] }}
                initial={{ width: 0 }}
                animate={{ width: `${(item.subValue / safeMax) * 100}%` }}
                transition={{ delay: i * 0.06 + 0.1, duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Card de gráfico ─────────────────────────────────────────────────────────

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3"
    >
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</h3>
      {children}
    </motion.div>
  )
}

// ─── Progresso Geral ─────────────────────────────────────────────────────────

function ProgressRing({ done, total }: { done: number; total: number }) {
  const r = 52
  const circumference = 2 * Math.PI * r
  const pct = total > 0 ? done / total : 0
  const dash = pct * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={130} height={130} viewBox="0 0 130 130">
        <circle cx={65} cy={65} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={14} />
        <motion.circle
          cx={65} cy={65} r={r}
          fill="none"
          stroke="#F59E0B"
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeDashoffset={circumference / 4}
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${dash} ${circumference - dash}` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        <text x={65} y={60} textAnchor="middle" fontSize={22} fontWeight="bold" fill="currentColor">
          {done}
        </text>
        <text x={65} y={78} textAnchor="middle" fontSize={11} fill="gray">
          de {total}
        </text>
      </svg>
      <p className="text-xs text-muted-foreground">
        {total > 0 ? Math.round(pct * 100) : 0}% estimadas
      </p>
    </div>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function SprintCharts({ issues }: SprintChartsProps) {
  const total = issues.length
  const done = issues.filter((i) => i.status === 'revealed').length
  const skipped = issues.filter((i) => i.status === 'skipped').length
  const pending = issues.filter((i) => ['pending', 'voting'].includes(i.status)).length
  const totalEstimated = issues.reduce((s, i) => s + (i.final_estimate ?? 0), 0)
  const totalSpent = issues.reduce((s, i) => s + (i.spent_hours ?? 0), 0)

  // ── Por desenvolvedor ──────────────────────────────────────────────────────
  const byDev = groupBy(issues, (i) => i.assignee_name ?? 'Sem responsável')
  const devItems: BarItem[] = Object.entries(byDev)
    .map(([label, arr], i) => ({
      label,
      value: arr.reduce((s, x) => s + (x.final_estimate ?? 0), 0),
      subValue: arr.reduce((s, x) => s + (x.spent_hours ?? 0), 0),
      color: PALETTE[i % PALETTE.length],
    }))
    .filter((d) => d.value > 0 || d.subValue! > 0)
    .sort((a, b) => b.value - a.value)

  const devCountItems: BarItem[] = Object.entries(byDev)
    .map(([label, arr], i) => ({ label, value: arr.length, color: PALETTE[i % PALETTE.length] }))
    .sort((a, b) => b.value - a.value)

  // ── Por tipo ───────────────────────────────────────────────────────────────
  const byType = groupBy(issues, (i) => i.issue_type ?? 'Sem tipo')
  const TYPE_COLOR: Record<string, string> = {
    Bug: '#EF4444', Melhoria: '#3B82F6', Story: '#8B5CF6',
    Task: '#14B8A6', Epic: '#F97316', 'Sem tipo': '#6B7280',
  }
  const typeSlices: DonutSlice[] = Object.entries(byType).map(([label, arr]) => ({
    label, value: arr.length,
    color: TYPE_COLOR[label] ?? PALETTE[Object.keys(byType).indexOf(label) % PALETTE.length],
  }))

  // ── Por criticidade ────────────────────────────────────────────────────────
  const byCrit = groupBy(issues, (i) => i.criticality ?? 'Sem criticidade')
  const CRIT_COLOR: Record<string, string> = {
    Blocker: '#EF4444', Critical: '#F97316', Major: '#F59E0B', Minor: '#6B7280', Trivial: '#9CA3AF',
  }
  const critSlices: DonutSlice[] = Object.entries(byCrit).map(([label, arr]) => ({
    label, value: arr.length,
    color: CRIT_COLOR[label] ?? '#6B7280',
  }))

  // ── Por status Jira ────────────────────────────────────────────────────────
  const byStatus = groupBy(issues, (i) => i.jira_status ?? 'Sem status')
  const statusItems: BarItem[] = Object.entries(byStatus)
    .map(([label, arr], i) => ({ label, value: arr.length, color: PALETTE[i % PALETTE.length] }))
    .sort((a, b) => b.value - a.value)

  const maxDev = Math.max(...devItems.map((d) => Math.max(d.value, d.subValue ?? 0)), 1)
  const maxDevCount = Math.max(...devCountItems.map((d) => d.value), 1)
  const maxStatus = Math.max(...statusItems.map((d) => d.value), 1)

  return (
    <div className="h-full overflow-auto p-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total de Issues', value: String(total), color: 'text-foreground' },
          { label: 'Estimadas', value: String(done), color: 'text-green-500' },
          { label: 'Horas Estimadas', value: `${totalEstimated.toFixed(1)}h`, color: 'text-primary' },
          { label: 'Horas Gastas', value: `${totalSpent.toFixed(1)}h`, color: 'text-blue-400' },
        ].map((kpi) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl px-3 py-2 text-center"
          >
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Progresso da Sprint */}
        <ChartCard title="Progresso da Sprint">
          <div className="flex items-center justify-around">
            <ProgressRing done={done} total={total} />
            <div className="text-xs space-y-2">
              {[
                { label: 'Estimadas', count: done, color: '#10B981' },
                { label: 'Pendentes', count: pending, color: '#F59E0B' },
                { label: 'Puladas',   count: skipped, color: '#6B7280' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-semibold ml-auto">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Issues por tipo */}
        <ChartCard title="Distribuição por Tipo">
          <div className="flex items-center gap-4">
            <Donut slices={typeSlices} size={110} />
            <div className="text-xs space-y-1.5 flex-1">
              {typeSlices.sort((a, b) => b.value - a.value).map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-foreground/80 truncate">{s.label}</span>
                  <span className="font-semibold ml-auto">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Issues por criticidade */}
        <ChartCard title="Criticidade">
          <div className="flex items-center gap-4">
            <Donut slices={critSlices} size={110} />
            <div className="text-xs space-y-1.5 flex-1">
              {critSlices.sort((a, b) => b.value - a.value).map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-foreground/80 truncate">{s.label}</span>
                  <span className="font-semibold ml-auto">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Horas por desenvolvedor */}
        <ChartCard title="Horas por Desenvolvedor">
          {devItems.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhuma estimativa finalizada.</p>
          ) : (
            <>
              <HorizontalBars
                items={devItems}
                max={maxDev}
                unit="h"
                secondaryLabel="gasto"
              />
              <p className="text-xs text-muted-foreground/60">
                Barra principal = estimado · barra clara = gasto
              </p>
            </>
          )}
        </ChartCard>

        {/* Qtd de issues por desenvolvedor */}
        <ChartCard title="Issues por Desenvolvedor">
          <HorizontalBars items={devCountItems} max={maxDevCount} unit=" issues" />
        </ChartCard>

        {/* Status Jira */}
        <ChartCard title="Status no Jira">
          <HorizontalBars items={statusItems} max={maxStatus} />
        </ChartCard>

      </div>
    </div>
  )
}
