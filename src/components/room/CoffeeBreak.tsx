'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTimer } from '@/hooks/useTimer'

export interface CoffeeBreakProps {
  active: boolean
  durationSeconds?: number
  onEnd: () => void
}

export default function CoffeeBreak({ active, durationSeconds = 300, onEnd }: CoffeeBreakProps) {
  const { secondsLeft, isRunning, start, stop } = useTimer(onEnd)

  useEffect(() => {
    if (active) {
      start(durationSeconds)
    } else {
      stop()
    }
  }, [active])

  const minutes = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-secondary/90 backdrop-blur-sm flex flex-col items-center justify-center gap-6"
        >
          {/* Xícara animada */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="text-8xl"
          >
            ☕
          </motion.div>

          {/* Vapor */}
          <div className="flex gap-3">
            {[0, 0.3, 0.6].map((delay, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -20], opacity: [0.7, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, delay, ease: 'easeOut' }}
                className="w-1 h-6 bg-white/30 rounded-full"
              />
            ))}
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">Coffee Break ☕</h2>
            <p className="text-secondary-foreground/70 text-lg">
              {minutes}:{String(secs).padStart(2, '0')}
            </p>
          </div>

          <button
            onClick={onEnd}
            className="mt-4 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            Retomar
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
