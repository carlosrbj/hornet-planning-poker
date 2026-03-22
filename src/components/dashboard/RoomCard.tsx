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

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  waiting: { label: 'Aguardando', color: 'text-muted-foreground' },
  voting: { label: 'Votando', color: 'text-primary' },
  revealed: { label: 'Revelado', color: 'text-green-500' },
  finished: { label: 'Finalizado', color: 'text-muted-foreground' },
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
      className="relative bg-card border border-border rounded-xl p-5 flex flex-col gap-4 hover:border-primary/50 transition-colors overflow-hidden"
    >
      {/* Confirmação de exclusão */}
      {confirming && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-card/95 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10 rounded-xl p-5"
        >
          <p className="text-sm font-medium text-foreground text-center">
            Excluir <span className="text-accent">{room.name}</span>?
          </p>
          <p className="text-xs text-muted-foreground text-center">
            Todas as issues e votos serão removidos permanentemente.
          </p>
          <div className="flex gap-2 w-full mt-1">
            <button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="flex-1 py-2 bg-accent text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors hover:bg-accent/90"
            >
              {deleting ? '...' : 'Excluir'}
            </button>
            <button
              onClick={() => setConfirming(false)}
              disabled={deleting}
              className="flex-1 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
          </div>
        </motion.div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{room.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {DECK_LABELS[room.deck_type] ?? room.deck_type}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${status.color}`}>
            {status.label}
          </span>
          {onDelete && (
            <button
              onClick={() => setConfirming(true)}
              title="Excluir sala"
              className="text-muted-foreground hover:text-accent transition-colors text-base leading-none"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${onlineCount > 0 ? 'bg-green-500' : 'bg-muted'}`} />
          {onlineCount} online
        </span>
      </div>

      <div className="flex items-center gap-2 mt-auto">
        <Link
          href={`/room/${room.slug}`}
          className="flex-1 text-center py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Entrar
        </Link>
        <button
          onClick={handleCopyLink}
          title="Copiar link de convite"
          className={`py-2 px-3 border rounded-lg text-sm transition-all duration-300 ${
            copied
              ? 'border-green-500/40 text-green-600 bg-green-500/10'
              : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
          }`}
        >
          {copied ? '✓' : '🔗'}
        </button>
      </div>
    </motion.div>
  )
}
