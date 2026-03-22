'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export const REACTION_EMOJIS = ['🎯', '🔥', '😱', '🤔', '☕', '👏', '💀'] as const

interface FloatingEmoji {
  id: number
  emoji: string
  x: number
}

export interface EmojiReactionsProps {
  onSend: (emoji: string) => void
}

export default function EmojiReactions({ onSend }: EmojiReactionsProps) {
  const [floating, setFloating] = useState<FloatingEmoji[]>([])
  const [nextId, setNextId] = useState(0)

  const addEmoji = useCallback((emoji: string) => {
    const id = nextId
    setNextId((n) => n + 1)
    const x = 30 + Math.random() * 40 // % horizontal aleatório

    setFloating((prev) => [...prev, { id, emoji, x }])

    setTimeout(() => {
      setFloating((prev) => prev.filter((e) => e.id !== id))
    }, 2200)
  }, [nextId])

  // Expõe addEmoji globalmente para que o broadcast possa chamar
  useEffect(() => {
    (window as Window & { __addEmojiReaction?: (emoji: string) => void }).__addEmojiReaction = addEmoji
    return () => {
      delete (window as Window & { __addEmojiReaction?: (emoji: string) => void }).__addEmojiReaction
    }
  }, [addEmoji])

  function handleClick(emoji: string) {
    addEmoji(emoji)
    onSend(emoji)
  }

  return (
    <>
      {/* Emojis flutuantes */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-64 h-48 pointer-events-none z-40">
        <AnimatePresence>
          {floating.map((f) => (
            <motion.span
              key={f.id}
              initial={{ opacity: 1, y: 0, x: `${f.x}%` }}
              animate={{ opacity: 0, y: -160 }}
              exit={{}}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="absolute text-3xl"
              style={{ left: `${f.x}%` }}
            >
              {f.emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Barra de botões */}
      <div className="flex items-center gap-1">
        {REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleClick(emoji)}
            className="text-xl hover:scale-125 active:scale-95 transition-transform"
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
    </>
  )
}
