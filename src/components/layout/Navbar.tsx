'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/hooks/useTheme'
import { useState, useEffect } from 'react'

export interface NavbarProps {
  userDisplayName?: string
  userAvatarUrl?: string | null
}

export default function Navbar({ userDisplayName, userAvatarUrl }: NavbarProps) {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-[rgba(8,8,8,0.82)] backdrop-blur-[16px] shrink-0 overflow-hidden">
      <div className="max-w-[1360px] mx-auto px-4 md:px-6 py-4 flex items-center justify-between h-[120px]">
        <Link href="/dashboard" className="flex items-center gap-[14px] no-underline text-[#f5f7fb] min-w-0">
          <Image src="/auth-logo.png" alt="Hornet Logo" width={400} height={140} className="object-contain w-[280px] md:w-[380px] lg:w-[420px] h-auto -ml-5 -my-8" priority />
        </Link>

        <div className="flex items-center justify-end flex-wrap gap-3">
          <button
            onClick={toggleTheme}
            title={mounted ? (theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro') : ''}
            className="w-[46px] h-[46px] rounded-full border border-white/5 bg-white/[0.03] text-[#f5f7fb] inline-flex items-center justify-center font-bold transition-all duration-[0.18s] ease-out hover:-translate-y-[1px] hover:border-[#ffd60a]/20 hover:text-[#ffd60a] cursor-pointer p-0"
          >
            {mounted ? (theme === 'dark' ? '☀️' : '🌙') : <span className="opacity-0">🌙</span>}
          </button>

          {userDisplayName && (
            <>
              <button
                onClick={handleLogout}
                className="min-h-[46px] px-4 rounded-full border border-white/5 bg-white/[0.03] text-[#f5f7fb] inline-flex items-center justify-center font-bold transition-all duration-[0.18s] ease-out hover:-translate-y-[1px] hover:border-[#ffd60a]/20 hover:text-[#ffd60a] cursor-pointer"
              >
                Sair
              </button>
              {userAvatarUrl ? (
                <img
                  src={userAvatarUrl}
                  alt={userDisplayName}
                  className="w-10 h-10 rounded-full shrink-0"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-full shrink-0 text-white grid place-items-center font-extrabold"
                  style={{ background: 'linear-gradient(135deg, #ff7a18, #ff3d00)' }}
                >
                  {userDisplayName[0].toUpperCase()}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
