'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function JoinRoomInput() {
  const [value, setValue] = useState('')
  const router = useRouter()

  function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return

    let slug = trimmed
    try {
      const url = new URL(trimmed)
      const parts = url.pathname.split('/')
      const roomIdx = parts.indexOf('room')
      if (roomIdx !== -1 && parts[roomIdx + 1]) {
        slug = parts[roomIdx + 1]
      }
    } catch {
      // Not a URL — use as slug code directly
    }

    router.push(`/room/${slug}`)
  }

  return (
    <form onSubmit={handleJoin} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Cole o link ou código da sala..."
        className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Entrar
      </button>
    </form>
  )
}
