import { useState } from "react";
import styles from "./LapTimeChart.module.scss";
import type {
  LapTimeProps,
  LapTimeDataPoint,
  LapTimeYAxisLabel,
  LapTimeRefLine,
} from "./LapTimeChart.types";

// 61 points at 8px bar + 8px gap (16px period) fills the 966px chart area
// almost exactly (61*16 - 8 = 968px) — this is the actual fix for bars not
// reaching the right edge; the bars themselves stay a fixed size per spec,
// rather than stretching to fill whatever width is available.
const DEFAULT_DATA: LapTimeDataPoint[] = Array.from({ length: 61 }, (_, i) => {
  const value = 15 + Math.round(Math.abs(Math.sin(i * 0.7)) * 55);
  return { value };
});

const DEFAULT_Y_AXIS: LapTimeYAxisLabel[] = [
  { text: "100%", percent: 100 },
  { text: "80%", percent: 80 },
  { text: "60%", percent: 60 },
  { text: "40%", percent: 40 },
  { text: "20%", percent: 20 },
  { text: "0%", percent: 0 },
];

const DEFAULT_REF_LINES: LapTimeRefLine[] = [
  { label: "MAX", value: "09:30", percent: 75 },
  { label: "AVG", value: "05:30", percent: 25 },
];

// Distance, in %, from either edge within which a tooltip anchors against
// its bar instead of centering on it, so it never clips off the chart.
const TOOLTIP_EDGE_THRESHOLD = 15;

// How far (px) a tooltip floats above the top of its active bar.
const TOOLTIP_BAR_GAP = 5;

type TooltipAlign = "left" | "center" | "right";

function getTooltipAlign(pct: number): TooltipAlign {
  if (pct <= TOOLTIP_EDGE_THRESHOLD) return "left";
  if (pct >= 100 - TOOLTIP_EDGE_THRESHOLD) return "right";
  return "center";
}

function alignClass(styleMap: Record<string, string>, align: TooltipAlign) {
  return align === "left"
    ? styleMap.tooltipAlignLeft
    : align === "right"
      ? styleMap.tooltipAlignRight
      : styleMap.tooltipAlignCenter;
}

function getBarOpacity(
  i: number,
  hoveredIndex: number | null,
  playbackIndex: number | null | undefined,
): number {
  const isPlayback = playbackIndex != null && playbackIndex === i;
  const isHovered = hoveredIndex === i;
  if (isPlayback) return 1;
  if (isHovered) return playbackIndex != null ? 0.6 : 1;
  if (hoveredIndex !== null || playbackIndex != null) return 0.2;
  return 1;
}

