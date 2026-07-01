import { useState } from 'react'
import styles from './SpeedChart.module.scss'
import type { SpeedChartProps, SpeedLapData } from './SpeedChart.types'

const DEFAULT_LAP_DATA: SpeedLapData[] = [
  { maxSpeed: 68, avgSpeed: 18 }, { maxSpeed: 55, avgSpeed: 22 },
  { maxSpeed: 90, avgSpeed: 20 }, { maxSpeed: 72, avgSpeed: 28 },
  { maxSpeed: 38, avgSpeed: 15 }, { maxSpeed: 48, avgSpeed: 25 },
  { maxSpeed: 95, avgSpeed: 30 }, { maxSpeed: 42, avgSpeed: 19 },
  { maxSpeed: 63, avgSpeed: 23 }, { maxSpeed: 79, avgSpeed: 27 },
  { maxSpeed: 35, avgSpeed: 14 }, { maxSpeed: 88, avgSpeed: 29 },
  { maxSpeed: 52, avgSpeed: 21 }, { maxSpeed: 66, avgSpeed: 24 },
  { maxSpeed: 44, avgSpeed: 17 }, { maxSpeed: 80, avgSpeed: 26 },
  { maxSpeed: 91, avgSpeed: 31 }, { maxSpeed: 57, avgSpeed: 20 },
  { maxSpeed: 40, avgSpeed: 16 }, { maxSpeed: 83, avgSpeed: 28 },
  { maxSpeed: 61, avgSpeed: 22 }, { maxSpeed: 95, avgSpeed: 32 },
  { maxSpeed: 47, avgSpeed: 18 }, { maxSpeed: 86, avgSpeed: 29 },
  { maxSpeed: 53, avgSpeed: 21 }, { maxSpeed: 77, avgSpeed: 27 },
  { maxSpeed: 36, avgSpeed: 15 }, { maxSpeed: 92, avgSpeed: 32 },
  { maxSpeed: 64, avgSpeed: 23 }, { maxSpeed: 49, avgSpeed: 19 },
  { maxSpeed: 81, avgSpeed: 28 }, { maxSpeed: 58, avgSpeed: 21 },
]

// Vertical gap, in px, carved out between the avg (bottom) and max (top) bar segments.
const BAR_SEGMENT_GAP = 4
const TOOLTIP_EDGE_THRESHOLD = 15;

type TooltipAlign = "left" | "right";
type SpeedView = 'avg' | 'max'

