'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRoomStore, type OnlineUser } from '@/stores/roomStore'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function usePresence(slug: string, currentUser: OnlineUser) {
  const setOnlineUsers = useRoomStore((s) => s.setOnlineUsers)
  // Keep a stable ref to the subscribed channel so updateVoteStatus can track on it
  const channelRef = useRef<RealtimeChannel | null>(null)
  // Keep a stable ref to current user data to avoid stale closures
  const currentUserRef = useRef(currentUser)
  currentUserRef.current = currentUser

  const updatePresence = useCallback(
    (state: Record<string, OnlineUser[]>) => {
      const users = Object.values(state).flat()
      // Supabase Presence usa chave aleatória por conexão — deduplica por user_id
      const unique = Array.from(new Map(users.map((u) => [u.user_id, u])).values())
      setOnlineUsers(unique)
    },
    [setOnlineUsers]
  )

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel(`room:${slug}:presence`)
    channelRef.current = channel

    channel
      .on('presence', { event: 'sync' }, () => {
        updatePresence(channel.presenceState<OnlineUser>() as Record<string, OnlineUser[]>)
      })
      .on('presence', { event: 'join' }, () => {
        updatePresence(channel.presenceState<OnlineUser>() as Record<string, OnlineUser[]>)
      })
      .on('presence', { event: 'leave' }, () => {
        updatePresence(channel.presenceState<OnlineUser>() as Record<string, OnlineUser[]>)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track(currentUserRef.current)
        }
      })

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateVoteStatus = useCallback(async (hasVoted: boolean) => {
    // Track on the already-subscribed channel — creating a new channel here would not work
    await channelRef.current?.track({ ...currentUserRef.current, hasVoted })
  }, [])

  return { updateVoteStatus }
}