export function LapTime({
  label = "Lap Time",
  sublabel = "MM:SS",
  avgValue = "5:30",
  maxValue = "5:30",
  data = DEFAULT_DATA,
  yAxisLabels = DEFAULT_Y_AXIS,
  refLines = DEFAULT_REF_LINES,
  xAxisLabels,
  playbackIndex = null,
  playbackMs = 0,
  playing = false,
  totalMs = 0,
}: LapTimeProps) {
  // Hover/click are local UI state. playbackIndex is controlled externally —
  // neither one ever touches avgValue/maxValue: the header is a session
  // summary and must not change on hover or during playback (Core Rule).
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const total = data.length;
  
  // Calculate playback index from playbackMs if playbackMs is provided
  let calculatedPlaybackIndex = playbackIndex;
  if (playbackMs > 0 || playing) {
    const isPlaying = playing || playbackMs > 0;
    calculatedPlaybackIndex = isPlaying && totalMs > 0
      ? Math.min(Math.round((playbackMs / totalMs) * (total - 1)), total - 1)
      : null;
  }
  
  const hoverActive = hoveredIndex ?? selectedIndex;

  const handleBarClick = (i: number) =>
    setSelectedIndex((prev) => (prev === i ? null : i));

  const xTicks = xAxisLabels ?? Array.from({ length: 12 }, () => "00:00");

  const hoverPct =
    hoverActive !== null ? ((hoverActive + 0.5) / total) * 100 : null;
  const playbackPct =
    calculatedPlaybackIndex != null ? ((calculatedPlaybackIndex + 0.5) / total) * 100 : null;

  return (
    <div className={styles.card}>
      {/* ── Header — session summary only, never updates on hover/playback ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.label}>{label}</span>
          <span className={styles.sublabel}>{sublabel}</span>
        </div>
        <div className={styles.statValue}>
          <span className={styles.statNumber}>{avgValue}</span>
          <span className={styles.statSublabel}>AVG</span>
        </div>
        <div className={styles.statValue}>
          <span className={styles.statNumber}>{maxValue}</span>
          <span className={styles.statSublabel}>MAX</span>
        </div>
      </div>

      {/* ── Chart ── */}
      <div className={styles.chartOuter}>
        <div className={styles.yAxisLeft}>
          {yAxisLabels.map((l, i) => (
            <span
              key={i}
              className={styles.yLabel}
              style={{ bottom: `${l.percent}%` }}
            >
              {l.text}
            </span>
          ))}
        </div>

        <div className={styles.yAxisRight}>
          {yAxisLabels.map((l, i) => (
            <span
              key={i}
              className={styles.yLabel}
              style={{ bottom: `${l.percent}%` }}
            >
              {l.text}
            </span>
          ))}
        </div>

        <div className={styles.chartArea}>
          <div className={styles.gridOverlay} />

          {refLines.map((ref, i) => (
            <div
              key={i}
              className={styles.refLine}
              style={{ bottom: `${ref.percent}%` }}
            >
              <span className={styles.refLineLabel}>{ref.label}</span>
              <span className={styles.refLineValue}>{ref.value}</span>
            </div>
          ))}

          <div className={styles.barsScroll}>
            <div className={styles.barsContainer}>
              {data.map((point, i) => (
                <div
                  key={i}
                  className={styles.barCol}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => handleBarClick(i)}
                >
                  <div
                    className={styles.bar}
                    style={{
                      height: `${point.value}%`,
                      opacity: getBarOpacity(i, hoverActive, calculatedPlaybackIndex),
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Playback cursor — solid 2px line in Quin Blue, independent of
              and rendered alongside any hover state. */}
          {playbackPct !== null && (
            <div
              className={styles.playbackCursor}
              style={{ left: `${playbackPct}%` }}
            />
          )}

          {/* Playback tooltip — visible whenever playback is running,
              regardless of hover. */}
          {calculatedPlaybackIndex != null && playbackPct !== null && (
            <div
              className={`${styles.tooltip} ${alignClass(styles, getTooltipAlign(playbackPct))}`}
              style={{
                left: `${playbackPct}%`,
                bottom: `calc(${data[calculatedPlaybackIndex].value}% + ${TOOLTIP_BAR_GAP}px)`,
              }}
            >
              <div className={styles.tooltipTitle}>Lap {calculatedPlaybackIndex + 1}</div>
              <div className={styles.tooltipValue}>
                {data[calculatedPlaybackIndex].timeLabel ?? `${data[calculatedPlaybackIndex].value}%`}
              </div>
            </div>
          )}

          {hoverActive !== null &&
            hoverActive !== calculatedPlaybackIndex &&
            hoverPct !== null && (
              <div
                className={`${styles.tooltip} ${alignClass(styles, getTooltipAlign(hoverPct))}`}
                style={{
                  left: `${hoverPct}%`,
                  bottom: `calc(${data[hoverActive].value}% + ${TOOLTIP_BAR_GAP}px)`,
                }}
              >
                <div className={styles.tooltipTitle}>Lap {hoverActive + 1}</div>
                <div className={styles.tooltipValue}>
                  {data[hoverActive].timeLabel ?? `${data[hoverActive].value}%`}
                </div>
              </div>
            )}
        </div>
      </div>

      {/* ── X-Axis ── */}
      <div className={styles.xAxis}>
        {xTicks.map((t, i) => (
          <span key={i} className={styles.xLabel}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}