'use client'

export interface FacilitatorControlsProps {
  roomStatus: string
  issueStatus: string
  hasVotes: boolean
  onReveal: () => void
  onNextIssue: () => void
  onReVote: () => void
  onSkip: () => void
  onCoffeeBreak: () => void
}

export default function FacilitatorControls({
  roomStatus,
  issueStatus,
  hasVotes,
  onReveal,
  onNextIssue,
  onReVote,
  onSkip,
  onCoffeeBreak,
}: FacilitatorControlsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap justify-center">
      {issueStatus === 'voting' && (
        <button
          onClick={onReveal}
          disabled={!hasVotes}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Revelar Cartas 🃏
        </button>
      )}

      {issueStatus === 'revealed' && (
        <>
          <button
            onClick={onNextIssue}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Próxima Issue →
          </button>
          <button
            onClick={onReVote}
            className="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
          >
            Re-votar 🔄
          </button>
        </>
      )}

      {(issueStatus === 'voting' || issueStatus === 'revealed') && (
        <button
          onClick={onSkip}
          className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Pular ⏭️
        </button>
      )}

      <button
        onClick={onCoffeeBreak}
        className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ☕ Break
      </button>
    </div>
  )
}
