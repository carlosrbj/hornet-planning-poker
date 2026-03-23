'use client'

import { createClient } from '@/lib/supabase/client'
import { motion, Variants } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'

export default function LoginPage() {
  const [imgError, setImgError] = useState(false);

  async function handleGoogleLogin() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
  }

  // Animation variants
  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  }

  const fadeInLeft: Variants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  }

  return (
    <main className="min-h-screen grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] relative isolate overflow-hidden bg-[#050505] text-[#f5f7fb] font-sans">
      
      {/* Background Gradients */}
      <div 
        className="absolute inset-0 z-[-2] pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 15% 20%, rgba(255,214,10,0.10), transparent 22%),
            radial-gradient(circle at 85% 18%, rgba(255,214,10,0.06), transparent 24%),
            radial-gradient(circle at 50% 100%, rgba(255,214,10,0.08), transparent 28%),
            linear-gradient(180deg, #030303 0%, #080808 100%)
          `
        }}
      />
      {/* Background Grid Pattern mask */}
      <div 
        className="absolute inset-0 z-[-1] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(circle at center, black 35%, transparent 88%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 35%, transparent 88%)'
        }}
      />

      {/* --- BRAND SIDE --- */}
      <section className="flex flex-col justify-between relative min-h-screen xl:min-h-0 xl:p-[40px] max-xl:pb-[12px] max-md:p-[22px_18px_0]">
        
        {/* Top Header */}
        <motion.div 
          initial="hidden" animate="show" variants={fadeInLeft}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <a href="#" className="inline-flex items-center gap-[14px] no-underline text-[#f5f7fb]">
            <span 
              className="w-[42px] h-[42px] rounded-xl shrink-0"
              style={{
                background: 'linear-gradient(135deg, #ffd60a, #ffc300)',
                clipPath: 'polygon(12% 50%, 42% 16%, 66% 23%, 96% 11%, 78% 46%, 98% 41%, 70% 62%, 44% 57%, 20% 86%, 34% 62%)',
                boxShadow: '0 0 24px rgba(255,214,10,0.25)'
              }}
            />
            <span>
              <strong className="block text-[0.95rem] uppercase tracking-[0.08em] font-bold">Hornet</strong>
              <span className="block text-[#9aa0aa] text-[0.72rem] mt-1 uppercase tracking-[0.18em]">Planning Poker</span>
            </span>
          </a>
          <div className="border border-white/10 bg-white/5 text-[#9aa0aa] rounded-full px-4 py-[12px] text-[0.82rem] font-semibold backdrop-blur-[12px] w-full sm:w-auto text-center sm:text-left">
            Tempo real &bull; Jira sync &bull; Login com Google
          </div>
        </motion.div>

        {/* Center Content */}
        <motion.div 
          variants={staggerContainer} initial="hidden" animate="show"
          className="max-w-[620px] py-[40px] mt-8 xl:mt-0 xl:my-auto"
        >
          <motion.span variants={fadeInUp} className="inline-flex items-center gap-[10px] px-[14px] py-[9px] rounded-full border border-[#ffd60a]/14 bg-[#ffd60a]/5 text-[#ffd60a] uppercase tracking-[0.16em] text-[0.72rem] font-extrabold mb-[22px]">
            <span className="w-2 h-2 rounded-full bg-[#ffd60a] shadow-[0_0_14px_rgba(255,214,10,0.6)]" />
            Stop guessing. Start swarming.
          </motion.span>
          
          <motion.h1 variants={fadeInUp} className="text-[clamp(3rem,5vw,5.5rem)] leading-[0.94] tracking-[-0.05em] max-w-[11ch] xl:max-w-[9.5ch] mb-[20px] font-bold">
            Entre rápido.<br />Decida rápido.
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="max-w-[56ch] text-[#9aa0aa] text-[1rem] xl:text-[1.08rem] leading-[1.75] mb-[34px]">
            Acesso com Google para entrar no enxame em segundos. Sem senha, sem fricção,
            sem cara de ferramenta genérica. Só sprint alinhada, estimativa em horas e
            decisão coletiva do jeito certo.
          </motion.p>

          <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-3 gap-[14px] max-w-full xl:max-w-[780px]">
            <motion.div variants={fadeInUp} className="border border-white/5 bg-white/5 rounded-[20px] p-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <strong className="block text-[#ffd60a] text-[1.1rem] mb-2 font-bold">Login sem atrito</strong>
              <span className="text-[#9aa0aa] text-[0.92rem] leading-[1.55]">Autenticação direta com Google para reduzir abandono na entrada.</span>
            </motion.div>
            <motion.div variants={fadeInUp} className="border border-white/5 bg-white/5 rounded-[20px] p-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <strong className="block text-[#ffd60a] text-[1.1rem] mb-2 font-bold">Identidade Hornet</strong>
              <span className="text-[#9aa0aa] text-[0.92rem] leading-[1.55]">Dark mode agressivo, contraste alto e presença visual de produto SaaS sério.</span>
            </motion.div>
            <motion.div variants={fadeInUp} className="border border-white/5 bg-white/5 rounded-[20px] p-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <strong className="block text-[#ffd60a] text-[1.1rem] mb-2 font-bold">Pronto para squads</strong>
              <span className="text-[#9aa0aa] text-[0.92rem] leading-[1.55]">Fluxo ideal para times internos e comercialização do produto para clientes.</span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }}
          className="flex flex-wrap gap-[18px] text-[#737984] text-[0.9rem] pb-8 xl:pb-0"
        >
          <span className="inline-flex items-center gap-[8px]"><span className="w-1.5 h-1.5 rounded-full bg-white/30" />Estimativa colaborativa em tempo real</span>
          <span className="inline-flex items-center gap-[8px]"><span className="w-1.5 h-1.5 rounded-full bg-white/30" />Integração nativa com Jira</span>
          <span className="inline-flex items-center gap-[8px]"><span className="w-1.5 h-1.5 rounded-full bg-white/30" />Planejado para times ágeis</span>
        </motion.div>
      </section>

      {/* --- AUTH SIDE --- */}
      <aside className="grid place-items-center md:p-[32px] max-md:p-[18px]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[520px] rounded-[24px] md:rounded-[32px] md:p-[28px] max-md:p-[22px_18px] border border-[rgba(255,214,10,0.14)] relative overflow-hidden backdrop-blur-[20px] shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03)), rgba(10,10,10,0.86)'
          }}
        >
          {/* Decorative Glow */}
          <div 
            className="absolute -top-[80px] -right-[40px] w-[180px] h-[180px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,214,10,0.24), transparent 68%)' }}
          />

          {!imgError && (
            <div className="flex justify-center mb-[22px]">
              <Image 
                src="/auth-logo.png" 
                alt="Hornet Logo" 
                width={330} 
                height={330}
                className="w-[min(100%,330px)] h-auto block drop-shadow-[0_12px_30px_rgba(255,214,10,0.12)]"
                priority
                onError={() => setImgError(true)}
              />
            </div>
          )}

          <div className="text-center mb-[26px]">
            <span className="text-[#ffd60a] uppercase tracking-[0.18em] text-[0.74rem] font-extrabold mb-[12px] inline-block">
              ACESSO AO SWARM
            </span>
            <h2 className="text-[2rem] leading-[1.05] tracking-[-0.04em] mb-[12px] font-bold">
              Login e cadastro com conta<br/>Google
            </h2>
            <p className="text-[#9aa0aa] leading-[1.7] text-[0.98rem] max-w-[34ch] mx-auto">
              Use sua conta Google para entrar ou criar seu acesso. Um botão, zero novela.
            </p>
          </div>

          <div className="grid gap-[14px]">
            <button
              onClick={handleGoogleLogin}
              className="w-full min-h-[64px] border border-white/10 rounded-[18px] inline-flex items-center justify-center gap-[14px] no-underline font-extrabold text-[1rem] shadow-[0_14px_34px_rgba(0,0,0,0.28)] transition-all duration-[0.18s] ease-out hover:-translate-y-[2px] hover:shadow-[0_18px_40px_rgba(0,0,0,0.34)] hover:border-[#ffd60a]/35"
              style={{ background: 'linear-gradient(180deg, #fff 0%, #f4f4f4 100%)', color: '#111' }}
            >
              <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuar com Google
            </button>

            <div className="flex items-center gap-[12px] text-[#6f7580] text-[0.82rem] uppercase tracking-[0.16em] my-[4px]">
              <div className="flex-1 h-[1px] bg-white/10" />
              <span>AUTENTICAÇÃO ÚNICA</span>
              <div className="flex-1 h-[1px] bg-white/10" />
            </div>

            <div className="grid gap-[12px] mt-[6px]">
              <div className="flex gap-[12px] items-start p-[14px] px-[16px] rounded-[16px] border border-white/10 bg-white/5">
                <div className="w-[10px] h-[10px] rounded-full bg-[#ffd60a] shadow-[0_0_14px_rgba(255,214,10,0.5)] mt-[6px] shrink-0" />
                <div className="text-[#9aa0aa] leading-[1.6] text-[0.94rem]">
                  <strong className="text-white">Login e cadastro usam o mesmo fluxo.</strong> Se for sua primeira vez, sua conta é criada automaticamente.
                </div>
              </div>
              <div className="flex gap-[12px] items-start p-[14px] px-[16px] rounded-[16px] border border-white/10 bg-white/5">
                <div className="w-[10px] h-[10px] rounded-full bg-[#ffd60a] shadow-[0_0_14px_rgba(255,214,10,0.5)] mt-[6px] shrink-0" />
                <div className="text-[#9aa0aa] leading-[1.6] text-[0.94rem]">
                  <strong className="text-white">Nada de senha.</strong> Menos suporte, menos fricção e menos abandono na entrada.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-[18px] text-center text-[#727884] text-[0.86rem] leading-[1.6]">
            Ao continuar, você concorda com os <a href="#" className="text-[#ffd60a] font-bold no-underline">Termos de uso</a> e a <a href="#" className="text-[#ffd60a] font-bold no-underline">Politica de privacidade</a>.
          </div>
        </motion.div>
      </aside>
    </main>
  )
}
