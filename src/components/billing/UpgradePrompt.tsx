'use client'

import Link from 'next/link'

export interface UpgradePromptProps {
  feature: string       // ex: "Histórico completo"
  plan: string          // ex: "Starter"
  description?: string  // ex: "Acesse todas as sessões anteriores desta sala"
  compact?: boolean     // inline (true) vs card completo (false)
}

export default function UpgradePrompt({
  feature,
  plan,
  description,
  compact = false,
}: UpgradePromptProps) {
  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#ffd60a]/20 bg-[#ffd60a]/5 text-xs">
        <span>🔒</span>
        <span className="text-[#9aa0aa]">{feature} — disponível no</span>
        <Link href="/settings/billing" className="text-[#ffd60a] font-bold hover:underline">
          plano {plan}
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-[20px] border border-[#ffd60a]/15 p-8 flex flex-col items-center text-center gap-3"
      style={{ background: 'linear-gradient(180deg, rgba(255,214,10,0.05), rgba(255,255,255,0.02))' }}
    >
      <span className="text-4xl">🔒</span>
      <p className="font-bold text-[#f5f7fb] text-lg tracking-[-0.02em]">{feature}</p>
      {description && (
        <p className="text-sm text-[#9aa0aa] max-w-[36ch]">{description}</p>
      )}
      <p className="text-sm text-[#9aa0aa]">
        Disponível no plano{' '}
        <span className="text-[#ffd60a] font-bold">{plan}</span>
      </p>
      <Link
        href="/settings/billing"
        className="mt-1 px-6 py-2.5 rounded-xl text-sm font-bold text-[#111] shadow-[0_8px_24px_rgba(255,214,10,0.18)] transition-all hover:-translate-y-0.5"
        style={{ background: 'linear-gradient(135deg, #ffd60a, #ffc300)' }}
      >
        Ver planos →
      </Link>
    </div>
  )
}
