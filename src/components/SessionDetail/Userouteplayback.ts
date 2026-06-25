import { useMemo } from 'react'

export interface Waypoint { x: number; y: number }

interface ArcSegment { len: number; cumLen: number }

// Build cumulative arc-lengths so we can do smooth ratio → position
function buildArc(waypoints: Waypoint[]): ArcSegment[] {
  const segs: ArcSegment[] = []
  let cum = 0
  for (let i = 1; i < waypoints.length; i++) {
    const dx = waypoints[i].x - waypoints[i - 1].x
    const dy = waypoints[i].y - waypoints[i - 1].y
    const len = Math.sqrt(dx * dx + dy * dy)
    cum += len
    segs.push({ len, cumLen: cum })
  }
  return segs
}

export function useRoutePlayback(waypoints: Waypoint[]) {
  const arc = useMemo(() => buildArc(waypoints), [waypoints])
  const totalArc = arc.length > 0 ? arc[arc.length - 1].cumLen : 0

  const posAtRatio = (r: number): { x: number; y: number } => {
    if (waypoints.length === 0) return { x: 0, y: 0 }
    if (r <= 0) return waypoints[0]
    if (r >= 1) return waypoints[waypoints.length - 1]

    const target = r * totalArc
    for (let i = 0; i < arc.length; i++) {
      if (arc[i].cumLen >= target) {
        const prev = i === 0 ? 0 : arc[i - 1].cumLen
        const t = (target - prev) / arc[i].len
        return {
          x: waypoints[i].x + (waypoints[i + 1].x - waypoints[i].x) * t,
          y: waypoints[i].y + (waypoints[i + 1].y - waypoints[i].y) * t,
        }
      }
    }
    return waypoints[waypoints.length - 1]
  }

  return { posAtRatio }
}