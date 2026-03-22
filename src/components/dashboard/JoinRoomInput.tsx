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
    <form 
      onSubmit={handleJoin} 
      className="flex gap-[12px] p-[6px] bg-[rgba(0,0,0,0.4)] border border-white/5 rounded-[12px] shadow-sm"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="hornetpoker.com/room/sprint-32"
        className="flex-1 bg-transparent border-none text-[#f5f7fb] px-[16px] text-[0.95rem] outline-none placeholder:text-[#5a606a]"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="inline-flex items-center gap-[8px] px-[24px] py-[12px] rounded-[8px] font-extrabold text-[#111] transition-all duration-[0.18s] ease-out hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_12px_24px_rgba(255,214,10,0.18)]"
        style={{
          background: 'linear-gradient(135deg, #ffd60a, #ffc300)'
        }}
      >
        Entrar
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </button>
    </form>
  )
}
