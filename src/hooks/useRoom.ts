'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRoomStore } from '@/stores/roomStore'
import type { Database } from '@/lib/types/database'

type Room = Database['public']['Tables']['rooms']['Row']
type Issue = Database['public']['Tables']['issues']['Row']
type Vote = Database['public']['Tables']['votes']['Row']

export function useRoom(slug: string) {
  const { setRoom, setIssues, setCurrentIssueId, setVotes, updateIssue, addIssue, removeIssue, addVote } =
    useRoomStore()

  useEffect(() => {
    const supabase = createClient()

    async function loadRoom() {
      const { data: roomData } = await supabase
        .from('rooms')
        .select('*')
        .eq('slug', slug)
        .single()

      const room = roomData as Room | null
      if (!room) return
      setRoom(room)

      const { data: issuesData } = await supabase
        .from('issues')
        .select('*')
        .eq('room_id', room.id)
        .order('position', { ascending: true })

      const issues = (issuesData ?? []) as Issue[]
      setIssues(issues)

      const currentIssue = issues.find(
        (i) => i.status === 'voting' || i.status === 'revealed'
      )
      if (currentIssue) setCurrentIssueId(currentIssue.id)

      if (currentIssue) {
        const { data: votesData } = await supabase
          .from('votes')
          .select('*')
          .eq('issue_id', currentIssue.id)
        setVotes((votesData ?? []) as Vote[])
      }

      const issuesChannel = supabase
        .channel(`room:${room.id}:issues`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'issues', filter: `room_id=eq.${room.id}` },
          async (payload) => {
            if (payload.eventType === 'INSERT') {
              addIssue(payload.new as Issue)
            }

            if (payload.eventType === 'DELETE') {
              removeIssue((payload.old as { id: string }).id)
            }

            if (payload.eventType === 'UPDATE') {
              const updated = payload.new as Issue
              updateIssue(updated.id, updated)

              if (updated.status === 'voting') {
                setCurrentIssueId(updated.id)
                // Load own vote for new issue (other users' votes hidden by RLS until reveal)
                const { data } = await supabase
                  .from('votes')
                  .select('*')
                  .eq('issue_id', updated.id)
                setVotes((data ?? []) as Vote[])
              }

              if (updated.status === 'revealed') {
                setCurrentIssueId(updated.id)
                // After reveal, RLS "All votes visible after reveal" allows fetching everyone's votes
                const { data } = await supabase
                  .from('votes')
                  .select('*')
                  .eq('issue_id', updated.id)
                setVotes((data ?? []) as Vote[])
              }
            }
          }
        )
        .subscribe()

      const votesChannel = supabase
        .channel(`room:${room.id}:votes`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'votes' },
          (payload) => {
            addVote(payload.new as Vote)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(issuesChannel)
        supabase.removeChannel(votesChannel)
      }
    }

    const cleanup = loadRoom()

    return () => {
      cleanup.then((fn) => fn?.())
    }
  }, [slug])
}
