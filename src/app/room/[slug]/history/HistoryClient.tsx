'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import SessionSummary from '@/components/room/SessionSummary'
import UpgradePrompt from '@/components/billing/UpgradePrompt'
import { fadeSlideUp, staggerContainer } from '@/lib/utils/animations'
import type { SessionRecord } from '@/lib/types/session'
import type { PlanId } from '@/lib/billing/plans'

const PLAN_LABELS: Record<PlanId, string> = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
  pro_plus: 'Pro+',
}

const UPGRADE_PLAN: Record<PlanId, PlanId | null> = {
  free: 'starter',
  starter: 'pro',
  pro: 'pro_plus',
  pro_plus: null,
}

interface HistoryClientProps {
  roomName: string
  roomSlug: string
  sessions: SessionRecord[]
  hasMore: boolean
  hiddenCount: number
  planId: PlanId
  canExportCsv: boolean
  isRoomOwner: boolean
}

export default function HistoryClient({
  roomName,
  roomSlug,
  sessions,
  hasMore,
  hiddenCount,
  planId,
  canExportCsv,
  isRoomOwner,
}: HistoryClientProps) {
  const upgradeTo = UPGRADE_PLAN[planId]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f7fb] font-sans relative overflow-x-hidden">
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundSize: '40px 40px',
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
        }}
      />
      <div
        className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(255,214,10,0.06), transparent 70%)' }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 w-full max-w-[860px] mx-auto px-4 md:px-6 pt-[42px] pb-[64px]">

          {/* Breadcrumb */}
          <motion.div variants={fadeSlideUp} initial="hidden" animate="visible" className="flex items-center gap-2 text-sm text-[#9aa0aa] mb-6">
            <Link href="/dashboard" className="hover:text-[#f5f7fb] transition-colors">Dashboard</Link>
            <span>/</span>
            <Link href={`/room/${roomSlug}`} className="hover:text-[#f5f7fb] transition-colors truncate max-w-[200px]">{roomName}</Link>
            <span>/</span>
            <span className="text-[#f5f7fb]">Histórico</span>
          </motion.div>

          {/* Header */}
          <motion.div variants={fadeSlideUp} initial="hidden" animate="visible" className="mb-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-[clamp(1.6rem,3vw,2.4rem)] font-bold tracking-[-0.04em] leading-tight mb-1">
                  Histórico de sessões
                </h1>
                <p className="text-[#9aa0aa] text-sm">{roomName}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                {/* Badge do plano */}
                <span className="px-2.5 py-1 rounded-full border border-[#ffd60a]/20 bg-[#ffd60a]/5 text-xs font-bold text-[#ffd60a]">
                  {PLAN_LABELS[planId]}
                </span>
                <Link
                  href={`/room/${roomSlug}/analytics`}
                  className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-bold text-[#9aa0aa] hover:border-[#ffd60a]/20 hover:text-[#ffd60a] transition-all"
                >
                  Analytics →
                </Link>
                <Link
                  href={`/room/${roomSlug}`}
                  className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-bold text-[#9aa0aa] hover:border-[#ffd60a]/20 hover:text-[#ffd60a] transition-all"
                >
                  ← Sala
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Lista de sessões */}
          {sessions.length === 0 ? (
            <motion.div variants={fadeSlideUp} initial="hidden" animate="visible"
              className="text-center py-20 text-[#9aa0aa]"
            >
              <div className="text-5xl mb-4">📋</div>
              <p className="text-lg font-medium text-[#f5f7fb]">Nenhuma sessão encerrada ainda</p>
              <p className="text-sm mt-1">
                {isRoomOwner
                  ? 'Encerre uma sessão na sala para ver o histórico aqui.'
                  : 'O facilitador ainda não encerrou nenhuma sessão desta sala.'}
              </p>
              <Link
                href={`/room/${roomSlug}`}
                className="inline-block mt-6 px-5 py-2.5 rounded-xl text-sm font-bold text-[#111]"
                style={{ background: 'linear-gradient(135deg, #ffd60a, #ffc300)' }}
              >
                Ir para a sala →
              </Link>
            </motion.div>
          ) : (
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
              {sessions.map((session, i) => (
                <motion.div key={session.id} variants={fadeSlideUp}>
                  <SessionSummary
                    session={session}
                    canExportCsv={canExportCsv}
                    defaultExpanded={i === 0} // primeira sessão expandida por padrão
                  />
                </motion.div>
              ))}

              {/* Teaser de upgrade quando Free tem mais sessões bloqueadas */}
              {hasMore && upgradeTo && (
                <motion.div variants={fadeSlideUp}>
                  <div className="rounded-[20px] border border-dashed border-[#ffd60a]/20 p-6 text-center space-y-3">
                    <p className="text-[#9aa0aa] text-sm">
                      <span className="text-[#f5f7fb] font-bold">+{hiddenCount} sessão{hiddenCount !== 1 ? 'ões' : ''}</span>
                      {' '}anterior{hiddenCount !== 1 ? 'es' : ''} bloqueada{hiddenCount !== 1 ? 's' : ''}
                    </p>
                    <UpgradePrompt
                      feature="Histórico completo"
                      plan={PLAN_LABELS[upgradeTo]}
                      description={`Acesse todas as sessões anteriores desta sala no plano ${PLAN_LABELS[upgradeTo]}.`}
                    />
                  </div>
                </motion.div>
              )}

              {/* Teaser de analytics para Pro quando no Starter */}
              {(planId === 'free' || planId === 'starter') && sessions.length >= 2 && (
                <motion.div variants={fadeSlideUp}>
                  <div className="rounded-[20px] border border-white/5 p-6 text-center space-y-2"
                    style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.03), transparent)' }}
                  >
                    <p className="text-sm text-[#9aa0aa]">
                      Você já tem <strong className="text-[#f5f7fb]">{sessions.length} sessões</strong> registradas.
                    </p>
                    <p className="text-sm text-[#9aa0aa]">
                      Quer ver se o seu time está convergindo mais rápido ao longo dos sprints?
                    </p>
                    <UpgradePrompt
                      feature="Analytics de evolução"
                      plan="Pro"
                      description="Divergência média, evolução de convergência e comparação entre sprints."
                      compact
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  )
}
