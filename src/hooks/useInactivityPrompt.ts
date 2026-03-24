'use client'

import { useState, useEffect } from 'react'

interface UseInactivityPromptOptions {
  isVoting: boolean
  isFacilitator: boolean
  votesCount: number
  isTimerRunning: boolean
  issueId: string | null
  inactivitySeconds?: number
}

interface UseInactivityPromptReturn {
  showPrompt: boolean
  dismiss: () => void
}

/**
 * Detecta inatividade durante votação e sugere ao facilitador iniciar o timer.
 * O prompt aparece após `inactivitySeconds` sem nenhum voto.
 * É descartado por issue: quando a próxima issue começa, pode aparecer novamente.
 */
export function useInactivityPrompt({
  isVoting,
  isFacilitator,
  votesCount,
  isTimerRunning,
  issueId,
  inactivitySeconds = 30,
}: UseInactivityPromptOptions): UseInactivityPromptReturn {
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissedForIssue, setDismissedForIssue] = useState<string | null>(null)

  const dismissed = !!issueId && dismissedForIssue === issueId
  const shouldWatch =
    isVoting &&
    isFacilitator &&
    votesCount === 0 &&
    !isTimerRunning &&
    !dismissed &&
    !!issueId

  useEffect(() => {
    setShowPrompt(false)
    if (!shouldWatch) return

    const timeout = setTimeout(() => setShowPrompt(true), inactivitySeconds * 1000)
    return () => clearTimeout(timeout)
  }, [shouldWatch, issueId, inactivitySeconds])

  function dismiss() {
    setShowPrompt(false)
    setDismissedForIssue(issueId)
  }

  return { showPrompt, dismiss }
}
