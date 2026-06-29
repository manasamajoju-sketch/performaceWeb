import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./SessionDetail.module.scss";
import { ThrottleBrakeChart } from "../ThrottleBrakeChart";
import { SpeedChart } from "../SpeedChart";
import { LapTime } from "../LapTimeChart";
import { SpikesChart } from "../SpikesChart";
import { SessionGraph } from "../LapAnalysis";
import ActivityMap from "../ActivityMap";
import type {
  SessionDetailProps,
  LapDot,
  StreamLocationPoint,
} from "./SessionDetail.types";
import LeanAngleChart from "../LeanAngle";
import { SensorPanel } from "../SensorPanel";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert simple polyline to StreamLocationPoint[] with simulated speed */
function polylineToLocations(
  polyline?: { lat: number; lng: number }[],
): StreamLocationPoint[] {
  if (!polyline || polyline.length === 0) return [];
  return polyline.map((p, i) => ({
    lat: p.lat,
    lng: p.lng,
    speedMps: 10 + Math.sin(i * 0.4) * 8, // simulated — replace with real data
    timestamp: i * 1000,
  }));
}

function generateLapDots(
  count: number,
  pitLap?: number,
  hotLap?: number,
): LapDot[] {
  return Array.from({ length: count }, (_, i) => {
    const lap = i + 1;
    if (lap === pitLap) return { lap, type: "pit" as const };
    if (lap === hotLap) return { lap, type: "hot" as const };
    if (lap === 1) return { lap, type: "outlap" as const };
    return { lap, type: "normal" as const };
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
type TabView = "overview" | "lapview";

export function SessionDetail({ session, onBack }: SessionDetailProps) {
  const [tab, setTab] = useState<TabView>("overview");
  const [activeLap, setActiveLap] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [playbackMs, setPlaybackMs] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const [sensorOpen, setSensorOpen] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Resolve locations — prefer explicit, fall back to polyline conversion
  const locations: StreamLocationPoint[] =
    session.locations ?? polylineToLocations(session.polyline);

  // Total duration (each point = 1 s gap when simulated)
  const totalMs = locations.length > 0 ? (locations.length - 1) * 1000 : 0;

  // Mark map ready after Leaflet has time to mount
  useEffect(() => {
    const t = setTimeout(() => setMapReady(true), 200);
    return () => clearTimeout(t);
  }, []);

  // Playback ticker
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setPlaybackMs((prev) => {
          if (prev >= totalMs) {
            setPlaying(false);
            return 0;
          }
          return prev + 100;
        });
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, totalMs]);

  const handleTogglePlay = useCallback(() => setPlaying((p) => !p), []);

  const lapDots =
    session.lapDots ??
    generateLapDots(
      session.laps ?? 32,
      session.pitLap ?? 3,
      session.hotLap ?? 19,
    );

  return (
    <div className={styles.page}>
      {/* ══════════════════════════════════════════════════════════
          LEFT PANEL — map + playback + stats
      ══════════════════════════════════════════════════════════ */}
      <div className={styles.left}>
        {/* Session header */}
        <div className={styles.sessionHeader}>
          <div className={styles.sessionTitleGroup}>
            <h2 className={styles.sessionTitle} onClick={onBack}>
              {session.trackName}
            </h2>
            <span className={styles.sessionSubtitle}>
              {session.subtitle ?? `${session.device} | ${session.date}`}
            </span>
          </div>
          <button className={styles.menuBtn} aria-label="More options">
            ⋮
          </button>
        </div>

        {/* ── ActivityMap ─────────────────────────────────────────────────── */}
        <div className={styles.mapWrap}>
          <ActivityMap
            locations={locations}
            playbackMs={playbackMs}
            ready={mapReady}
            playing={playing}
            onTogglePlay={handleTogglePlay}
          />

          <div className={styles.playback}>
            <div className={styles.playbackControls}>
              <button
                className={styles.playBtn}
                onClick={handleTogglePlay}
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="currentColor"
                  >
                    <rect x="2" y="1" width="4" height="12" rx="1" />
                    <rect x="8" y="1" width="4" height="12" rx="1" />
                  </svg>
                ) : (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="currentColor"
                  >
                    <path d="M3 1.5l10 5.5-10 5.5V1.5z" />
                  </svg>
                )}
              </button>

              <button
                className={styles.playBtn}
                aria-label="Restart"
                onClick={() => {
                  setPlaying(false);
                  setPlaybackMs(0);
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 4v6h6" />
                  <path d="M3.51 15a9 9 0 1 0 .49-5H1" />
                </svg>
              </button>

              <button className={styles.speedBtn}>1x</button>
            </div>

            <span className={styles.playbackTime}>
              {String(Math.floor(playbackMs / 60000)).padStart(2, "0")}:
              {String(Math.floor((playbackMs % 60000) / 1000)).padStart(2, "0")} /{" "}
              {session.totalTime ?? "01:12:00"}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsList}>
          {[
            {
              label: "Total Time",
              unit: "HH:MM:SS",
              value: session.totalTime ?? "01:30:00",
            },
            {
              label: "Total Distance",
              unit: "KM",
              value: session.totalDistanceKm ?? "12.58",
            },
            {
              label: "MAX SPEED",
              unit: "KM/H",
              value: session.maxSpeedKmh ?? 120,
            },
            {
              label: "Elevation",
              unit: "KM",
              value: session.elevationM ?? "12.58",
            },
          ].map(({ label, unit, value }) => (
            <div key={label} className={styles.statRow}>
              <div className={styles.statLabelGroup}>
                <span className={styles.statLabel}>{label}</span>
                <span className={styles.statUnit}>{unit}</span>
              </div>
              <span className={styles.statValue}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          RIGHT PANEL — tabs + charts
      ══════════════════════════════════════════════════════════ */}
      <div className={styles.right}>
        {/* Tab bar */}
        <div className={styles.tabBar}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${tab === "overview" ? styles.tabActive : ""}`}
              onClick={() => setTab("overview")}
            >
              Overview
            </button>
            <button
              className={`${styles.tab} ${tab === "lapview" ? styles.tabActive : ""}`}
              onClick={() => setTab("lapview")}
            >
              Lap view
            </button>
          </div>
          <button
            className={`${styles.sensorBtn} ${sensorOpen ? styles.sensorBtnActive : ""}`}
            onClick={() => setSensorOpen((o) => !o)}
          >
            {sensorOpen ? "Analytics" : "Sensor"}
          </button>
        </div>

        <div className={styles.sections}>
          {sensorOpen ? (
            <SensorPanel
              data={session.sensorData}
              playbackMs={playbackMs}
              playing={playing}
              totalMs={totalMs}
            />
          ) : (
            <>
              {/* ── ThrottleBrakeChart ────────────────────────────────────────── */}
              <div className={styles.section}>
                <ThrottleBrakeChart
                  lapData={session.lapData}
                  throttlePercent={session.throttlePercent ?? 60}
                  brakePercent={session.brakePercent ?? 60}
                />
              </div>

              <div className={styles.sectionDividerHorizontal} />

              {/* ── SpikesChart ───────────────────────────────────────────────── */}
              <div className={styles.section}>
                <SpikesChart
                  lapData={session.lapData}
                  throttleMax={100}
                  brakeMax={100}
                  throttleSpikes={session.throttleSpikes ?? "5:30"}
                  brakeSpikes={session.brakeSpikes ?? "5:30"}
                />
              </div>

              <div className={styles.sectionDividerHorizontal} />

              {/* ── Lap Analysis (timeline) ───────────────────────────────────── */}
              <div className={styles.section}>
                <LapTime
                  label="Lap Time"
                  sublabel="MM:SS"
                  avgValue={session.lapTimeAvg ?? "5:30"}
                  maxValue={session.lapTimeMax ?? "9:30"}
                  data={session.lapData?.map((lap) => ({
                    value: Math.round((lap.brake + lap.throttle) / 2),
                  }))}
                />
              </div>

              <div className={styles.sectionDividerHorizontal} />

              {/* ── Speed ────────────────────────────────────────────────────── */}
              <div className={styles.section}>
                <SpeedChart
                  avgSpeed={session.avgSpeedKmh ?? 55}
                  maxSpeed={session.maxSpeedChart ?? 120}
                />
              </div>

              <div className={styles.sectionDividerHorizontal} />

              {/* ── Session Graph (LapAnalysis) ───────────────────────────────── */}
              {/* <div className={styles.section}>
                <SessionGraph
                  leftStat={{
                    label: "Lap Time",
                    sublabel: "BRAKING",
                    avgValue: session.lapTimeAvg ?? "5:30",
                    maxValue: session.lapTimeMax ?? "5:30",
                  }}
                  rightStat={{
                    label: "Pace",
                    sublabel: "MM:SS",
                    avgValue: session.paceAvg ?? "5:30",
                    maxValue: session.paceMax ?? "5:30",
                  }}
                  xAxisStart="00:00"
                  xAxisEnd={session.totalTime ?? "01:12:00"}
                />
              </div>
              <div className={styles.sectionDividerHorizontal} /> */}
              <div className={styles.section}>
                <LeanAngleChart
                  leftDegree={session.leanLeftDeg ?? 36}
                  rightDegree={session.leanRightDeg ?? 36}
                  maxDegree={session.leanMaxDeg ?? 36}
                  avgDegree={session.leanAvgDeg ?? 26}
                  data={session.leanAngleData}
                  playbackMs={playbackMs}
                  playing={playing}
                  totalMs={totalMs}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
