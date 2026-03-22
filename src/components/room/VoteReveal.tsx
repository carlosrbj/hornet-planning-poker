'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { type OnlineUser } from '@/stores/roomStore'
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
  const voters = participants.filter((p) => p.role !== 'spectator')
  const analysis = isRevealed ? analyzeVotes(issueVotes.map((v) => v.value)) : null

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Cartas dos participantes */}
      <div className="flex flex-wrap justify-center gap-3">
        {voters.map((participant, i) => {
          const vote = issueVotes.find((v) => v.user_id === participant.user_id)
          return (
            <VoteCard
              key={participant.user_id}
              participant={participant}
              vote={vote ?? null}
              hasVotedFromPresence={participant.hasVoted}
              isRevealed={isRevealed}
              delay={i * 0.08}
            />
          )
        })}
      </div>

      {/* Resultados após reveal */}
      <AnimatePresence>
        {isRevealed && analysis && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm"
          >
            {/* Metric grid: 4 stats */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              <MetricCard label="Média" value={`${analysis.average}h`} />
              <MetricCard label="Mediana" value={`${analysis.median}h`} />
              <MetricCard
                label="Diverg."
                value={`${analysis.coefficientOfVariation}%`}
                highlight={analysis.highDivergence}
              />
              <MetricCard label="Votos" value={String(analysis.totalVoters)} />
            </div>

            {/* Badges de consenso / divergência */}
            <div className="flex flex-wrap justify-center gap-2">
              {analysis.consensus && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-2 text-sm text-[var(--success)] font-extrabold"
                >
                  <span className="w-5 h-5 rounded-[6px] bg-[var(--success)]/12 grid place-items-center text-xs">✔</span>
                  Consenso!
                </motion.span>
              )}
              {analysis.highDivergence && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-sm text-[var(--accent)] font-extrabold"
                >
                  ⚠️ Alta divergência — discutir!
                </motion.span>
              )}
            </div>
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
  const hasVoted = hasVotedFromPresence || vote !== null

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        animate={isRevealed ? 'revealed' : hasVoted ? 'voted' : 'waiting'}
        variants={{
          waiting: { rotateY: 0 },
          voted: { rotateY: 0 },
          revealed: {
            rotateY: [0, 90, 0],
            transition: { delay, duration: 0.4 },
          },
        }}
        className={`
          w-[56px] h-[76px] sm:w-[68px] sm:h-[92px] rounded-[18px] border
          flex items-center justify-center font-extrabold text-xl sm:text-2xl
          ${isRevealed
            ? 'border-[var(--accent)]/26 bg-[rgba(8,8,8,0.85)]'
            : hasVoted
              ? 'border-[var(--accent)]/14 bg-[var(--accent)]/6'
              : 'border-white/[0.06] bg-[var(--navy)]'
          }
        `}
        style={{
          transformStyle: 'preserve-3d',
          ...(isRevealed ? { boxShadow: '0 10px 24px rgba(255,214,10,0.08)' } : {}),
        }}
      >
        {isRevealed ? (
          <span className="text-foreground">
            {vote?.value !== null && vote?.value !== undefined ? vote.value : '?'}
          </span>
        ) : hasVoted ? (
          <span className="text-2xl">🐝</span>
        ) : (
          <span className="text-[var(--muted)] text-sm">...</span>
        )}
      </motion.div>
      <span className="text-xs text-[var(--muted)] truncate max-w-[64px] sm:max-w-[80px] text-center">
        {participant.display_name.split(' ')[0]}
      </span>
    </div>
  )
}

function MetricCard({
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
      className={`rounded-[14px] border p-3 text-center ${
        highlight
          ? 'border-[var(--accent)]/20 bg-[var(--accent)]/6'
          : 'border-white/[0.06] bg-white/[0.04]'
      }`}
    >
      <span className="block text-[var(--muted)] text-[0.74rem] tracking-[0.08em] uppercase mb-2">
        {label}
      </span>
      <strong className={`text-[1.2rem] ${highlight ? 'text-[var(--accent)]' : 'text-foreground'}`}>
        {value}
      </strong>
    </div>
  )
}
