'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useRoomStore, type OnlineUser } from '@/stores/roomStore'
import { analyzeVotes } from '@/lib/utils/consensus'
import type { Database } from '@/lib/types/database'

type Vote = Database['public']['Tables']['votes']['Row']

export interface VoteRevealProps {
  votes: Vote[]
  participants: OnlineUser[]
  isRevealed: boolean
  issueId: string
}

export default function VoteReveal({ votes, participants, isRevealed, issueId }: VoteRevealProps) {
  const issueVotes = votes.filter((v) => v.issue_id === issueId)
  const analysis = isRevealed ? analyzeVotes(issueVotes.map((v) => v.value)) : null

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Cartas dos participantes */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {participants
          .filter((p) => p.role !== 'spectator')
          .map((participant, i) => {
            const vote = issueVotes.find((v) => v.user_id === participant.user_id)
            return (
              <VoteCard
                key={participant.user_id}
                participant={participant}
                vote={vote ?? null}
                // Use Presence hasVoted flag so all participants see who has voted,
                // even though the vote value is hidden by RLS until reveal
                hasVotedFromPresence={participant.hasVoted}
                isRevealed={isRevealed}
                delay={i * 0.1}
              />
            )
          })}
      </div>

      {/* Resultados após reveal */}
      <AnimatePresence>
        {isRevealed && analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap justify-center gap-4 mt-2"
          >
            <StatBadge label="Média" value={`${analysis.average}h`} />
            <StatBadge label="Mediana" value={`${analysis.median}h`} />
            <StatBadge
              label="Divergência"
              value={`${analysis.coefficientOfVariation}%`}
              highlight={analysis.highDivergence}
            />
            <StatBadge label="Votos" value={String(analysis.totalVoters)} />

            {analysis.consensus && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-sm text-green-500 font-semibold flex items-center gap-1"
              >
                ✅ Consenso!
              </motion.span>
            )}
            {analysis.highDivergence && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-sm text-accent font-semibold flex items-center gap-1"
              >
                ⚠️ Alta divergência — discutir!
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function VoteCard({
  participant,
  vote,
  hasVotedFromPresence,
  isRevealed,
  delay,
}: {
  participant: OnlineUser
  vote: Vote | null
  hasVotedFromPresence: boolean
  isRevealed: boolean
  delay: number
}) {
  // During voting: use Presence flag so everyone sees who has voted (not just own vote)
  // After reveal: vote value is fetched from DB, so use vote !== null as fallback
  const hasVoted = hasVotedFromPresence || vote !== null

  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.div
        animate={isRevealed ? 'revealed' : hasVoted ? 'voted' : 'waiting'}
        variants={{
          waiting: { rotateY: 0, backgroundColor: 'var(--color-card)' },
          voted: { rotateY: 0, backgroundColor: 'var(--color-secondary)' },
          revealed: {
            rotateY: [0, 90, 0],
            transition: { delay, duration: 0.4 },
          },
        }}
        className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl border-2 border-border flex items-center justify-center text-xl sm:text-2xl font-bold"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {isRevealed ? (
          <span className="text-foreground text-2xl">
            {vote?.value !== null && vote?.value !== undefined ? vote.value : '?'}
          </span>
        ) : hasVoted ? (
          <span className="text-3xl">🐝</span>
        ) : (
          <span className="text-muted-foreground text-sm">...</span>
        )}
      </motion.div>
      <span className="text-xs text-muted-foreground truncate max-w-[64px] sm:max-w-[80px] text-center">
        {participant.display_name.split(' ')[0]}
      </span>
    </div>
  )
}

function StatBadge({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div
      className={`px-3 py-1.5 rounded-lg border text-center ${
        highlight ? 'border-accent/50 bg-accent/10' : 'border-border bg-muted'
      }`}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-bold ${highlight ? 'text-accent' : 'text-foreground'}`}>
        {value}
      </p>
    </div>
  )
}
