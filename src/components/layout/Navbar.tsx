'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/hooks/useTheme'

export interface NavbarProps {
  userDisplayName?: string
  userAvatarUrl?: string | null
}

export default function Navbar({ userDisplayName, userAvatarUrl }: NavbarProps) {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 sm:px-6 shrink-0">
      <Link href="/dashboard" className="flex items-center gap-2 font-bold text-foreground">
        <span className="text-xl">🐝</span>
        <span className="hidden sm:inline">Hornet Poker</span>
      </Link>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Toggle de tema claro/escuro */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {userDisplayName && (
          <>
            <Link
              href="/settings"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
            >
              Configurações
            </Link>
            <div className="flex items-center gap-2">
              {userAvatarUrl ? (
                <img
                  src={userAvatarUrl}
                  alt={userDisplayName}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                  {userDisplayName[0].toUpperCase()}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline"
              >
                Sair
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
