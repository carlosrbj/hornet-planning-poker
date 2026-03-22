'use client'

import { motion } from 'framer-motion'

export interface TimerProps {
  secondsLeft: number
  totalSeconds: number
  isRunning: boolean
  isFacilitator: boolean
  onStart: () => void
  onStop: () => void
}

export default function Timer({
  secondsLeft,
  totalSeconds,
  isRunning,
  isFacilitator,
  onStart,
  onStop,
}: TimerProps) {
  if (totalSeconds === 0) return null

  const radius = 20
  const circumference = 2 * Math.PI * radius
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 1
  const dashOffset = circumference * (1 - progress)

  const color =
    progress > 0.5 ? '#22c55e' : progress > 0.25 ? '#f59e0b' : '#ef4444'

  const minutes = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const label = `${minutes}:${String(secs).padStart(2, '0')}`

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-12 h-12">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
          <circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="4"
          />
          <motion.circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.5 }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
          {isRunning || secondsLeft > 0 ? label : '—'}
        </span>
      </div>

      {isFacilitator && (
        <button
          onClick={isRunning ? onStop : onStart}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {isRunning ? '⏹' : '▶'}
        </button>
      )}
    </div>
  )
}
