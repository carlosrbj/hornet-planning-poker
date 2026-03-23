'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import { fadeSlideUp, staggerContainer } from '@/lib/utils/animations'
import type { PlanId } from '@/lib/billing/plans'

interface Plan {
  id: PlanId
  name: string
  price: string
  priceNote: string
  description: string
  features: string[]
  highlight: boolean
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 'R$ 0',
    priceNote: 'para sempre',
    description: 'Para times experimentando planejamento ágil',
    features: [
      'Salas ilimitadas',
      'Votação em tempo real',
      'Integração com Jira (completa)',
      'Última sessão por sala',
      'Timer, emoji, coffee break',
      'Decks customizados',
    ],
    highlight: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 'R$ 4,99',
    priceNote: '/mês · ou R$ 47,90/ano',
    description: 'Para times que querem memória e aprendizado',
    features: [
      'Tudo do Free',
      'Histórico: últimas 10 sessões por sala',
      'Resumo automático de cada sessão',
      'Replay de votos por issue e rodada',
      'Exportação CSV',
      'Retenção de dados por 6 meses',
    ],
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'R$ 9,90',
    priceNote: '/mês · ou R$ 95,04/ano',
    description: 'Para tech leads que querem entender o time',
    features: [
      'Tudo do Starter',
      'Analytics: divergência média por sprint',
      'Issues com maior dispersão de votos',
      'Evolução de convergência entre sprints',
      'Comparação entre 2 sessões',
      'Tendência de subestimação vs. Jira',
      'Exportação PDF de relatório',
      'Histórico por 12 meses',
    ],
    highlight: true,
  },
  {
    id: 'pro_plus',
    name: 'Pro+',
    price: 'R$ 29,90',
    priceNote: '/mês · ou R$ 287,04/ano',
    description: 'Para líderes com visão gerencial',
    features: [
      'Tudo do Pro',
      'Dashboard executivo multi-sala',
      'Estimado vs. gasto histórico (Jira)',
      'Relatórios automáticos pós-sprint',
      'Histórico ilimitado',
      'Visão consolidada por squad/período',
    ],
    highlight: false,
  },
]

interface BillingClientProps {
  currentPlanId: PlanId
}

