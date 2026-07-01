import { useState, useRef, useEffect } from 'react'
import styles from './ImpactAnalysis.module.scss'
import type { ImpactAnalysisChartProps, AxisDataPoint } from './ImpactAnalysis.types'

const DEFAULT_DATA: AxisDataPoint[] = Array.from({ length: 32 }, (_, i) => {
  const phase = i / 32
  return {
    x: 30 - 25 * phase + 10 * Math.sin(phase * Math.PI * 6),
    y: 30 + 15 * Math.sin(phase * Math.PI * 4 + 1),
    z: 40 + 30 * Math.sin(phase * Math.PI * 2 + 2),
  }
})

export default function ImpactAnalysisChart({
  data = DEFAULT_DATA,
  label = 'IMPACT ANALYSIS',
  unit = 'POINTS',
  avgValue = 85,
  maxValue = 120,
  xAvg = 2.1,
  yAvg = 2.1,
  zAvg = 3,
  yMax = 100,
  yMin = -40,
  maxLine = 60,
  avgLine = 0,
  rightTopLabel = '09:30',
  rightBottomLabel = '05:30',
  playbackMs = 0,
  playing = false,
  totalMs = 0,
}: ImpactAnalysisChartProps) {
  const [hovered, setHovered] = useState<number | null>(null)
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

  const total = data.length
  const range = yMax - yMin
  
  // Calculate playback index
  const isPlaying = playing || playbackMs > 0;
  const pbIdx = isPlaying && totalMs > 0
    ? Math.min(Math.round((playbackMs / totalMs) * (total - 1)), total - 1)
    : null;

  const xFor = (i: number) => (dims.width > 0 ? (i / (total - 1)) * dims.width : 0)
  const yFor = (val: number) =>
    dims.height > 0 ? dims.height - ((val - yMin) / range) * dims.height : 0

  const buildPath = (key: 'x' | 'y' | 'z') =>
    data.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(p[key])}`).join(' ')

  const toPercent = (val: number) => ((val - yMin) / range) * 100

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
          <span className={styles.yLabel} style={{ bottom: '70%' }}>40%</span>
          <span className={`${styles.yLabel} ${styles.yLabelBold}`} style={{ bottom: `${toPercent(maxLine)}%` }}>MAX</span>
          <span className={styles.yLabel} style={{ bottom: `${toPercent(0)}%` }}>0%</span>
          <span className={`${styles.yLabel} ${styles.yLabelBold}`} style={{ bottom: `${toPercent(avgLine)}%` }}>AVG</span>
          <span className={styles.yLabel} style={{ bottom: '0%' }}>-40%</span>
        </div>

        <div className={styles.chartArea} ref={areaRef}>
          <div className={styles.refLine} style={{ bottom: `${toPercent(maxLine)}%` }} />
          <div className={styles.refLine} style={{ bottom: `${toPercent(avgLine)}%` }} />

          {dims.width > 0 && dims.height > 0 && (
            <svg className={styles.svgLayer} width={dims.width} height={dims.height}>
              <path d={buildPath('x')} fill="none" className={styles.lineCyan} strokeWidth={2} />
              <path d={buildPath('y')} fill="none" className={styles.lineGreen} strokeWidth={2} />
              <path d={buildPath('z')} fill="none" className={styles.linePurple} strokeWidth={2} />

              {hovered !== null && (
                <line
                  x1={xFor(hovered)} y1={0} x2={xFor(hovered)} y2={dims.height}
                  className={styles.hoverLine}
                />
              )}
              
              {/* Playback cursor line */}
              {pbIdx !== null && (
                <line
                  x1={xFor(pbIdx)} y1={0} x2={xFor(pbIdx)} y2={dims.height}
                  className={styles.playbackLine}
                  strokeWidth={2}
                  stroke="rgba(100, 200, 255, 0.8)"
                />
              )}

              {data.map((_, i) => (
                <rect
                  key={i}
                  x={xFor(i) - dims.width / total / 2}
                  y={0}
                  width={dims.width / total}
                  height={dims.height}
                  fill="transparent"
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                />
              ))}
            </svg>
          )}

          {hovered !== null && (
            <div
              className={`${styles.tooltip} ${styles.tooltipAlignRight}`}
              style={{ left: `${(hovered / (total - 1)) * 100}%` }}
            >
              <div className={styles.tooltipTitle}>Point {hovered + 1}</div>
              <div className={styles.tooltipCyan}>X: {data[hovered].x.toFixed(1)}</div>
              <div className={styles.tooltipGreen}>Y: {data[hovered].y.toFixed(1)}</div>
              <div className={styles.tooltipPurple}>Z: {data[hovered].z.toFixed(1)}</div>
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