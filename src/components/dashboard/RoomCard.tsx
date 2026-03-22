'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { fadeSlideUp } from '@/lib/utils/animations'
import type { Database } from '@/lib/types/database'

type Room = Database['public']['Tables']['rooms']['Row']

export interface RoomCardProps {
  room: Room
  onlineCount?: number
  onDelete?: () => Promise<void>
}

const DECK_LABELS: Record<string, string> = {
  hours: '⏱ Horas',
  fibonacci: '🔢 Fibonacci',
  tshirt: '👕 T-Shirt',
  modified_fibonacci: '🔢 Fib. Modificado',
  custom: '✏️ Custom',
}

const STATUS_LABELS: Record<string, { label: string; style: string }> = {
  waiting: { label: 'Aguardando', style: 'bg-[#ffd60a]/10 text-[#ffd60a] border border-[#ffd60a]/20' },
  voting: { label: 'Votando', style: 'bg-[#26d07c]/10 text-[#26d07c] border border-[#26d07c]/20' },
  revealed: { label: 'Revelado', style: 'bg-[#26d07c]/10 text-[#26d07c] border border-[#26d07c]/20' },
  finished: { label: 'Finalizado', style: 'bg-white/10 text-[#9aa0aa] border border-white/20' },
}

export default function RoomCard({ room, onlineCount = 0, onDelete }: RoomCardProps) {
  const status = STATUS_LABELS[room.status] ?? STATUS_LABELS.waiting
  const [copied, setCopied] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleCopyLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/room/${room.slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleConfirmDelete() {
    if (!onDelete) return
    setDeleting(true)
    await onDelete()
    setDeleting(false)
    setConfirming(false)
  }

  return (
    <motion.div
      variants={fadeSlideUp}
      initial="hidden"
      animate="visible"
      className="group relative rounded-[24px] border border-white/5 p-[20px] transition-all duration-[0.18s] ease-out overflow-hidden hover:-translate-y-[3px] hover:border-[#ffd60a]/22 hover:bg-[linear-gradient(180deg,rgba(255,214,10,0.06),rgba(255,255,255,0.03)),rgba(10,10,10,0.95)] z-10"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03)), rgba(10,10,10,0.95)'
      }}
    >
      {/* Decorative Glow */}
      <div 
        className="absolute w-[140px] h-[140px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
        style={{
          background: 'radial-gradient(circle, rgba(255,214,10,0.12), transparent 70%)',
          bottom: '-70px',
          right: '-40px'
        }}
      />

      {/* Confirmação de exclusão */}
      {confirming && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-[#0a0a0a]/95 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20 p-5"
        >
          <p className="text-sm font-medium text-[#f5f7fb] text-center">
            Excluir <span className="text-[#ffd60a]">{room.name}</span>?
          </p>
          <p className="text-xs text-[#9aa0aa] text-center">
            Todas as issues e votos serão removidos permanentemente.
          </p>
          <div className="flex gap-2 w-full mt-1">
            <button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="flex-1 py-2 bg-[#ff6b6b] text-[#111] rounded-lg text-sm font-bold disabled:opacity-50 transition-colors hover:bg-[#ff6b6b]/90 border-transparent box-shadow-[0_14px_36px_rgba(255,107,107,0.18)]"
            >
              {deleting ? '...' : 'Excluir'}
            </button>
            <button
              onClick={() => setConfirming(false)}
              disabled={deleting}
              className="flex-1 py-2 border border-white/10 bg-white/[0.03] rounded-lg text-sm font-bold text-[#f5f7fb] hover:border-[#ffd60a]/20 hover:text-[#ffd60a] transition-colors"
            >
              Cancelar
            </button>
          </div>
        </motion.div>
      )}

      <div className="flex items-start justify-between gap-[12px] mb-[14px]">
        <div>
          <h3 className="text-[1.18rem] tracking-[-0.03em] font-semibold text-[#f5f7fb] mb-[8px]">{room.name}</h3>
          <div className="flex flex-wrap gap-[12px] text-[#9aa0aa] text-[0.9rem]">
            <span className="inline-flex items-center gap-[8px]">
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              {DECK_LABELS[room.deck_type] ?? room.deck_type}
            </span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className={`rounded-full px-[12px] py-[9px] text-[0.78rem] font-extrabold uppercase tracking-[0.12em] whitespace-nowrap ${status.style}`}>
            {status.label}
          </span>
          {onDelete && (
            <button
              onClick={() => setConfirming(true)}
              title="Excluir sala"
              className="text-[#9aa0aa] hover:text-[#ff6b6b] transition-colors text-[1.4rem] leading-none mt-1 ml-1"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="my-[16px] mb-[18px] flex items-center gap-[8px] text-[#9aa0aa] text-[0.93rem]">
        <div className={`w-[10px] h-[10px] rounded-full ${onlineCount > 0 ? 'bg-[#26d07c] shadow-[0_0_12px_rgba(38,208,124,0.5)]' : 'bg-white/20'}`} />
        {onlineCount} participante{onlineCount !== 1 ? 's' : ''} online
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-[10px] sm:grid-cols-[1fr_auto_auto] sm:gap-[10px] mt-auto">
        <Link
          href={`/room/${room.slug}`}
          className="min-h-[50px] rounded-[16px] inline-flex items-center justify-center no-underline font-extrabold text-[#111] shadow-[0_14px_28px_rgba(255,214,10,0.14)] transition-all hover:-translate-y-[1px]"
          style={{ background: 'linear-gradient(135deg, #ffd60a, #ffc300)' }}
        >
          Entrar na Sala
        </Link>
        <button
          onClick={handleCopyLink}
          title="Copiar link"
          className={`w-[50px] h-[50px] rounded-[16px] border bg-white/[0.03] text-[#f5f7fb] grid place-items-center text-[1.1rem] transition-all duration-[0.18s] ease-out hover:-translate-y-[1px] ${
            copied ? 'border-[#26d07c]/40 text-[#26d07c]' : 'border-white/5 hover:border-[#ffd60a]/20 hover:text-[#ffd60a]'
          }`}
        >
          {copied ? '✓' : '🔗'}
        </button>
        <button
          title="Configurações"
          className="hidden sm:grid w-[50px] h-[50px] rounded-[16px] border border-white/5 bg-white/[0.03] text-[#f5f7fb] place-items-center text-[1.1rem] transition-all duration-[0.18s] ease-out hover:-translate-y-[1px] hover:border-[#ffd60a]/20 hover:text-[#ffd60a]"
        >
          ⚙️
        </button>
      </div>
    </motion.div>
  )
}