export default function BillingClient({ currentPlanId }: BillingClientProps) {
  const [interestPlan, setInterestPlan] = useState<PlanId | null>(null)

  function handleUpgradeInterest(planId: PlanId) {
    setInterestPlan(planId)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f7fb] font-sans relative overflow-x-hidden">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundSize: '40px 40px',
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
        }}
      />
      <div
        className="fixed top-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(255,214,10,0.07), transparent 70%)' }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 w-full max-w-[1080px] mx-auto px-4 md:px-6 pt-[42px] pb-[64px]">

          {/* Breadcrumb */}
          <motion.div variants={fadeSlideUp} initial="hidden" animate="visible"
            className="flex items-center gap-2 text-sm text-[#9aa0aa] mb-8"
          >
            <Link href="/dashboard" className="hover:text-[#f5f7fb] transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-[#f5f7fb]">Plano</span>
          </motion.div>

          {/* Header */}
          <motion.div variants={fadeSlideUp} initial="hidden" animate="visible" className="mb-10 text-center">
            <h1 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold tracking-[-0.04em] leading-tight mb-3">
              Escolha seu plano
            </h1>
            <p className="text-[#9aa0aa] max-w-[50ch] mx-auto">
              Jira sempre gratuito. Upgrade quando o time crescer e precisar de mais histórico e análise.
            </p>
          </motion.div>

          {/* Cards de planos */}
          <motion.div
            variants={staggerContainer} initial="hidden" animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
          >
            {PLANS.map((plan) => {
              const isCurrent = plan.id === currentPlanId
              const isUpgradeable = plan.id !== 'free' && !isCurrent

              return (
                <motion.div
                  key={plan.id}
                  variants={fadeSlideUp}
                  className={`relative rounded-[24px] p-5 flex flex-col border transition-all ${
                    plan.highlight
                      ? 'border-[#ffd60a]/30 shadow-[0_0_40px_rgba(255,214,10,0.08)]'
                      : isCurrent
                      ? 'border-[#26d07c]/30'
                      : 'border-white/5'
                  }`}
                  style={{
                    background: plan.highlight
                      ? 'linear-gradient(180deg, rgba(255,214,10,0.07), rgba(255,255,255,0.03))'
                      : 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                  }}
                >
                  {plan.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#111] bg-[#ffd60a]">
                      Popular
                    </span>
                  )}
                  {isCurrent && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#26d07c] border border-[#26d07c]/30 bg-[#0a0a0a]">
                      Plano atual
                    </span>
                  )}

                  <div className="mb-4">
                    <h2 className="text-base font-bold text-[#f5f7fb] mb-1">{plan.name}</h2>
                    <p className="text-[#9aa0aa] text-xs leading-relaxed">{plan.description}</p>
                  </div>

                  <div className="mb-5">
                    <span className="text-2xl font-bold text-[#f5f7fb] tracking-[-0.04em]">{plan.price}</span>
                    <span className="text-xs text-[#9aa0aa] ml-1.5">{plan.priceNote}</span>
                  </div>

                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-[#9aa0aa]">
                        <span className="text-[#26d07c] shrink-0 mt-0.5">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <div className="py-2.5 rounded-xl text-center text-xs font-bold text-[#26d07c] border border-[#26d07c]/20 bg-[#26d07c]/5">
                      Plano atual
                    </div>
                  ) : isUpgradeable ? (
                    <button
                      onClick={() => handleUpgradeInterest(plan.id)}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5 ${
                        plan.highlight
                          ? 'text-[#111] shadow-[0_8px_20px_rgba(255,214,10,0.2)]'
                          : 'text-[#111]'
                      }`}
                      style={{ background: 'linear-gradient(135deg, #ffd60a, #ffc300)' }}
                    >
                      Quero o {plan.name} →
                    </button>
                  ) : (
                    <div className="py-2.5 rounded-xl text-center text-xs font-bold text-[#9aa0aa] border border-white/5">
                      Downgrade
                    </div>
                  )}
                </motion.div>
              )
            })}
          </motion.div>

          {/* Modal de interesse */}
          {interestPlan && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-[480px] mx-auto rounded-[24px] border border-[#ffd60a]/20 p-7 text-center"
              style={{ background: 'linear-gradient(180deg, rgba(255,214,10,0.06), rgba(255,255,255,0.02))' }}
            >
              <div className="text-3xl mb-3">🎉</div>
              <h3 className="font-bold text-[#f5f7fb] text-lg mb-2">
                Interesse no plano {PLANS.find((p) => p.id === interestPlan)?.name} registrado!
              </h3>
              <p className="text-sm text-[#9aa0aa] mb-5">
                O billing automático está em desenvolvimento. Por enquanto, entre em contato para ativar seu plano manualmente.
              </p>
              <div className="flex flex-col gap-2">
                <a
                  href={`mailto:contato@hornet.app?subject=Upgrade para ${PLANS.find((p) => p.id === interestPlan)?.name}`}
                  className="py-2.5 rounded-xl text-sm font-bold text-[#111] text-center"
                  style={{ background: 'linear-gradient(135deg, #ffd60a, #ffc300)' }}
                >
                  Entrar em contato por e-mail →
                </a>
                <button
                  onClick={() => setInterestPlan(null)}
                  className="py-2 text-sm text-[#9aa0aa] hover:text-[#f5f7fb] transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          )}

          {/* Nota Jira sempre gratuito */}
          <motion.p
            variants={fadeSlideUp} initial="hidden" animate="visible"
            className="text-center text-xs text-[#9aa0aa] mt-4"
          >
            A integração com Jira é gratuita em todos os planos, para sempre.
          </motion.p>
        </main>
      </div>
    </div>
  )
}
