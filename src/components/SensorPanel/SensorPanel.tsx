import { useMemo, useCallback, useState } from 'react'
import styles from './SensorPanel.module.scss'
import type { SensorPanelProps, OrientationFrame } from './SensorPanel.types'
import { HelmetViewer } from '../HelmetViewer'
import { OrientationStats } from '../OrientationStats'
import { AccelerometerChart } from '../AccelerometerChart'
import { GyroscopeChart } from '../GyroscopeChart'
import ImpactAnalysisChart from '../ImpactAnalysis'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function lerpOrientation(frames: OrientationFrame[], ms: number): OrientationFrame {
  if (frames.length === 0) return { yaw: 0, pitch: 0, roll: 0, timestamp: 0 }
  if (frames.length === 1) return frames[0]
  if (ms <= frames[0].timestamp) return frames[0]
  if (ms >= frames[frames.length - 1].timestamp) return frames[frames.length - 1]

  let lo = 0, hi = frames.length - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (frames[mid].timestamp <= ms) lo = mid
    else hi = mid
  }
  const a = frames[lo], b = frames[hi]
  const t = (ms - a.timestamp) / (b.timestamp - a.timestamp)
  return {
    yaw:   a.yaw   + (b.yaw   - a.yaw)   * t,
    pitch: a.pitch + (b.pitch - a.pitch) * t,
    roll:  a.roll  + (b.roll  - a.roll)  * t,
    timestamp: ms,
  }
}

function generateDemoOrientation(count = 200): OrientationFrame[] {
  return Array.from({ length: count }, (_, i) => ({
    yaw:   Math.sin(i * 0.08) * 30 + Math.sin(i * 0.21) * 15,
    pitch: Math.cos(i * 0.12) * 18 + Math.sin(i * 0.35) * 8,
    roll:  Math.sin(i * 0.15) * 36 + Math.cos(i * 0.28) * 12,
    timestamp: i * 600,
  }))
}

// ─── Component ────────────────────────────────────────────────────────────────
export function SensorPanel({ data, playbackMs }: SensorPanelProps) {
  const [helmetReset, setHelmetReset] = useState(0)

  const orientationFrames = useMemo(
    () => data?.orientation ?? generateDemoOrientation(),
    [data]
  )

  const currentOrientation = useMemo(
    () => lerpOrientation(orientationFrames, playbackMs),
    [orientationFrames, playbackMs]
  )

  const handleReset = useCallback(() => setHelmetReset(n => n + 1), [])

  return (
    <div className={styles.root}>

      {/* ── Stats row: full width across the top ─────────────────────── */}
      <div className={styles.statsWrap}>
        <OrientationStats
          yaw={currentOrientation.yaw}
          pitch={currentOrientation.pitch}
          roll={currentOrientation.roll}
          avgValue={data?.orientationAvg}
          maxValue={data?.orientationMax}
        />
      </div>

      {/* ── Helmet: fills remaining space ────────────────────────────── */}
      <div className={styles.helmetWrap}>
        <HelmetViewer
          key={helmetReset}
          yaw={currentOrientation.yaw}
          pitch={currentOrientation.pitch}
          roll={currentOrientation.roll}
        />
      </div>

      {/* ── Reset view ───────────────────────────────────────────────── */}
      <div className={styles.resetRow}>
        <button className={styles.resetLink} onClick={handleReset}>
          Reset View
        </button>
      </div>

            <div className={styles.section}><AccelerometerChart /></div>
      <div className={styles.sectionDividerHorizontal} />
      <div className={styles.section}><GyroscopeChart /></div>
      <div className={styles.sectionDividerHorizontal} />
      <div className={styles.section}><ImpactAnalysisChart /></div>

    </div>
  )
}