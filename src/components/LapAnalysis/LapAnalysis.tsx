import { useState } from "react";
import { useChartInteraction } from "../chart-utils";
import styles from "./LapAnalysis.module.scss";
import type {
  SessionGraphProps,
  SessionGraphLapData,
  SessionGraphAxisLabel,
} from "./LapAnalysis.types";

// 32 laps, accel-heavy data similar in shape to ThrottleBrakeChart's defaults.
const DEFAULT_LAP_DATA: SessionGraphLapData[] = [
  72, 58, 80, 65, 70, 62, 75, 68, 71, 67, 73, 60, 78, 66, 69, 74, 63, 77, 70,
  65, 72, 61, 76, 68, 70, 64, 79, 67, 71, 69, 73, 66,
].map((accel) => ({ accel }));

const DEFAULT_LEFT_AXIS: SessionGraphAxisLabel[] = [
  { text: "60%", percent: 60 },
  { text: "40%", percent: 40 },
  { text: "20%", percent: 20 },
];

const DEFAULT_RIGHT_AXIS: SessionGraphAxisLabel[] = [
  { text: "MAX", percent: 75 },
  { text: "AVG", percent: 20 },
];

const DEFAULT_LEFT_STAT = {
  label: "Lap Time",
  sublabel: "MM:SS",
  avgValue: "5:30",
  maxValue: "5:30",
};

const DEFAULT_RIGHT_STAT = {
  label: "Pace",
  sublabel: "MM:SS",
  avgValue: "5:30",
  maxValue: "5:30",
};

// Same edge-clipping fix used in ThrottleBrakeChart: within this % of either
// edge the tooltip anchors against the bar instead of centering on it.
const TOOLTIP_EDGE_THRESHOLD = 15;

// Which metric is currently emphasized — toggled by clicking AVG/MAX in the
// header. null = neutral (both bars full strength).
type ActiveMetric = "avg" | "max" | null;

export function SessionGraph({
  leftStat = DEFAULT_LEFT_STAT,
  rightStat = DEFAULT_RIGHT_STAT,
  lapData = DEFAULT_LAP_DATA,
  leftAxisLabels = DEFAULT_LEFT_AXIS,
  rightAxisLabels = DEFAULT_RIGHT_AXIS,
  xAxisStart = "00:00",
  xAxisEnd = "01:12:00",
  defaultActiveLap = null,
}: SessionGraphProps) {
  const [activeMetric, setActiveMetric] = useState<ActiveMetric>(null);

  const total = lapData.length;
  const {
    setHoveredIndex,
    setSelectedIndex,
    activeIndex,
    activePct,
    tooltipAlign,
  } = useChartInteraction({
    total,
    playbackMs: 0,
    playing: false,
    totalMs: 0,
    edgeThreshold: TOOLTIP_EDGE_THRESHOLD,
    allowCenterAlign: true,
    defaultSelectedIndex: defaultActiveLap,
  });

  const activeLap = activeIndex;

  const handleBarClick = (i: number) =>
    setSelectedIndex((prev) => (prev === i ? null : i));

  // Clicking AVG fades the teal (accel) bars; clicking MAX reverses it and
  // fades the dark (decel) bars instead. Clicking the active one again
  // resets to neutral.
  const toggleMetric = (metric: "avg" | "max") =>
    setActiveMetric((prev) => (prev === metric ? null : metric));

  const accelFaded = activeMetric === "avg";
  const decelFaded = activeMetric === "max";

  const tooltipAlignClass =
    tooltipAlign === "left"
      ? styles.tooltipAlignLeft
      : tooltipAlign === "right"
        ? styles.tooltipAlignRight
        : styles.tooltipAlignCenter;

  const renderStatGroup = (
    stat: typeof leftStat,
    extraClass?: string,
  ) => (
    <div className={`${styles.statGroup} ${extraClass ?? ""}`}>
      <div className={styles.statLeft}>
        <span className={styles.statLabel}>{stat.label}</span>
        <span className={styles.statSublabel}>{stat.sublabel}</span>
      </div>
      <div
        className={`${styles.statValue} ${activeMetric === "avg" ? styles.statValueActive : ""}`}
        onClick={() => toggleMetric("avg")}
        role="button"
        tabIndex={0}
      >
        <span className={styles.statNumber}>{stat.avgValue}</span>
        <span className={styles.statSubLabelSmall}>AVG</span>
      </div>
      <div
        className={`${styles.statValue} ${activeMetric === "max" ? styles.statValueActive : ""}`}
        onClick={() => toggleMetric("max")}
        role="button"
        tabIndex={0}
      >
        <span className={styles.statNumber}>{stat.maxValue}</span>
        <span className={styles.statSubLabelSmall}>MAX</span>
      </div>
    </div>
  );

  return (
    <div className={styles.card}>
      {/* ── Dual stat headers ── */}
      <div className={styles.headerRow}>
        {renderStatGroup(leftStat)}
        {renderStatGroup(rightStat, styles.statGroupRight)}
      </div>

      {/* ── Shared timeline chart ── */}
      <div className={styles.chartOuter}>
        <div className={styles.yAxisLeft}>
          {leftAxisLabels.map((l, i) => (
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
          {rightAxisLabels.map((l, i) => (
            <span
              key={i}
              className={styles.yLabelRight}
              style={{ bottom: `${l.percent}%` }}
            >
              {l.text}
            </span>
          ))}
        </div>

        <div className={styles.chartArea}>
          {/* Dashed reference lines, one per right-axis label (MAX / AVG) */}
          {rightAxisLabels.map((l, i) => (
            <div
              key={i}
              className={styles.refLine}
              style={{ bottom: `${l.percent}%` }}
            />
          ))}

          <div className={styles.barsContainer}>
            {lapData.map((lap, i) => {
              const muted = activeLap !== null && activeLap !== i;
              const decel = 100 - lap.accel;

              return (
                <div
                  key={i}
                  className={styles.barCol}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => handleBarClick(i)}
                >
                  {/* Two independent side-by-side bars, both anchored to
                      the bottom — dark (decel) on the left, teal (accel)
                      on the right — matching the reference design. */}
                  <div
                    className={`${styles.decelBar} ${muted ? styles.barMuted : ""} ${decelFaded ? styles.barDeemphasized : ""}`}
                    style={{ height: `${decel}%` }}
                  />
                  <div
                    className={`${styles.accelBar} ${muted ? styles.barMuted : ""} ${accelFaded ? styles.barDeemphasized : ""}`}
                    style={{ height: `${lap.accel}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* Vertical guide line through the active lap */}
          {activePct !== null && (
            <div
              className={styles.lapIndicator}
              style={{ left: `${activePct}%` }}
            />
          )}

          {/* Tooltip */}
          {activeLap !== null && activePct !== null && (
            <div
              className={`${styles.tooltip} ${tooltipAlignClass}`}
              style={{ left: `${activePct}%` }}
            >
              <div className={styles.tooltipTitle}>Lap {activeLap + 1}</div>
              <div className={styles.tooltipRow}>
                <span className={styles.tooltipAccel}>ACCEL</span>
                <span className={styles.tooltipAccel}>
                  {lapData[activeLap].accel}%
                </span>
              </div>
              <div className={styles.tooltipRow}>
                <span className={styles.tooltipDecel}>DECEL</span>
                <span className={styles.tooltipDecel}>
                  {100 - lapData[activeLap].accel}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.xAxis}>
        <span className={styles.xLabel}>{xAxisStart}</span>
        <span className={styles.xLabel}>{xAxisEnd}</span>
      </div>
    </div>
  );
}