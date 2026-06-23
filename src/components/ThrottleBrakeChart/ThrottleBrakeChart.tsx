import { useState } from "react";
import styles from "./ThrottleBrakeChart.module.scss";
import { SpikesChart } from "../SpikesChart";
import type {
  ThrottleBrakeChartProps,
  LapData,
} from "./ThrottleBrakeChart.types";

const DEFAULT_LAP_DATA: LapData[] = [
  { brake: 20 },
  { brake: 35 },
  { brake: 15 },
  { brake: 42 },
  { brake: 28 },
  { brake: 18 },
  { brake: 45 },
  { brake: 30 },
  { brake: 22 },
  { brake: 38 },
  { brake: 12 },
  { brake: 48 },
  { brake: 25 },
  { brake: 40 },
  { brake: 32 },
  { brake: 20 },
  { brake: 44 },
  { brake: 28 },
  { brake: 16 },
  { brake: 36 },
  { brake: 50 },
  { brake: 24 },
  { brake: 38 },
  { brake: 14 },
  { brake: 42 },
  { brake: 30 },
  { brake: 22 },
  { brake: 46 },
  { brake: 18 },
  { brake: 34 },
  { brake: 26 },
  { brake: 40 },
].map((d) => ({ brake: d.brake, throttle: 100 - d.brake }));
// Vertical gap, in px, carved out between the avg (bottom) and max (top) bar segments.
const BAR_SEGMENT_GAP = 4;

type View = "bars" | "spikes";

// % of the chart width, measured from either edge, inside which the tooltip
// flips from centered-on-bar to anchored-on-bar so it never clips outside
// the chart. Tune to taste against the tooltip's actual rendered width.
const TOOLTIP_EDGE_THRESHOLD = 15;

type TooltipAlign = "left" | "right";

interface StatRowProps {
  label: string;
  sublabel: string;
  percent: number;
  spikes: number;
  activeView: View;
  onPercentClick: () => void;
  onSpikesClick: () => void;
}

function StatRow({
  label,
  sublabel,
  percent,
  spikes,
  activeView,
  onPercentClick,
  onSpikesClick,
}: StatRowProps) {
  return (
    <div className={styles.statRow}>
      <div className={styles.statLeft}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statSublabel}>{sublabel}</span>
      </div>

      <button
        type="button"
        className={`${styles.statCenter} ${activeView === "bars" ? styles.statCenterActive : ""}`}
        onClick={onPercentClick}
      >
        <span
          className={`${styles.statPercent} ${activeView === "bars" ? styles.statPercentActive : ""}`}
        >
          {percent}%
        </span>
        <span
          className={`${styles.statSublabelSmall} ${activeView === "bars" ? styles.statSublabelSmallActive : ""}`}
        >
          PERCENT
        </span>
      </button>

      <button
        type="button"
        className={`${styles.statRight} ${activeView === "spikes" ? styles.statRightActive : ""}`}
        onClick={onSpikesClick}
      >
        <span
          className={`${styles.statSpikes} ${activeView === "spikes" ? styles.statSpikesActive : ""}`}
        >
          {spikes}
        </span>
        <span
          className={`${styles.statSublabelSmall} ${activeView === "spikes" ? styles.statSublabelSmallActive : ""}`}
        >
          SPIKES
        </span>
      </button>
    </div>
  );
}

export function ThrottleBrakeChart({
  lapData = DEFAULT_LAP_DATA,
  throttlePercent = 60,
  brakePercent = 40,
  throttleSpikes = 40,
  brakeSpikes = 30,
}: ThrottleBrakeChartProps) {
  const [hoveredLap, setHoveredLap] = useState<number | null>(null);
  const [selectedLap, setSelectedLap] = useState<number | null>(null);
  const [view, setView] = useState<View>("bars");

  const total = lapData.length;
  const activeLap = hoveredLap ?? selectedLap;

  const handleBarClick = (i: number) =>
    setSelectedLap((prev) => (prev === i ? null : i));

  // Both bars from bottom. Throttle = 100 - brake so they always sum to 100%
  // Throttle avg line is average of all throttle values
  const avgThrottle = Math.round(
    lapData.reduce((s, l) => s + l.throttle, 0) / lapData.length,
  );
  const avgBrake = Math.round(
    lapData.reduce((s, l) => s + l.brake, 0) / lapData.length,
  );

  const yLabels = [
    { text: "100", bottom: 100, avg: false },
    { text: "AVG", bottom: avgThrottle, avg: true },
    { text: "60", bottom: 60, avg: false },
    { text: "40", bottom: 40, avg: false },
    { text: "AVG", bottom: avgBrake, avg: true },
    { text: "20", bottom: 20, avg: false },
    { text: "0", bottom: 0, avg: false },
  ];

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
        : styles.tooltipAlignRight; // default to right if somehow undefined

  return (
    <div className={styles.card}>
      {/* ── Acceleration ── */}
      <StatRow
        label="Acceleration"
        sublabel="THROTTLING"
        percent={throttlePercent}
        spikes={throttleSpikes}
        activeView={view}
        onPercentClick={() => setView("bars")}
        onSpikesClick={() => setView("spikes")}
      />

      <div className={styles.divider} />

      {view === "spikes" ? (
        <SpikesChart
          lapData={lapData.map((l) => ({
            throttleAvg: l.throttle,
            brakeAvg: l.brake,
          }))}
          throttleAvg={avgThrottle}
          brakeAvg={avgBrake}
          throttleMax={100}
          brakeMax={100}
        />
      ) : (
        <div className={styles.chartWrapper}>
          <div className={styles.chartOuter}>
            <div className={styles.yAxis}>
              {yLabels.map((l, i) => (
                <span
                  key={i}
                  className={`${styles.yLabel} ${l.avg ? styles.yLabelAvg : ""}`}
                  style={{ bottom: `${l.bottom}%` }}
                >
                  {l.text}
                </span>
              ))}
            </div>

            <div className={styles.chartArea}>
              <div
                className={styles.avgLine}
                style={{ bottom: `${avgThrottle}%` }}
              >
                <span className={styles.avgLineLabel}>{avgThrottle}%</span>
              </div>

              {/* Brake avg line */}
              <div
                className={styles.avgLine}
                style={{ bottom: `${avgBrake}%` }}
              >
                <span className={styles.avgLineLabel}>{avgBrake}%</span>
              </div>

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
                          {/* Dark brake bar — bottom segment, 0% to brake% */}
                          <div
                            className={styles.darkBar}
                            style={{ height: `${lap.brake}%` }}
                          />
                          {/* Teal throttle bar — top segment, stacked on top
                              of the brake bar (brake% to 100%) so the pair
                              always fills the full 0–100% column, since
                              throttle = 100 - brake by definition. */}
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
                    Acce: {lapData[activeLap].throttle}%
                  </div>
                  <div className={styles.tooltipMuted}>
                    Decel: {lapData[activeLap].brake}%
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.xAxis}>
            <span className={styles.xLabel}>Lap 1</span>
            <span className={styles.xLabel}>Lap {total}</span>
          </div>
        </div>
      )}

      <div className={styles.divider} />

      <StatRow
        label="Deceleration"
        sublabel="BRAKING"
        percent={brakePercent}
        spikes={brakeSpikes}
        activeView={view}
        onPercentClick={() => setView("bars")}
        onSpikesClick={() => setView("spikes")}
      />
    </div>
  );
}