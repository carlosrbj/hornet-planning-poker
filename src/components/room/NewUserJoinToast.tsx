'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRoomStore, type OnlineUser } from '@/stores/roomStore'

export interface NewUserJoinToastProps {
  userId: string
}

export default function NewUserJoinToast({ userId }: NewUserJoinToastProps) {
  const onlineUsers = useRoomStore((s) => s.onlineUsers)
  const issues = useRoomStore((s) => s.issues)
  const updateIssue = useRoomStore((s) => s.updateIssue)

  const [queue, setQueue] = useState<OnlineUser[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [linkError, setLinkError] = useState<string | null>(null)
  const [linking, setLinking] = useState(false)

  // Inicializar com os usuários já presentes — evita toasts espúrios no mount
  const prevUsersRef = useRef<OnlineUser[]>(onlineUsers)

  // Detectar novos usuários
  useEffect(() => {
    const prevIds = new Set(prevUsersRef.current.map((u) => u.user_id))
    const newUsers = onlineUsers.filter(
      (u) => !prevIds.has(u.user_id) && u.user_id !== userId
    )
    if (newUsers.length > 0) {
      setQueue((q) => [...q, ...newUsers])
    }
    prevUsersRef.current = onlineUsers
  }, [onlineUsers, userId])

  const current = queue[0] ?? null

  const dismiss = useCallback(() => {
    setQueue((q) => q.slice(1))
    setDropdownOpen(false)
    setLinkError(null)
    setLinking(false)
  }, [])

  // Issues elegíveis: sem dev e não skipped
  const unassignedIssues = issues.filter(
    (i) => !i.assignee_name && i.status !== 'skipped'
  )

  async function handleLink(issueId: string) {
    if (!current) return
    setLinking(true)
    setLinkError(null)

    const supabase = createClient()
    const { error } = await supabase
      .from('issues')
      .update({ assignee_name: current.display_name })
      .eq('id', issueId)

    if (error) {
      setLinkError('Erro ao vincular. Tente novamente.')
      setLinking(false)
      return
    }

    updateIssue(issueId, { assignee_name: current.display_name })
    dismiss()
  }

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key={current.user_id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-6 right-6 z-[60] w-72 bg-[#0d1020] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header do toast */}
          <div className="flex items-center gap-2.5 px-4 pt-4 pb-2">
            {current.avatar_url ? (
              <img
                src={current.avatar_url}
                alt=""
                className="w-8 h-8 rounded-full shrink-0"
              />
            ) : (
              <span className="w-8 h-8 rounded-full bg-white/10 shrink-0 inline-block" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {current.display_name}
              </p>
              <p className="text-xs text-[var(--muted)]">entrou na sala</p>
            </div>
            <button
              onClick={dismiss}
              className="text-[var(--muted)] hover:text-foreground transition-colors text-sm shrink-0"
              aria-label="Dispensar"
            >
              ✕
            </button>
          </div>

          {/* Botão de vincular */}
          <div className="px-4 pb-3">
            <button
              type="button"
              onClick={() => { setDropdownOpen((o) => !o); setLinkError(null) }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors"
            >
              Vincular a issue
              <span>{dropdownOpen ? '▴' : '▾'}</span>
            </button>

            {/* Dropdown de issues sem dev */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="mt-1 bg-[#111526] border border-white/[0.06] rounded-lg overflow-hidden"
                >
                  {unassignedIssues.length === 0 ? (
                    <p className="px-3 py-2.5 text-xs text-[var(--muted)]">
                      Todas as issues já têm dev
                    </p>
                  ) : (
                    <ul>
                      {unassignedIssues.map((issue, idx) => (
                        <li key={issue.id}>
                          <button
                            type="button"
                            disabled={linking}
                            onClick={() => handleLink(issue.id)}
                            className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-white/[0.04] transition-colors disabled:opacity-50 truncate"
                          >
                            <span className="text-[var(--muted)] mr-1">#{idx + 1}</span>
                            {issue.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {linkError && (
              <p className="mt-1.5 text-xs text-[var(--danger)]">{linkError}</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
