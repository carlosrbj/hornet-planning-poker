'use client'

export interface FacilitatorControlsProps {
  issueStatus: string
  hasVotes: boolean
  hasPendingIssues: boolean
  onReveal: () => void
  onNextIssue: () => void
  onReVote: () => void
  onSkip: () => void
  onCoffeeBreak: () => void
  onCloseSession: () => void
}

export default function FacilitatorControls({
  issueStatus,
  hasVotes,
  hasPendingIssues,
  onReveal,
  onNextIssue,
  onReVote,
  onSkip,
  onCoffeeBreak,
  onCloseSession,
}: FacilitatorControlsProps) {
  // Última issue revelada e não há mais pendentes — momento ideal para encerrar
  const isLastRevealed = issueStatus === 'revealed' && !hasPendingIssues

  return (
    <div className="flex items-center gap-2 flex-wrap justify-center">
      {issueStatus === 'voting' && (
        <button
          onClick={onReveal}
          disabled={!hasVotes}
          className="btn btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Revelar Cartas 🃏
        </button>
      )}

      {issueStatus === 'revealed' && (
        <>
          {hasPendingIssues && (
            <button
              onClick={onNextIssue}
              className="btn btn-primary text-sm"
            >
              Próxima Issue →
            </button>
          )}
          <button
            onClick={onReVote}
            className="btn btn-secondary text-sm"
          >
            Re-votar 🔄
          </button>
        </>
      )}

      {(issueStatus === 'voting' || issueStatus === 'revealed') && (
        <button
          onClick={onSkip}
          className="btn btn-secondary text-sm"
        >
          Pular ⏭️
        </button>
      )}

      <button
        onClick={onCoffeeBreak}
        className="btn btn-secondary text-sm"
      >
        ☕ Break
      </button>

      {isLastRevealed && (
        <button
          onClick={onCloseSession}
          className="btn btn-primary text-sm"
        >
          Encerrar Sessão ✅
        </button>
      )}
    </div>
  )
}
