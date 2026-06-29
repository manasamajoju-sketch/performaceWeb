import { useState } from 'react'
import styles from './AccelerometerChart.module.scss'
import type { AccelerometerChartProps, AxisDataPoint } from './AccelerometerChart.types'

const DEFAULT_DATA: AxisDataPoint[] = Array.from({ length: 48 }, (_, i) => {
  const phase = i / 48
  return {
    x: 30 + 25 * Math.sin(phase * Math.PI * 2),
    y: 25 + 20 * Math.sin(phase * Math.PI * 2 + 2),
    z: 35 + 22 * Math.sin(phase * Math.PI * 2 + 4),
  }
})

const TOOLTIP_EDGE_THRESHOLD = 15
type TooltipAlign = 'left' | 'right'

function dominantAxis(p: AxisDataPoint): 'x' | 'y' | 'z' {
  if (p.x >= p.y && p.x >= p.z) return 'x'
  if (p.y >= p.x && p.y >= p.z) return 'y'
  return 'z'
}

export function AccelerometerChart({
  data = DEFAULT_DATA,
  label = 'Accelerometer',
  unit = 'MS',
  avgValue = 85,
  maxValue = 120,
  xAvg = 2.1,
  yAvg = 2.1,
  zAvg = 3,
  yMax = 100,
  maxLine = 70,
  avgLine = 30,
  rightTopLabel = '09:30',
  rightBottomLabel = '05:30',
}: AccelerometerChartProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const active = hovered ?? selected

  const total = data.length
  const toPercent = (v: number) => Math.min(100, (v / yMax) * 100)

  const activePct = active !== null ? ((active + 0.5) / total) * 100 : null
  let tooltipAlign: TooltipAlign = 'right'
  if (activePct !== null) {
    if (activePct <= TOOLTIP_EDGE_THRESHOLD) tooltipAlign = 'left'
    else if (activePct >= 100 - TOOLTIP_EDGE_THRESHOLD) tooltipAlign = 'right'
  }
  const tooltipAlignClass =
    tooltipAlign === 'left' ? styles.tooltipAlignLeft : styles.tooltipAlignRight

  const barColorClass = (axis: 'x' | 'y' | 'z') =>
    axis === 'x' ? styles.barCyan : axis === 'y' ? styles.barGreen : styles.barPurple

  return (
    <div className={styles.card}>
      {/* ── Header ── */}
      <div className={styles.headerRow}>
        <div className={styles.headerLeft}>
          <span className={styles.headerLabel}>{label}</span>
          <span className={styles.headerUnit}>{unit}</span>
        </div>

        <div className={styles.statGroup}>
          <span className={styles.statNumber}>{avgValue}</span>
          <span className={styles.statSubLabel}>AVG</span>
        </div>
        <div className={styles.statGroup}>
          <span className={styles.statNumber}>{maxValue}</span>
          <span className={styles.statSubLabel}>MAX</span>
        </div>

        <div className={styles.axisStats}>
          <div className={styles.statGroup}>
            <span className={`${styles.axisDot} ${styles.dotCyan}`} />
            <span className={styles.statNumber}>{xAvg}</span>
            <span className={styles.statSubLabel}>X-AVG</span>
          </div>
          <div className={styles.statGroup}>
            <span className={`${styles.axisDot} ${styles.dotGreen}`} />
            <span className={styles.statNumber}>{yAvg}</span>
            <span className={styles.statSubLabel}>Y-AVG</span>
          </div>
          <div className={styles.statGroup}>
            <span className={`${styles.axisDot} ${styles.dotPurple}`} />
            <span className={styles.statNumber}>{zAvg}</span>
            <span className={styles.statSubLabel}>Z-AVG</span>
          </div>
        </div>
      </div>

      {/* ── Chart ── */}
      <div className={styles.chartOuter}>
        <div className={styles.yAxisLeft}>
          <span className={styles.yLabel} style={{ bottom: '60%' }}>60%</span>
          <span className={`${styles.yLabel} ${styles.yLabelBold}`} style={{ bottom: `${toPercent(maxLine)}%` }}>MAX</span>
          <span className={styles.yLabel} style={{ bottom: '20%' }}>20%</span>
          <span className={`${styles.yLabel} ${styles.yLabelBold}`} style={{ bottom: `${toPercent(avgLine)}%` }}>AVG</span>
          <span className={styles.yLabel} style={{ bottom: '0%' }}>-40%</span>
        </div>

        <div className={styles.chartArea}>
          <div className={styles.refLine} style={{ bottom: `${toPercent(maxLine)}%` }} />
          <div className={styles.refLine} style={{ bottom: `${toPercent(avgLine)}%` }} />

          <div className={styles.barsLayer}>
            {data.map((p, i) => {
              const axis = dominantAxis(p)
              const value = Math.max(p.x, p.y, p.z)
              const faded = active !== null && active !== i
              return (
                <div
                  key={i}
                  className={`${styles.bar} ${barColorClass(axis)} ${faded ? styles.barFaded : ''}`}
                  style={{ height: `${toPercent(value)}%` }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setSelected((prev) => (prev === i ? null : i))}
                />
              )
            })}
          </div>

          {active !== null && activePct !== null && (
            <div className={`${styles.tooltip} ${tooltipAlignClass}`} style={{ left: `${activePct}%` }}>
              <div className={styles.tooltipTitle}>Point {active + 1}</div>
              <div className={styles.tooltipCyan}>X: {data[active].x.toFixed(1)}</div>
              <div className={styles.tooltipGreen}>Y: {data[active].y.toFixed(1)}</div>
              <div className={styles.tooltipPurple}>Z: {data[active].z.toFixed(1)}</div>
            </div>
          )}
        </div>

        <div className={styles.yAxisRight}>
          <span className={styles.yLabelRight} style={{ bottom: `${toPercent(maxLine)}%` }}>{rightTopLabel}</span>
          <span className={styles.yLabelRight} style={{ bottom: `${toPercent(avgLine)}%` }}>
            {rightBottomLabel}<br />AVG
          </span>
        </div>
      </div>

      <div className={styles.xAxis}>
        <span className={styles.xLabel}>00:00</span>
        <span className={styles.xLabel}>00:00</span>
      </div>
    </div>
  )
}