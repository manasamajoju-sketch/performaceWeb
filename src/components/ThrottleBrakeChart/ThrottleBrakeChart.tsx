import { useState } from "react";
import styles from "./ThrottleBrakeChart.module.scss";
import type {
  ThrottleBrakeChartProps,
  LapData,
} from "./ThrottleBrakeChart.types";

const DEFAULT_LAP_DATA: LapData[] = [
  { brake: 20 }, { brake: 35 }, { brake: 15 }, { brake: 42 },
  { brake: 28 }, { brake: 18 }, { brake: 45 }, { brake: 30 },
  { brake: 22 }, { brake: 38 }, { brake: 12 }, { brake: 48 },
  { brake: 25 }, { brake: 40 }, { brake: 32 }, { brake: 20 },
  { brake: 44 }, { brake: 28 }, { brake: 16 }, { brake: 36 },
  { brake: 50 }, { brake: 24 }, { brake: 38 }, { brake: 14 },
  { brake: 42 }, { brake: 30 }, { brake: 22 }, { brake: 46 },
  { brake: 18 }, { brake: 34 }, { brake: 26 }, { brake: 40 },
].map((d) => ({ brake: d.brake, throttle: 100 - d.brake }));

// Vertical gap, in px, carved out between the avg (bottom) and max (top) bar segments.
const BAR_SEGMENT_GAP = 4;

const TOOLTIP_EDGE_THRESHOLD = 15;

type TooltipAlign = "left" | "right";

interface StatPanelProps {
  label: string;
  sublabel: string;
  percent: number;
}

// Static stat display — no toggle now that Spikes lives in its own chart/card.
function StatPanel({ label, sublabel, percent }: StatPanelProps) {
  return (
    <div className={styles.statPanel}>
      <div className={styles.statLabelGroup}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statSublabel}>{sublabel}</span>
      </div>

      <div className={`${styles.statMetric} ${styles.statMetricActive}`}>
        <span className={`${styles.statValue} ${styles.statValueActive}`}>
          {percent}%
        </span>
        <span className={`${styles.statMetricLabel} ${styles.statMetricLabelActive}`}>
          PERCENT
        </span>
      </div>
    </div>
  );
}

export function ThrottleBrakeChart({
  lapData = DEFAULT_LAP_DATA,
  throttlePercent = 60,
  brakePercent = 60,
}: ThrottleBrakeChartProps) {
  const [hoveredLap, setHoveredLap] = useState<number | null>(null);
  const [selectedLap, setSelectedLap] = useState<number | null>(null);

  const total = lapData.length;
  const activeLap = hoveredLap ?? selectedLap;

  const handleBarClick = (i: number) =>
    setSelectedLap((prev) => (prev === i ? null : i));

  const avgThrottle = Math.round(
    lapData.reduce((s, l) => s + l.throttle, 0) / lapData.length,
  );
  const avgBrake = Math.round(
    lapData.reduce((s, l) => s + l.brake, 0) / lapData.length,
  );

  const yLabels = [
    { text: "100", bottom: 100, avg: false },
    { text: "80", bottom: 80, avg: false },
    { text: "AVG", bottom: avgThrottle, avg: true },
    { text: "60", bottom: 60, avg: false },
    { text: "40", bottom: 40, avg: false },
    { text: "AVG", bottom: avgBrake, avg: true },
    { text: "20", bottom: 20, avg: false },
    { text: "0", bottom: 0, avg: false },
  ];

  const xAxisLabels = Array.from({ length: 11 }, (_, index) => {
    const lap = Math.max(1, Math.round(((index / 10) * (total - 1)) + 1));
    return { key: `x-label-${index}`, label: `Lap ${lap}` };
  });

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
    <div className={styles.card}>
      {/* ── Top stat row: Acceleration left, Deceleration right ── */}
      <div className={styles.statRow}>
        <StatPanel
          label="Acceleration"
          sublabel="THROTTLING"
          percent={throttlePercent}
        />
        <StatPanel
          label="Deceleration"
          sublabel="BRAKING"
          percent={brakePercent}
        />
      </div>

      {/* ── Chart fills remaining height ── */}
      <div className={styles.chartSection}>
        <div className={styles.chartWrapper}>
          <div className={styles.chartOuter}>
            {/* Left y-axis */}
            <div className={styles.yAxisLeft}>
              {yLabels.map((l, i) => (
                <span
                  key={`left-${i}`}
                  className={styles.yLabel}
                  style={{ bottom: `${l.bottom}%` }}
                >
                  {l.text}
                </span>
              ))}
            </div>

            <div className={styles.chartArea}>
              <div className={styles.gridOverlay} />
              {/* Avg lines */}
              <div className={styles.avgLine} style={{ bottom: `${avgThrottle}%` }} />
              <div className={styles.avgLine} style={{ bottom: `${avgBrake}%` }} />

              <div className={styles.barsScroll}>
                <div className={styles.barsContainer}>
                  {lapData.map((lap, i) => {
                    const faded = activeLap !== null && activeLap !== i;
                    const active = activeLap === i;
                    return (
                      <div
                        key={i}
                        className={`${styles.barGroup} ${faded ? styles.barGroupFaded : ""} ${active ? styles.barGroupActive : ""}`}
                        onMouseEnter={() => setHoveredLap(i)}
                        onMouseLeave={() => setHoveredLap(null)}
                        onClick={() => handleBarClick(i)}
                      >
                        <div className={styles.barWrapper}>
                          <div
                            className={styles.darkBar}
                            style={{ height: `${lap.brake}%` }}
                          />
                          <div
                            className={styles.tealBar}
                            style={{
                              bottom: `calc(${lap.brake}% + ${BAR_SEGMENT_GAP}px)`,
                              height: `calc(${lap.throttle}% - ${BAR_SEGMENT_GAP}px)`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {activeLap !== null && activeLapPct !== null && (
                <div
                  className={`${styles.tooltip} ${tooltipAlignClass}`}
                  style={{ left: `${activeLapPct}%` }}
                >
                  <div className={styles.tooltipTitle}>Lap {activeLap + 1}</div>
                  <div className={styles.tooltipTeal}>
                    ACCEL: {lapData[activeLap].throttle}%
                  </div>
                  <div className={styles.tooltipMuted}>
                    DECEL: {lapData[activeLap].brake}%
                  </div>
                </div>
              )}
            </div>

            {/* Right y-axis */}
            <div className={styles.yAxisRight}>
              {yLabels.map((l, i) => (
                <span
                  key={`right-${i}`}
                  className={styles.yLabel}
                  style={{ bottom: `${l.bottom}%` }}
                >
                  {l.text}
                </span>
              ))}
            </div>
          </div>

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
  );
}