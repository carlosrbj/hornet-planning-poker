'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { popIn } from '@/lib/utils/animations'
import type { OnlineUser } from '@/stores/roomStore'

export interface ParticipantListProps {
  participants: OnlineUser[]
  currentUserId: string
}

const ROLE_LABEL: Record<string, string> = {
  facilitator: '🎯',
  voter: '',
  spectator: '👁',
}

export default function ParticipantList({ participants, currentUserId }: ParticipantListProps) {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 border-b border-border">
        Participantes ({participants.length})
      </h2>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <AnimatePresence>
          {participants.map((user) => (
            <motion.div
              key={user.user_id}
              variants={popIn}
              initial="hidden"
              animate="visible"
              exit={{ scale: 0, opacity: 0 }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="relative shrink-0">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.display_name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-sm font-bold">
                    {user.display_name[0].toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.display_name}
                  {user.user_id === currentUserId && (
                    <span className="text-xs text-muted-foreground ml-1">(você)</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {ROLE_LABEL[user.role]} {user.role === 'spectator' ? 'Spectator' : ''}
                </p>
              </div>

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
    >
      {hasVoted ? (
        <span className="text-green-500 text-sm">✓</span>
      ) : (
        <span className="text-muted-foreground text-xs">...</span>
      )}
    </motion.div>
  )
}
