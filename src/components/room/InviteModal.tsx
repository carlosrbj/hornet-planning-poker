'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
  roomSlug: string
  roomName: string
}

export default function InviteModal({ isOpen, onClose, roomSlug, roomName }: InviteModalProps) {
  const [copied, setCopied] = useState(false)

  const inviteUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/room/${roomSlug}`
      : `/room/${roomSlug}`

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-[#0d1020] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Convidar participantes</h2>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Sala</p>
                    <p className="font-medium text-foreground">{roomName}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Código</p>
                    <code className="font-mono text-sm text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {roomSlug}
                    </code>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Link de convite</p>
                    <p className="text-xs text-foreground font-mono break-all">{inviteUrl}</p>
                  </div>
                </div>

                <motion.button
                  onClick={handleCopy}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    copied
                      ? 'bg-green-500/15 text-green-600 border border-green-500/30'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  {copied ? '✓ Link copiado!' : '🔗 Copiar link de convite'}
                </motion.button>

                <p className="text-xs text-center text-muted-foreground">
                  Qualquer pessoa com o link pode entrar como participante
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
