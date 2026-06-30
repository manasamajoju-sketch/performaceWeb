import { useState, useRef, useEffect } from 'react'
import styles from './SpikesChart.module.scss'
import type { SpikesChartProps, LapData } from './SpikesChart.types'

const DEFAULT_LAP_DATA: LapData[] = [
  { brake: 20 }, { brake: 35 }, { brake: 15 }, { brake: 42 },
  { brake: 28 }, { brake: 18 }, { brake: 45 }, { brake: 30 },
  { brake: 22 }, { brake: 38 }, { brake: 12 }, { brake: 48 },
  { brake: 25 }, { brake: 40 }, { brake: 32 }, { brake: 20 },
  { brake: 44 }, { brake: 28 }, { brake: 16 }, { brake: 36 },
  { brake: 50 }, { brake: 24 }, { brake: 38 }, { brake: 14 },
  { brake: 42 }, { brake: 30 }, { brake: 22 }, { brake: 46 },
  { brake: 18 }, { brake: 34 }, { brake: 26 }, { brake: 40 },
].map((d) => ({ brake: d.brake, throttle: 100 - d.brake })) as LapData[]

// Active (selected/hovered) dot radius: expands from 4px to 8px.
const DOT_RADIUS = 4
const DOT_RADIUS_ACTIVE = 8
const TOOLTIP_EDGE_THRESHOLD = 15

type TooltipAlign = 'left' | 'right'

interface StatPanelProps {
  label: string
  sublabel: string
  value: string | number
}

// Same static stat-display shape as ThrottleBrakeChart's StatPanel, so the
// two cards read consistently — label/sublabel left, single value right.
function StatPanel({ label, sublabel, value }: StatPanelProps) {
  return (
    <div className={styles.statPanel}>
      <div className={styles.statLabelGroup}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statSublabel}>{sublabel}</span>
      </div>

      <div className={`${styles.statMetric} ${styles.statMetricActive}`}>
        <span className={`${styles.statValue} ${styles.statValueActive}`}>
          {value}
        </span>
        <span className={`${styles.statMetricLabel} ${styles.statMetricLabelActive}`}>
          SPIKES
        </span>
      </div>
    </div>
  )
}

