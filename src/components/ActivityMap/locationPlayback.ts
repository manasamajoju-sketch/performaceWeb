import type { StreamLocationPoint } from './ActivityMap.types'

/**
 * Returns the most recent location point at or before playbackMs.
 * Falls back to the first point if playbackMs is before any timestamp.
 */
export function latestLocationAtPlayhead(
  locations: readonly StreamLocationPoint[],
  playbackMs: number,
): StreamLocationPoint | null {
  if (locations.length === 0) return null

  // If no timestamps, use index-based position
  if (locations[0]?.timestamp === undefined) {
    const idx = Math.min(
      Math.floor((playbackMs / 1000)),
      locations.length - 1,
    )
    return locations[idx] ?? locations[0] ?? null
  }

  // Binary search for the latest point ≤ playbackMs
  let lo = 0
  let hi = locations.length - 1
  let result = locations[0]!

  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const point = locations[mid]!
    if ((point.timestamp ?? 0) <= playbackMs) {
      result = point
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }

  return result
}