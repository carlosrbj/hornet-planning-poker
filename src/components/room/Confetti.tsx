'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Particle {
  id: number
  x: number
  y: number
  color: string
  rotation: number
  scale: number
  vx: number
  vy: number
}

const COLORS = ['#f59e0b', '#1e293b', '#ffffff', '#ef4444', '#22c55e', '#3b82f6']

export interface ConfettiProps {
  active: boolean
}

export default function Confetti({ active }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animFrameRef = useRef<number>(0)

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(animFrameRef.current)
      particlesRef.current = []
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        ctx?.clearRect(0, 0, canvas.width, canvas.height)
      }
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Criar partículas
    particlesRef.current = Array.from({ length: 120 }, (_, i) => ({
      id: i,
      x: Math.random() * canvas.width,
      y: -20,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      scale: Math.random() * 0.6 + 0.4,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
    }))

    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current = particlesRef.current.filter((p) => p.y < canvas.height + 20)

      for (const p of particlesRef.current) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.05 // gravity
        p.rotation += 3

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.scale(p.scale, p.scale)
        ctx.fillStyle = p.color
        ctx.fillRect(-5, -5, 10, 10)
        ctx.restore()
      }

      if (particlesRef.current.length > 0) {
        animFrameRef.current = requestAnimationFrame(draw)
      }
    }

    animFrameRef.current = requestAnimationFrame(draw)

    return () => cancelAnimationFrame(animFrameRef.current)
  }, [active])

  return (
    <AnimatePresence>
      {active && (
        <motion.canvas
          ref={canvasRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-50"
        />
      )}
    </AnimatePresence>
  )
}
