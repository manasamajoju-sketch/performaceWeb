import styles from './LapTimeChart.module.scss'
import type { LapDot } from '../SessionDetail/SessionDetail.types'

interface LapTimelineProps {
  dots: LapDot[]
  activeLap?: number | null
  onLapClick?: (lap: number) => void
  // Header stats — previously rendered by SessionDetail as a separate
  // `lapAnalysisHeader` block; moved in here so the title/stats live next
  // to the timeline they describe.
  lapCount?: number
  pitLap?: number
  hotLap?: number
}

// Color mapping per lap type matching the reference image
const dotColor = (type: LapDot['type'], active: boolean) => {
  if (active) return '#33cccc'
  switch (type) {
    case 'pit':    return '#111318'
    case 'hot':    return '#1a2a3a'
    case 'outlap': return '#7fe8e8'
    default:       return '#2a4a5a'
  }
}

export function LapTimeline({
  dots,
  activeLap,
  onLapClick,
  lapCount,
  pitLap,
  hotLap,
}: LapTimelineProps) {
  return (
    <div className={styles.wrapper}>

      {/* Header — title + COUNT / PIT LAP / HOT LAP stats */}
      <div className={styles.header}>
        <span className={styles.title}>Lap Analysis</span>

        <div className={styles.stat}>
          <span className={styles.statValue}>
            {String(lapCount ?? dots.length).padStart(2, '0')}
          </span>
          <span className={styles.statSub}>COUNT</span>
        </div>

        <div className={styles.stat}>
          <span className={styles.statValue}>
            {String(pitLap ?? 0).padStart(2, '0')}
          </span>
          <span className={styles.statSub}>PIT LAP</span>
        </div>

        <div className={styles.stat}>
          <span className={styles.statValue}>
            {String(hotLap ?? 0).padStart(2, '0')}
          </span>
          <span className={styles.statSub}>HOT LAP</span>
        </div>
      </div>

      {/* Pit lap markers — dashed connector down to the actual pit dot */}
      <div className={styles.markers}>
        {dots.map(d => (
          <div key={d.lap} className={styles.markerSlot}>
            {d.type === 'pit' && (
              <>
                <span className={styles.pitLabel}>PIT LAP</span>
                <span className={styles.pitConnector} />
              </>
            )}
          </div>
        ))}
      </div>

      {/* Dot row */}
      <div className={styles.dots}>
        {dots.map(d => (
          <button
            key={d.lap}
            className={styles.dot}
            style={{ backgroundColor: dotColor(d.type, activeLap === d.lap) }}
            onClick={() => onLapClick?.(d.lap)}
            aria-label={`Lap ${d.lap}${d.type !== 'normal' ? ` (${d.type})` : ''}`}
          />
        ))}
      </div>

      {/* Lap number labels below */}
      <div className={styles.labels}>
        {dots.map((d, i) => (
          <div key={d.lap} className={styles.labelSlot}>
            {(i === 0 || i === Math.floor(dots.length / 2) || i === dots.length - 1) && (
              <span className={styles.lapLabel}>Lap {d.lap}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}