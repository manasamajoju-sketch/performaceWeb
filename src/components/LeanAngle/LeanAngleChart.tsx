import { useChartInteraction } from '../chart-utils'
import styles from './LeanAngleChart.module.scss'
import type { LeanAngleChartProps, LeanAngleDataPoint } from './LeanAngleChart.types'

// ─── Constants ────────────────────────────────────────────────────────────────
const BAR_COUNT = 61
const BAR_W     = 8   // px — spec
const BAR_GAP   = 8   // px — spec

// ─── Mock data ────────────────────────────────────────────────────────────────
function generateMockData(count: number): LeanAngleDataPoint[] {
  return Array.from({ length: count }, (_, i) => ({
    left:  Math.min(Math.abs(30 + Math.sin(i * 0.7 + 1.0) * 25 + Math.random() * 15), 100),
    right: Math.min(Math.abs(25 + Math.sin(i * 0.6 + 0.3) * 22 + Math.random() * 18), 100),
    timestamp: i * (72000 / count),
  }))
}

// ─── Tooltip alignment ────────────────────────────────────────────────────────
const EDGE = 8 // %
type Align = 'left' | 'center' | 'right'

function getAlign(pct: number): Align {
  if (pct <= EDGE) return 'left'
  if (pct >= 100 - EDGE) return 'right'
  return 'center'
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LeanAngleChart({
  data,
  leftDegree  = 36,
  rightDegree = 36,
  maxDegree   = 36,
  avgDegree   = 26,
  playbackMs  = 0,
  playing     = false,
  totalMs     = 72000,
}: LeanAngleChartProps) {
  const pts = data ?? generateMockData(BAR_COUNT)
  const {
    hoveredIndex,
    setHoveredIndex,
    playbackIndex,
    getOpacity,
  } = useChartInteraction({
    total: BAR_COUNT,
    playbackMs,
    playing,
    totalMs,
    edgeThreshold: EDGE,
    allowCenterAlign: false,
  })

  const hovPt  = hoveredIndex !== null ? pts[hoveredIndex] : null
  const hovPct = hoveredIndex !== null ? ((hoveredIndex + 0.5) / BAR_COUNT) * 100 : null
  const pbPt   = playbackIndex !== null ? pts[playbackIndex] : null
  const pbPct  = playbackIndex !== null ? ((playbackIndex + 0.5) / BAR_COUNT) * 100 : null

  const alignClass = (a: Align) =>
    a === 'left'  ? styles.tooltipAlignLeft
    : a === 'right' ? styles.tooltipAlignRight
    : styles.tooltipAlignCenter

  // ── Bar left positions ───────────────────────────────────────────────────
  // Total bar strip width = BAR_COUNT * BAR_W + (BAR_COUNT-1) * BAR_GAP
  // We use percentage left inside chartArea via inline style
  // chartArea width is dynamic, so we express position as a fraction of
  // the total strip and use a CSS calc trick — simpler: position each bar
  // using left = i * (BAR_W + BAR_GAP) px, and let chartArea clip overflow.
  // Because chartArea has overflow:hidden this is fine.

  function fmtMs(ms: number) {
    const s = Math.floor(ms / 1000)
    const m = Math.floor(s / 60)
    return `${String(m).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
  }

  return (
    <div className={styles.card}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className={styles.headerRow}>
        <div className={styles.statGroup}>
          <div className={styles.statLeft}>
            <span className={styles.statLabel}>Lean Angle</span>
            <span className={styles.statSublabel}>DEGREE</span>
          </div>
          <div className={styles.statValue}>
            <span className={styles.statNumber}>{leftDegree}°</span>
            <span className={styles.statSubLabelSmall}>LEFT</span>
          </div>
          <div className={styles.statValue}>
            <span className={styles.statNumber}>{rightDegree}°</span>
            <span className={styles.statSubLabelSmall}>RIGHT</span>
          </div>
        </div>
      </div>

      {/* ── Chart outer ─────────────────────────────────────────────────── */}
      <div className={styles.chartOuter}>

        {/* Left Y-axis */}
        <div className={styles.yAxisLeft}>
          <span className={styles.yLabel} style={{ bottom: '97%' }}>MAX</span>
          <span className={styles.yLabel} style={{ bottom: '72%' }}>40%</span>
          <span className={styles.yLabel} style={{ bottom: '58%' }}>20%</span>
          <span className={styles.yLabel} style={{ bottom: '50%' }}>AVG</span>
          <span className={styles.yLabel} style={{ bottom: '42%' }}>0%</span>
          <span className={styles.yLabel} style={{ bottom: '28%' }}>20%</span>
          <span className={styles.yLabel} style={{ bottom: '14%' }}>40%</span>
        </div>

        {/* Right Y-axis */}
        <div className={styles.yAxisRight}>
          <span className={styles.yLabelRight} style={{ bottom: '97%' }}>{maxDegree}°</span>
          <span className={styles.yLabelRight} style={{ bottom: '50%' }}>{avgDegree}°</span>
        </div>

        {/* Chart canvas */}
        <div className={styles.chartArea}>
          <div className={styles.gridOverlay} />

          {/* MAX dashed line */}
          <div className={styles.refLineMax} />

          {/* AVG / centre solid line */}
          <div className={styles.refLineAvg} />

          {/* Bars — absolutely positioned by pixel, chartArea clips overflow */}
          {pts.map((pt, i) => {
            const op    = getOpacity(i)
            // left lean height = % of the top half (50% of chartArea)
            // e.g. 100% lean → fills the entire top half
            const leftH  = `${pt.left / 2}%`
            // right lean height = % of the bottom half
            const rightH = `${pt.right / 2}%`
            const leftPx = i * (BAR_W + BAR_GAP)

            return (
              <div
                key={i}
                className={styles.barCol}
                style={{ left: leftPx }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  className={styles.leftBar}
                  style={{ height: leftH, opacity: op }}
                />
                <div
                  className={styles.rightBar}
                  style={{ height: rightH, opacity: op }}
                />
              </div>
            )
          })}

          {/* Playback cursor */}
          {playbackIndex !== null && pbPct !== null && (
            <div
              className={styles.playbackCursor}
              style={{ left: `${pbPct}%` }}
            />
          )}

          {/* Hover tooltip */}
          {hoveredIndex !== null && hovPt && hovPct !== null && (
            <div
              className={`${styles.tooltip} ${alignClass(getAlign(hovPct))}`}
              style={{ left: `${hovPct}%` }}
            >
              <div className={styles.tooltipTitle}>Bar {hoveredIndex + 1}</div>
              <div className={styles.tooltipRow}>
                <span className={styles.tooltipLeft}>LEFT</span>
                <span className={styles.tooltipLeft}>{hovPt.left.toFixed(0)}%</span>
              </div>
              <div className={styles.tooltipRow}>
                <span className={styles.tooltipRight}>RIGHT</span>
                <span className={styles.tooltipRight}>{hovPt.right.toFixed(0)}%</span>
              </div>
            </div>
          )}

          {/* Playback tooltip — only when not hovering */}
          {playbackIndex !== null && pbPt && pbPct !== null && hoveredIndex === null && (
            <div
              className={`${styles.tooltip} ${styles.tooltipPlayback} ${alignClass(getAlign(pbPct))}`}
              style={{ left: `${pbPct}%` }}
            >
              <div className={styles.tooltipTitle}>Live</div>
              <div className={styles.tooltipRow}>
                <span className={styles.tooltipLeft}>LEFT</span>
                <span className={styles.tooltipLeft}>{pbPt.left.toFixed(0)}%</span>
              </div>
              <div className={styles.tooltipRow}>
                <span className={styles.tooltipRight}>RIGHT</span>
                <span className={styles.tooltipRight}>{pbPt.right.toFixed(0)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── X-axis ──────────────────────────────────────────────────────── */}
      <div className={styles.xAxis}>
        <span className={styles.xLabel}>{fmtMs(0)}</span>
        <span className={styles.xLabel}>{fmtMs(totalMs)}</span>
      </div>

    </div>
  )
}