export function SpeedChart({
  lapData = DEFAULT_LAP_DATA,
  avgSpeed = 55,
  maxSpeed = 120,
  yMax = 100,
  maxLine = 82,
  avgLine = 18,
  unit = 'KM/H',
  playbackMs = 0,
  playing = false,
  totalMs = 0,
}: SpeedChartProps) {
  const [view, setView] = useState<SpeedView>('avg')
  const [hoveredLap, setHoveredLap] = useState<number | null>(null)
  const [selectedLap, setSelectedLap] = useState<number | null>(null)

  const total = lapData.length
  
  // Calculate playback index
  const isPlaying = playing || playbackMs > 0;
  const pbIdx = isPlaying && totalMs > 0
    ? Math.min(Math.round((playbackMs / totalMs) * (total - 1)), total - 1)
    : null;
  
  const activeLap = hoveredLap ?? selectedLap ?? pbIdx

  const handleLapClick = (i: number) =>
    setSelectedLap(prev => (prev === i ? null : i))

  const toPercent = (val: number) => Math.min(100, (val / yMax) * 100)

  const maxLineBottom = toPercent(maxLine)
  const avgLineBottom = toPercent(avgLine)

  const yLabels = [
    { text: '100 KM/H',  avg: false },
    { text: 'MAX',  avg: true  },
    { text: '80 KM/H',   avg: false },
    { text: '60 KM/H',   avg: false },
    { text: '40 KM/H',   avg: false },
    { text: 'AVG',  avg: true  },
    { text: '0 KM/H',    avg: false },
  ]
   const activeLapPct =
    activeLap !== null ? ((activeLap + 0.5) / total) * 100 : null;

  let tooltipAlign: TooltipAlign = "right";
  if (activeLapPct !== null) {
    if (activeLapPct <= TOOLTIP_EDGE_THRESHOLD) {
      tooltipAlign = "left";
    } else if (activeLapPct >= 100 - TOOLTIP_EDGE_THRESHOLD) {
      tooltipAlign = "right";
    }
  }

  const tooltipAlignClass =
    tooltipAlign === "left"
      ? styles.tooltipAlignLeft
      : tooltipAlign === "right"
        ? styles.tooltipAlignRight
        : styles.tooltipAlignRight; 
  return (
    <div className={styles.card}>

      {/* ── Header ── */}
      <div className={styles.statRow}>
        <div className={styles.statLeft}>
          <span className={styles.statLabel}>Speed</span>
          <span className={styles.statUnit}>{unit}</span>
        </div>

        {/* AVG button */}
        <button
          type="button"
          className={`${styles.statAvgBtn} ${view === 'avg' ? styles.statAvgBtnActive : ''}`}
          onClick={() => setView('avg')}
        >
          <span className={`${styles.statNumber} ${view === 'avg' ? styles.statNumberActive : ''}`}>
            {avgSpeed}
          </span>
          <span className={`${styles.statSubLabel} ${view === 'avg' ? styles.statSubLabelActive : ''}`}>
            AVG
          </span>
        </button>

        {/* MAX button */}
        <button
          type="button"
          className={`${styles.statMaxBtn} ${view === 'max' ? styles.statMaxBtnActive : ''}`}
          onClick={() => setView('max')}
        >
          <span className={`${styles.statNumber} ${view === 'max' ? styles.statNumberActive : ''}`}>
            {maxSpeed}
          </span>
          <span className={`${styles.statSubLabel} ${view === 'max' ? styles.statSubLabelActive : ''}`}>
            MAX
          </span>
        </button>
      </div>

      {/* <div className={styles.divider} /> */}

      {/* ── Chart ── */}
      <div className={styles.chartWrapper}>
        <div className={styles.chartOuter}>

          {/* Y-axis */}
          <div className={styles.yAxis}>
            {yLabels.map((l, i) => (
              <span key={i} className={`${styles.yLabel} ${l.avg ? styles.yLabelAvg : ''}`}>
                {l.text}
              </span>
            ))}
          </div>

          {/* Chart body */}
          <div className={styles.chartArea}>
            <div className={styles.gridOverlay} />

            {/* MAX reference line */}
            <div className={styles.refLine} style={{ bottom: `${maxLineBottom}%` }}>
              <span className={styles.refLineLabel}>{maxLine}<br></br>KM/H</span>
            </div>

            {/* AVG reference line */}
            <div className={styles.refLine} style={{ bottom: `${avgLineBottom}%` }}>
              <span className={styles.refLineLabel}>{avgLine}<br></br>KM/H</span>
            </div>

            {/* Bars */}
            <div className={styles.barsScroll}>
              <div className={styles.barsContainer}>
                {lapData.map((lap, i) => {
                  const faded = activeLap !== null && activeLap !== i
                  const active = activeLap === i

                  const avgPct = toPercent(lap.avgSpeed)
                  const maxPct = toPercent(lap.maxSpeed)
                  
                  // Calculate opacity based on playback and hover state
                  let opacityValue = 1;
                  if (hoveredLap !== null || pbIdx !== null) {
                    if (i === pbIdx && i === hoveredLap) {
                      opacityValue = 1; // Playback takes priority
                    } else if (i === pbIdx) {
                      opacityValue = 1;
                    } else if (i === hoveredLap) {
                      opacityValue = pbIdx !== null ? 0.6 : 1;
                    } else {
                      opacityValue = 0.2;
                    }
                  }

                  return (
                    <div
                      key={i}
                      className={`${styles.barCol} ${faded ? styles.barColFaded : ''} ${active ? styles.barColActive : ''}`}
                      style={{ opacity: opacityValue }}
                      onMouseEnter={() => setHoveredLap(i)}
                      onMouseLeave={() => setHoveredLap(null)}
                      onClick={() => handleLapClick(i)}
                    >
                      {/* Dark teal avg bar (bottom segment, anchored to baseline) */}
                      <div
                        className={`${styles.avgBar} ${view === 'max' ? ` ${styles.avgBarMax}` : styles.barActive}`}
                        style={{ height: `${avgPct}%` }}
                      />
                      {/* Light teal max bar (top segment, offset by a 2px gap above the avg segment) */}
                      <div
                        className={`${styles.maxBar} ${view === 'avg' ? "" : styles.barActive}`}
                        style={{
                          bottom: `calc(${avgPct}% + ${BAR_SEGMENT_GAP}px)`,
                          height: `calc(${maxPct - avgPct}% - ${BAR_SEGMENT_GAP}px)`,
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Tooltip */}
            {activeLap !== null && (
              <div
                className={`${styles.tooltip} ${tooltipAlignClass}`}
                style={{ left: `${((activeLap + 0.5) / total) * 100}%` }}
              >
                <div className={styles.tooltipTitle}>Lap {activeLap + 1}</div>
                {view === 'max' && (
                <div className={styles.tooltipTeal}>Max: {lapData[activeLap].maxSpeed} {unit}</div>
                )}
                {view === 'avg' && (
                  <div className={styles.tooltipTeal}>Avg: {lapData[activeLap].avgSpeed} {unit}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* X-axis */}
        <div className={styles.xAxis}>
          <span className={styles.xLabel}>Lap 1</span>
          <span className={styles.xLabel}>Lap {total}</span>
        </div>
      </div>
    </div>
  )
}