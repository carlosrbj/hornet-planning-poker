'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/hooks/useTheme'
import { useState, useEffect, useRef } from 'react'

export interface NavbarProps {
  userDisplayName?: string
  userAvatarUrl?: string | null
}

export default function Navbar({ userDisplayName, userAvatarUrl }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = userDisplayName?.[0]?.toUpperCase() ?? '?'

  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-[rgba(8,8,8,0.82)] backdrop-blur-[16px] shrink-0 overflow-visible">
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
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2.5 pl-2 pr-3 h-[46px] rounded-full border border-white/5 bg-white/[0.03] hover:border-[#ffd60a]/20 hover:bg-white/[0.06] transition-all duration-[0.18s] ease-out cursor-pointer"
              >
                {userAvatarUrl ? (
                  <img
                    src={userAvatarUrl}
                    alt={userDisplayName}
                    className="w-8 h-8 rounded-full shrink-0"
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full shrink-0 text-white grid place-items-center font-extrabold text-sm"
                    style={{ background: 'linear-gradient(135deg, #ff7a18, #ff3d00)' }}
                  >
                    {initials}
                  </div>
                )}
                <span className="text-[#f5f7fb] text-sm font-medium hidden sm:block max-w-[120px] truncate">
                  {userDisplayName}
                </span>
                <svg
                  className={`w-3.5 h-3.5 text-[#9aa0aa] transition-transform duration-200 shrink-0 ${menuOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                >
                  <path d="M2 4l4 4 4-4" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-[220px] rounded-[16px] border border-white/8 bg-[#111]/95 backdrop-blur-xl shadow-[0_24px_48px_rgba(0,0,0,0.6)] overflow-hidden z-50">
                  {/* Cabeçalho do menu */}
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-[#f5f7fb] text-sm font-semibold truncate">{userDisplayName}</p>
                  </div>

                  {/* Links */}
                  <nav className="py-1.5">
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#d4d4d8] hover:text-[#f5f7fb] hover:bg-white/5 transition-colors"
                    >
                      <span className="text-base">👤</span>
                      Minha conta
                    </Link>
                    <Link
                      href="/settings/jira"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#d4d4d8] hover:text-[#f5f7fb] hover:bg-white/5 transition-colors"
                    >
                      <span className="text-base">🎯</span>
                      Integração Jira
                    </Link>
                    <Link
                      href="/settings/billing"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#d4d4d8] hover:text-[#f5f7fb] hover:bg-white/5 transition-colors"
                    >
                      <span className="text-base">💳</span>
                      Plano e cobrança
                    </Link>
                  </nav>

                  {/* Sair */}
                  <div className="border-t border-white/5 py-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#9aa0aa] hover:text-[#ff4444] hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <span className="text-base">↩</span>
                      Sair da conta
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
