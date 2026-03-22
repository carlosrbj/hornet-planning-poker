'use client'

import { useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRoomStore } from '@/stores/roomStore'
import { analyzeVotes } from '@/lib/utils/consensus'

export function useVoting(userId: string) {
  const { room, currentIssueId, issues, votes, setSelectedCard, selectedCard } = useRoomStore()

  const castVote = useCallback(
    async (value: number | string) => {
      if (!currentIssueId) return
      const supabase = createClient()

      const currentIssue = issues.find((i) => i.id === currentIssueId)
      if (!currentIssue) return

      const numericValue = typeof value === 'number' ? value : null

      await supabase.from('votes').upsert({
        issue_id: currentIssueId,
        user_id: userId,
        value: numericValue,
        round: currentIssue.round_count || 1,
      }, { onConflict: 'issue_id,user_id,round' })

      setSelectedCard(value)
    },
    [currentIssueId, issues, userId, setSelectedCard]
  )

  const removeVote = useCallback(async () => {
    if (!currentIssueId) return
    const supabase = createClient()
    const currentIssue = issues.find((i) => i.id === currentIssueId)
    if (!currentIssue) return
    await supabase.from('votes').delete().match({
      issue_id: currentIssueId,
      user_id: userId,
      round: currentIssue.round_count || 1,
    })
    setSelectedCard(null)
  }, [currentIssueId, issues, userId, setSelectedCard])

  const revealVotes = useCallback(async () => {
    if (!currentIssueId || !room) return
    const supabase = createClient()

    const currentVotes = votes.filter((v) => v.issue_id === currentIssueId)
    const numericVotes = currentVotes.map((v) => v.value)
    const analysis = analyzeVotes(numericVotes)

    await supabase
      .from('issues')
      .update({
        status: 'revealed',
        final_estimate: analysis?.median ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentIssueId)
  }, [currentIssueId, room, votes])

  const nextIssue = useCallback(async () => {
    if (!currentIssueId || !room) return
    const supabase = createClient()

    // Finaliza issue atual
    await supabase
      .from('issues')
      .update({ status: 'revealed', updated_at: new Date().toISOString() })
      .eq('id', currentIssueId)

    // Avança para a próxima pendente
    const nextPending = issues.find(
      (i) => i.status === 'pending' && i.id !== currentIssueId
    )

    if (nextPending) {
      await supabase
        .from('issues')
        .update({ status: 'voting', updated_at: new Date().toISOString() })
        .eq('id', nextPending.id)
    }

    setSelectedCard(null)
  }, [currentIssueId, room, issues, setSelectedCard])

  const reVote = useCallback(async () => {
    if (!currentIssueId) return
    const supabase = createClient()

    const currentIssue = issues.find((i) => i.id === currentIssueId)
    if (!currentIssue) return

    await supabase
      .from('issues')
      .update({
        status: 'voting',
        round_count: (currentIssue.round_count || 1) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentIssueId)

    setSelectedCard(null)
  }, [currentIssueId, issues, setSelectedCard])

  const skipIssue = useCallback(async () => {
    if (!currentIssueId) return
    const supabase = createClient()

    await supabase
      .from('issues')
      .update({ status: 'skipped', updated_at: new Date().toISOString() })
      .eq('id', currentIssueId)

    setSelectedCard(null)
  }, [currentIssueId, setSelectedCard])

  const getResults = useCallback(() => {
    if (!currentIssueId) return null
    const currentVotes = votes.filter((v) => v.issue_id === currentIssueId)
    return analyzeVotes(currentVotes.map((v) => v.value))
  }, [currentIssueId, votes])

  return { castVote, removeVote, revealVotes, nextIssue, reVote, skipIssue, getResults, selectedCard }
}
