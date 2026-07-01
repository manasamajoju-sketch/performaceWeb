import { useCallback, useMemo, useState } from 'react'

export type TooltipAlign = 'left' | 'center' | 'right'

export interface InteractiveChartOptions {
  total: number
  playbackMs?: number
  playing?: boolean
  totalMs?: number
  edgeThreshold?: number
  allowCenterAlign?: boolean
  playbackIndexOverride?: number | null
  defaultSelectedIndex?: number | null
}

export function getPlaybackIndex(
  playbackMs?: number,
  playing?: boolean,
  totalMs?: number,
  total = 0,
): number | null {
  const isPlaying = playing || !!playbackMs
  if (!isPlaying || !totalMs || total <= 0) return null
  return Math.min(Math.round((playbackMs! / totalMs) * (total - 1)), total - 1)
}

export function getTooltipAlign(
  activePct: number | null,
  edgeThreshold = 15,
  allowCenterAlign = false,
): TooltipAlign {
  if (activePct === null) return allowCenterAlign ? 'center' : 'right'
  if (activePct <= edgeThreshold) return 'left'
  if (activePct >= 100 - edgeThreshold) return 'right'
  return allowCenterAlign ? 'center' : 'right'
}

export function getInteractiveItemOpacity(
  index: number,
  hoveredIndex: number | null,
  selectedIndex: number | null,
  playbackIndex: number | null,
): number {
  const hasHover = hoveredIndex !== null
  const hasSelected = selectedIndex !== null
  const hasPlayback = playbackIndex !== null

  if (!hasHover && !hasSelected && !hasPlayback) return 1

  if (hasHover) {
    if (index === hoveredIndex) {
      return hasPlayback && playbackIndex !== hoveredIndex ? 0.6 : 1
    }
    if (hasPlayback && index === playbackIndex) return 1
    return 0.2
  }

  if (hasSelected) {
    return index === selectedIndex ? 1 : 0.2
  }

  return index === playbackIndex ? 1 : 0.2
}

export function useChartInteraction({
  total,
  playbackMs,
  playing,
  totalMs,
  edgeThreshold = 15,
  allowCenterAlign = false,
  playbackIndexOverride,
  defaultSelectedIndex = null,
}: InteractiveChartOptions) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(defaultSelectedIndex)

  const playbackIndex = useMemo(
    () =>
      playbackIndexOverride != null
        ? playbackIndexOverride
        : getPlaybackIndex(playbackMs, playing, totalMs, total),
    [playbackMs, playing, totalMs, total, playbackIndexOverride],
  )

  const activeIndex = hoveredIndex ?? selectedIndex ?? playbackIndex
  const activePct = useMemo(
    () => (activeIndex !== null ? ((activeIndex + 0.5) / total) * 100 : null),
    [activeIndex, total],
  )

  const tooltipAlign = useMemo(
    () => getTooltipAlign(activePct, edgeThreshold, allowCenterAlign),
    [activePct, edgeThreshold, allowCenterAlign],
  )

  const getOpacity = useCallback(
    (index: number) =>
      getInteractiveItemOpacity(index, hoveredIndex, selectedIndex, playbackIndex),
    [hoveredIndex, selectedIndex, playbackIndex],
  )

  return {
    hoveredIndex,
    selectedIndex,
    setHoveredIndex,
    setSelectedIndex,
    playbackIndex,
    activeIndex,
    activePct,
    tooltipAlign,
    getOpacity,
  }
}
