import { useState, useRef, useEffect } from 'react'
import styles from './SpikesChart.module.scss'
import type { SpikesChartProps } from './SpikesChart.types'

const DEFAULT_SPIKE_DATA = [
  { throttleAvg: 28, brakeAvg: 12 }, { throttleAvg: 35, brakeAvg: 18 },
  { throttleAvg: 22, brakeAvg: 10 }, { throttleAvg: 40, brakeAvg: 15 },
  { throttleAvg: 31, brakeAvg: 20 }, { throttleAvg: 25, brakeAvg: 8  },
  { throttleAvg: 44, brakeAvg: 22 }, { throttleAvg: 38, brakeAvg: 16 },
  { throttleAvg: 29, brakeAvg: 11 }, { throttleAvg: 50, brakeAvg: 19 },
  { throttleAvg: 33, brakeAvg: 14 }, { throttleAvg: 41, brakeAvg: 21 },
  { throttleAvg: 27, brakeAvg: 9  }, { throttleAvg: 55, brakeAvg: 25 },
  { throttleAvg: 36, brakeAvg: 17 }, { throttleAvg: 42, brakeAvg: 13 },
  { throttleAvg: 30, brakeAvg: 10 }, { throttleAvg: 48, brakeAvg: 23 },
  { throttleAvg: 34, brakeAvg: 15 }, { throttleAvg: 26, brakeAvg: 8  },
  { throttleAvg: 52, brakeAvg: 24 }, { throttleAvg: 39, brakeAvg: 18 },
  { throttleAvg: 32, brakeAvg: 12 }, { throttleAvg: 46, brakeAvg: 22 },
  { throttleAvg: 24, brakeAvg: 9  }, { throttleAvg: 43, brakeAvg: 20 },
  { throttleAvg: 37, brakeAvg: 14 }, { throttleAvg: 49, brakeAvg: 23 },
  { throttleAvg: 31, brakeAvg: 11 }, { throttleAvg: 28, brakeAvg: 7  },
  { throttleAvg: 45, brakeAvg: 21 }, { throttleAvg: 40, brakeAvg: 16 },
]

// Active (selected/hovered) dot radius, per dev note: expand from 4px to 8px.
const DOT_RADIUS = 4
const DOT_RADIUS_ACTIVE = 8
const TOOLTIP_EDGE_THRESHOLD = 15;

type TooltipAlign = "left" | "right";

export function SpikesChart({
  lapData = DEFAULT_SPIKE_DATA,
  throttleAvg = 4,
  brakeAvg = 5,
  throttleMax = 60,
  brakeMax = 40,
}: SpikesChartProps) {
  const [hoveredLap, setHoveredLap] = useState<number | null>(null)
  const [selectedLap, setSelectedLap] = useState<number | null>(null)
  const [dims, setDims] = useState({ width: 0, height: 0 })
  const areaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = areaRef.current
    if (!el) return

    // measure immediately on mount
    setDims({ width: el.clientWidth, height: el.clientHeight })

    const ro = new ResizeObserver(entries => {
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

  const throttleAvgY = yThrottle(throttleAvg)
  const brakeAvgY    = yBrake(brakeAvg)

  const handleClick = (i: number) =>
    setSelectedLap(prev => prev === i ? null : i)

  // Numeric gridline labels only — these stay in the evenly-spaced flex
  // column. Derived from throttleMax/brakeMax so they actually scale with
  // whatever data range is passed in (e.g. 0–100 for percentages) instead
  // of hardcoding values that only matched the default 60/40 scale.
  // The "AVG" labels are rendered separately below, pinned to the actual
  // pixel height of their avg line (throttleAvgY / brakeAvgY), since that
  // height is data-driven and won't reliably land on an evenly-spaced flex
  // slot the way these fixed numeric ticks do.
  const yLabels = [
    { text: `${throttleMax}` },
    { text: `${Math.round(throttleMax / 2)}` },
    { text: '0' },
    { text: `${Math.round(brakeMax / 2)}` },
    { text: `${brakeMax}` },
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
    tooltipAlign === "left" ? styles.tooltipAlignLeft : styles.tooltipAlignRight;

  return (
    <div className={styles.chartWrapper}>
      <div className={styles.chartOuter}>

        {/* Y-axis */}
        <div className={styles.yAxis}>
          {yLabels.map((l, i) => (
            <span key={i} className={styles.yLabel}>
              {l.text}
            </span>
          ))}

          {/* AVG labels — pinned to the real avg-line pixel position,
              not part of the evenly-spaced flex list above. */}
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

          {/* Centre zero line */}
          <div className={styles.centerLine} style={{ top: '50%' }} />

          {/* Throttle AVG line */}
          {dims.height > 0 && (
            <div
              className={styles.avgLine}
              style={{ top: `${throttleAvgY}px`, bottom: 'auto' }}
            >
              <span className={styles.avgLineLabel}>{throttleAvg}</span>
            </div>
          )}

          {/* Brake AVG line */}
          {dims.height > 0 && (
            <div
              className={styles.avgLine}
              style={{ top: `${brakeAvgY}px` }}
            >
              <span className={styles.avgLineLabel}>{brakeAvg}</span>
            </div>
          )}

          {/* SVG dot layer — only render once we have real dimensions */}
          {dims.width > 0 && dims.height > 0 && (
            <svg
              className={styles.svgLayer}
              width={dims.width}
              height={dims.height}
            >
              {lapData.map((lap, i) => {
                const x  = xFor(i)
                const ty = yThrottle(lap.throttleAvg)
                const by = yBrake(lap.brakeAvg)
                const faded  = activeLap !== null && activeLap !== i
                const active = activeLap === i

                return (
                  <g key={i}>
                    {/*
                      Connector line: when this lap is selected/hovered,
                      draw a vertical line joining the throttle dot to the
                      brake dot (per dev note).
                    */}
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
                        ${faded  ? styles.dotFaded     : ''}
                        ${active ? styles.dotActive    : ''}
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
                        ${faded  ? styles.dotFaded     : ''}
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
            <div
              className={styles.lapIndicator}
              style={{ left: `${activeLapPct}%` }}
            />
          )}

          {/* Tooltip */}
          {activeLap !== null && activeLapPct !== null && (
            <div
              className={`${styles.tooltip} ${tooltipAlignClass}`}
              style={{ left: `${activeLapPct}%` }}
            >
              <div className={styles.tooltipTitle}>Lap {activeLap + 1}</div>
              <div className={styles.tooltipTeal}>
                Acce: {lapData[activeLap].throttleAvg}
              </div>
              <div className={styles.tooltipMuted}>
                Decel: {lapData[activeLap].brakeAvg}
              </div>
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
  )
}