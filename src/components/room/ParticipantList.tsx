'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { popIn } from '@/lib/utils/animations'
import type { OnlineUser } from '@/stores/roomStore'

export interface ParticipantListProps {
  participants: OnlineUser[]
  currentUserId: string
}

const ROLE_LABEL: Record<string, string> = {
  facilitator: '🎯 Facilitador',
  voter: 'Participante',
  spectator: '👁 Spectator',
}

export default function ParticipantList({ participants, currentUserId }: ParticipantListProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-3 pt-3 pb-2 bg-[rgba(8,8,8,0.88)] backdrop-blur-[12px] border-b border-[var(--border)]">
        <h3 className="text-[0.8rem] font-semibold tracking-[0.06em] uppercase text-[var(--muted)]">Equipe</h3>
        <span className="text-[var(--muted)] text-[0.75rem]">{participants.length} online</span>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1.5">
        <AnimatePresence>
          {participants.map((user) => (
            <motion.div
              key={user.user_id}
              variants={popIn}
              initial="hidden"
              animate="visible"
              exit={{ scale: 0, opacity: 0 }}
              className="flex items-center gap-2 rounded-lg border border-white/[0.04] bg-white/[0.02] px-2.5 py-2 transition-all hover:bg-white/[0.04] overflow-hidden"
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.display_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                    style={{ background: 'linear-gradient(135deg, #ff9d3f, #ff5b00)' }}
                  >
                    {user.display_name[0].toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-[1.5px] border-[var(--bg)] bg-[var(--success)] animate-pulse" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-[0.8rem] font-semibold truncate leading-tight">
                  {user.display_name}
                  {user.user_id === currentUserId && (
                    <span className="text-[0.65rem] text-[var(--muted)] ml-1 font-normal">(você)</span>
                  )}
                </p>
                <span className="block text-[var(--muted)] text-[0.7rem] truncate leading-tight mt-0.5">
                  {ROLE_LABEL[user.role] ?? user.role}
                </span>
              </div>

              {/* Vote status */}
              <VoteStatusBadge hasVoted={user.hasVoted} role={user.role} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function VoteStatusBadge({ hasVoted, role }: { hasVoted: boolean; role: string }) {
  if (role === 'spectator') return null

  return (
    <motion.div
      animate={hasVoted ? 'voted' : 'waiting'}
      variants={{
        voted: { scale: [1, 1.3, 1], transition: { duration: 0.3 } },
        waiting: { scale: 1 },
      }}
      className="shrink-0"
    >
      {hasVoted ? (
        <span className="inline-flex items-center gap-1 text-[var(--success)] text-[0.7rem] font-bold whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
          ✓
        </span>
      ) : (
        <span className="text-[var(--muted)] text-[0.65rem] whitespace-nowrap">...</span>
      )}
    </motion.div>
  )
}
