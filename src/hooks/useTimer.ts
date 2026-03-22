'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export interface UseTimerReturn {
  secondsLeft: number
  isRunning: boolean
  start: (seconds: number) => void
  stop: () => void
  reset: () => void
}

export function useTimer(onExpire?: () => void): UseTimerReturn {
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onExpireRef = useRef(onExpire)

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setIsRunning(false)
  }, [])

  const start = useCallback(
    (seconds: number) => {
      stop()
      setSecondsLeft(seconds)
      setIsRunning(true)

      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!)
            setIsRunning(false)
            onExpireRef.current?.()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    },
    [stop]
  )

  const reset = useCallback(() => {
    stop()
    setSecondsLeft(0)
  }, [stop])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return { secondsLeft, isRunning, start, stop, reset }
}
