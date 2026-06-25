import { useState, useRef, useCallback, useEffect } from 'react'

const SPEEDS = [1, 2, 4] as const
export type PlaybackSpeed = typeof SPEEDS[number]

interface UsePlaybackOptions {
  totalSecs: number
  onTick?: (ratio: number) => void
}

export function usePlayback({ totalSecs, onTick }: UsePlaybackOptions) {
  const [playing, setPlaying]   = useState(false)
  const [ratio, setRatio]       = useState(0)
  const [speedIdx, setSpeedIdx] = useState(0)

  const rafRef    = useRef<number | null>(null)
  const lastTsRef = useRef<number | null>(null)
  const ratioRef  = useRef(0)
  const playingRef = useRef(false)

  const speedMult = SPEEDS[speedIdx]

  const tick = useCallback((ts: number) => {
    if (!lastTsRef.current) lastTsRef.current = ts
    const dt = (ts - lastTsRef.current) / 1000
    lastTsRef.current = ts

    ratioRef.current = Math.min(1, ratioRef.current + (dt * speedMult) / totalSecs)
    setRatio(ratioRef.current)
    onTick?.(ratioRef.current)

    if (ratioRef.current >= 1) {
      playingRef.current = false
      setPlaying(false)
      return
    }

    if (playingRef.current) {
      rafRef.current = requestAnimationFrame(tick)
    }
  }, [speedMult, totalSecs, onTick])

  const play = useCallback(() => {
    playingRef.current = true
    setPlaying(true)
    lastTsRef.current = null
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  const pause = useCallback(() => {
    playingRef.current = false
    setPlaying(false)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  const toggle = useCallback(() => {
    if (playingRef.current) pause()
    else play()
  }, [play, pause])

  const restart = useCallback(() => {
    pause()
    ratioRef.current = 0
    setRatio(0)
    onTick?.(0)
  }, [pause, onTick])

  const seek = useCallback((r: number) => {
    const clamped = Math.max(0, Math.min(1, r))
    ratioRef.current = clamped
    setRatio(clamped)
    onTick?.(clamped)
  }, [onTick])

  const cycleSpeed = useCallback(() => {
    setSpeedIdx(i => (i + 1) % SPEEDS.length)
  }, [])

  // restart animation loop when speed changes mid-play
  useEffect(() => {
    if (playingRef.current) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lastTsRef.current = null
      rafRef.current = requestAnimationFrame(tick)
    }
  }, [speedMult, tick])

  // cleanup
  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  return { playing, ratio, speedMult, toggle, restart, seek, cycleSpeed }
}