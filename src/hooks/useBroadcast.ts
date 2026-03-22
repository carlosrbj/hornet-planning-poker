'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export type BroadcastEvent =
  | 'REVEAL_CARDS'
  | 'NEXT_ISSUE'
  | 'TIMER_START'
  | 'TIMER_STOP'
  | 'COFFEE_BREAK'
  | 'EMOJI_REACTION'
  | 'RE_VOTE'
  | 'SWITCH_ISSUE'

type EventPayload = Record<string, unknown>
type EventHandler = (payload: EventPayload) => void

export function useBroadcast(slug: string) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const handlersRef = useRef<Partial<Record<BroadcastEvent, EventHandler>>>({})

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel(`room:${slug}:broadcast`)

    Object.entries(handlersRef.current).forEach(([event, handler]) => {
      channel.on('broadcast', { event }, ({ payload }) => handler?.(payload))
    })

    channel.subscribe()
    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [slug])

  const send = useCallback(
    async (event: BroadcastEvent, payload: EventPayload = {}) => {
      await channelRef.current?.send({ type: 'broadcast', event, payload })
    },
    []
  )

  const onEvent = useCallback(
    (event: BroadcastEvent, handler: EventHandler) => {
      handlersRef.current[event] = handler
      if (channelRef.current) {
        channelRef.current.on('broadcast', { event }, ({ payload }) =>
          handler(payload)
        )
      }
    },
    []
  )

  return { send, onEvent }
}