export function SpikesChart({
  lapData = DEFAULT_LAP_DATA,
  throttleMax = 100,
  brakeMax = 100,
  throttleSpikes = '5:30',
  brakeSpikes = '5:30',
}: SpikesChartProps) {
  const [hoveredLap, setHoveredLap] = useState<number | null>(null)
  const [selectedLap, setSelectedLap] = useState<number | null>(null)
  const [dims, setDims] = useState({ width: 0, height: 0 })
  const areaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = areaRef.current
    if (!el) return

    setDims({ width: el.clientWidth, height: el.clientHeight })

    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      if (width > 0 && height > 0) setDims({ width, height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const total = lapData.length
  const activeLap = hoveredLap ?? selectedLap

  const halfH = dims.height / 2

  const xFor = (i: number) =>
    dims.width > 0 ? ((i + 0.5) / total) * dims.width : 0

  // throttle dot grows UP from center
  const yThrottle = (val: number) =>
    halfH - (val / throttleMax) * (halfH * 0.88)

  // brake dot grows DOWN from center
  const yBrake = (val: number) =>
    halfH + (val / brakeMax) * (halfH * 0.88)

  // Averages derived directly from lapData — same source of truth as
  // ThrottleBrakeChart, no separate avg props needed from the parent.
  const avgThrottle = Math.round(
    lapData.reduce((s, l) => s + l.throttle, 0) / lapData.length,
  )
  const avgBrake = Math.round(
    lapData.reduce((s, l) => s + l.brake, 0) / lapData.length,
  )

  const throttleAvgY = yThrottle(avgThrottle)
  const brakeAvgY = yBrake(avgBrake)

  const handleClick = (i: number) =>
    setSelectedLap((prev) => (prev === i ? null : i))

  const yLabels = [
    { text: `${throttleMax}` },
    { text: `${Math.round(throttleMax / 2)}` },
    { text: '0' },
    { text: `${Math.round(brakeMax / 2)}` },
    { text: `${brakeMax}` },
  ]
  const xAxisLabels = Array.from({ length: 11 }, (_, index) => {
    const lap = Math.max(1, Math.round(((index / 10) * (total - 1)) + 1));
    return { key: `x-label-${index}`, label: `Lap ${lap}` };
  });
  const activeLapPct =
    activeLap !== null ? ((activeLap + 0.5) / total) * 100 : null

  let tooltipAlign: TooltipAlign = 'right'
  if (activeLapPct !== null) {
    if (activeLapPct <= TOOLTIP_EDGE_THRESHOLD) {
      tooltipAlign = 'left'
    } else if (activeLapPct >= 100 - TOOLTIP_EDGE_THRESHOLD) {
      tooltipAlign = 'right'
    }
  }

  const tooltipAlignClass =
    tooltipAlign === 'left' ? styles.tooltipAlignLeft : styles.tooltipAlignRight

  return (
    <div className={styles.card}>
      {/* ── Top stat row: Acceleration left, Deceleration right ── */}
      <div className={styles.statRow}>
        <StatPanel label="Acceleration" sublabel="THROTTLING" value={throttleSpikes} />
        <StatPanel label="Deceleration" sublabel="BRAKING" value={brakeSpikes} />
      </div>

      {/* ── Chart fills remaining height ── */}
      <div className={styles.chartSection}>
        <div className={styles.chartWrapper}>
          <div className={styles.chartOuter}>

            {/* Y-axis */}
            <div className={styles.yAxis}>
              {yLabels.map((l, i) => (
                <span key={i} className={styles.yLabel}>
                  {l.text}
                </span>
              ))}

              {/* AVG labels — pinned to the real avg-line pixel position */}
              {dims.height > 0 && (
                <>
                  <span
                    className={`${styles.yLabel} ${styles.yLabelAvg} ${styles.yLabelAvgPositioned}`}
                    style={{ top: `${throttleAvgY}px` }}
                  >
                    AVG
                  </span>
                  <span
                    className={`${styles.yLabel} ${styles.yLabelAvg} ${styles.yLabelAvgPositioned}`}
                    style={{ top: `${brakeAvgY}px` }}
                  >
                    AVG
                  </span>
                </>
              )}
            </div>

            {/* Chart body — ref here so ResizeObserver gets real px dimensions */}
            <div className={styles.chartArea} ref={areaRef}>
              <div className={styles.gridOverlay} />

              {/* Centre zero line */}
              <div className={styles.centerLine} style={{ top: '50%' }} />

              {/* Throttle AVG line */}
              {dims.height > 0 && (
                <div
                  className={styles.avgLine}
                  style={{ top: `${throttleAvgY}px`, bottom: 'auto' }}
                >
                  <span className={styles.avgLineLabel}>{avgThrottle}</span>
                </div>
              )}

              {/* Brake AVG line */}
              {dims.height > 0 && (
                <div className={styles.avgLine} style={{ top: `${brakeAvgY}px` }}>
                  <span className={styles.avgLineLabel}>{avgBrake}</span>
                </div>
              )}

              {/* SVG dot layer */}
              {dims.width > 0 && dims.height > 0 && (
                <svg className={styles.svgLayer} width={dims.width} height={dims.height}>
                  {lapData.map((lap, i) => {
                    const x = xFor(i)
                    const ty = yThrottle(lap.throttle)
                    const by = yBrake(lap.brake)
                    const faded = activeLap !== null && activeLap !== i
                    const active = activeLap === i

                    return (
                      <g key={i}>
                        {/* Connector line joining throttle dot to brake dot when active */}
                        {active && (
                          <line
                            x1={x}
                            y1={ty}
                            x2={x}
                            y2={by}
                            className={styles.connectorLine}
                          />
                        )}

                        {/* Throttle dot — teal, upper half */}
                        <circle
                          cx={x}
                          cy={ty}
                          r={active ? DOT_RADIUS_ACTIVE : DOT_RADIUS}
                          className={`
                            ${styles.dotTeal}
                            ${faded ? styles.dotFaded : ''}
                            ${active ? styles.dotActive : ''}
                          `}
                          onMouseEnter={() => setHoveredLap(i)}
                          onMouseLeave={() => setHoveredLap(null)}
                          onClick={() => handleClick(i)}
                        />
                        {/* Brake dot — dark, lower half */}
                        <circle
                          cx={x}
                          cy={by}
                          r={active ? DOT_RADIUS_ACTIVE : DOT_RADIUS}
                          className={`
                            ${styles.dotDark}
                            ${faded ? styles.dotFaded : ''}
                            ${active ? styles.dotActiveAlt : ''}
                          `}
                          onMouseEnter={() => setHoveredLap(i)}
                          onMouseLeave={() => setHoveredLap(null)}
                          onClick={() => handleClick(i)}
                        />
                      </g>
                    )
                  })}
                </svg>
              )}

              {/* Vertical guide line under the active lap's dots */}
              {activeLapPct !== null && (
                <div className={styles.lapIndicator} style={{ left: `${activeLapPct}%` }} />
              )}

              {/* Tooltip */}
              {activeLap !== null && activeLapPct !== null && (
                <div
                  className={`${styles.tooltip} ${tooltipAlignClass}`}
                  style={{ left: `${activeLapPct}%` }}
                >
                  <div className={styles.tooltipTitle}>Lap {activeLap + 1}</div>
                  <div className={styles.tooltipTeal}>
                    Acce: {lapData[activeLap].throttle}
                  </div>
                  <div className={styles.tooltipMuted}>
                    Decel: {lapData[activeLap].brake}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* X-axis */}
          <div className={styles.xAxis}>
            {xAxisLabels.map((tick) => (
              <span
                key={tick.key}
                className={styles.xLabel}
                style={{ flex: 1, textAlign: "center" }}
              >
                {tick.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}