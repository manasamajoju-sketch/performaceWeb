import { useState } from 'react'
import styles from './SessionDetail.module.scss'
import { ThrottleBrakeChart } from '../ThrottleBrakeChart'
import { SpeedChart } from '../SpeedChart'
import { LapTimeline } from '../LapTimeChart'
import RouteMap from '../RouteMap'
import type { SessionDetailProps, LapDot } from './SessionDetail.types'

// Generate default lap dots if none provided
function generateLapDots(count: number, pitLap?: number, hotLap?: number): LapDot[] {
  return Array.from({ length: count }, (_, i) => {
    const lap = i + 1
    if (lap === pitLap) return { lap, type: 'pit' }
    if (lap === hotLap) return { lap, type: 'hot' }
    if (lap === 1)      return { lap, type: 'outlap' }
    return { lap, type: 'normal' }
  })
}

type TabView = 'overview' | 'lapview'

export function SessionDetail({ session, onBack }: SessionDetailProps) {
  const [tab, setTab]         = useState<TabView>('overview')
  const [activeLap, setActiveLap] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)

  const lapDots = session.lapDots ??
    generateLapDots(session.laps ?? 32, session.pitLap ?? 3, session.hotLap ?? 19)

  return (
    <div className={styles.page}>

      {/* ══════════════════════════════════════════════════════════
          LEFT PANEL — map + playback + stats
      ══════════════════════════════════════════════════════════ */}
      <div className={styles.left}>

        {/* Session header */}
        <div className={styles.sessionHeader}>
          <div className={styles.sessionTitleGroup}>
            <h2
              className={styles.sessionTitle}
              onClick={onBack}
              style={{ cursor: 'pointer' }}
            >
              {session.trackName}
            </h2>
            <span className={styles.sessionSubtitle}>
              {session.subtitle ?? `${session.device} | ${session.date}`}
            </span>
          </div>
          <button className={styles.menuBtn} aria-label="More options">⋮</button>
        </div>

        {/* Track map */}
        <div className={styles.mapWrap}>
          <RouteMap
            points={session.polyline ?? []}
            minLat={session.minLat ?? 0}
            maxLat={session.maxLat ?? 0}
            minLng={session.minLng ?? 0}
            maxLng={session.maxLng ?? 0}
            width={400}
            height={300}
          />
        </div>

        {/* Playback controls */}
        <div className={styles.playback}>
          <div className={styles.playbackControls}>
            <button
              className={styles.playBtn}
              onClick={() => setPlaying(p => !p)}
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? (
                // Pause icon
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <rect x="2" y="1" width="4" height="12" rx="1"/>
                  <rect x="8" y="1" width="4" height="12" rx="1"/>
                </svg>
              ) : (
                // Play icon
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <path d="M3 1.5l10 5.5-10 5.5V1.5z"/>
                </svg>
              )}
            </button>

            {/* Replay */}
            <button className={styles.playBtn} aria-label="Replay">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 .49-5H1"/>
              </svg>
            </button>

            <button className={styles.speedBtn}>1x</button>
          </div>

          <span className={styles.playbackTime}>00:29:00 / 01:12:00</span>
        </div>

        {/* Stats */}
        <div className={styles.statsList}>
          {[
            { label: 'Total Time',      unit: 'HH:MM:SS', value: session.totalTime     ?? '01:30:00' },
            { label: 'Total Distance',  unit: 'KM',       value: session.totalDistanceKm ?? '12.58'  },
            { label: 'MAX SPEED',       unit: 'KM/H',     value: session.maxSpeedKmh  ?? 120         },
            { label: 'Elevation',       unit: 'KM',       value: session.elevationM   ?? '12.58'     },
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
              className={`${styles.tab} ${tab === 'overview' ? styles.tabActive : ''}`}
              onClick={() => setTab('overview')}
            >
              Overview
            </button>
            <button
              className={`${styles.tab} ${tab === 'lapview' ? styles.tabActive : ''}`}
              onClick={() => setTab('lapview')}
            >
              Lap view
            </button>
          </div>
          <button className={styles.sensorBtn}>Sensor</button>
        </div>

        <div className={styles.sections}>

          {/* ── Acceleration / Deceleration ─────────────────────────────────── */}
          <div className={styles.section}>
            <ThrottleBrakeChart
              throttlePercent={session.throttlePercent ?? 60}
              brakePercent={session.brakePercent ?? 60}
              throttleSpikes={session.throttleSpikes ?? 40}
              brakeSpikes={session.brakeSpikes ?? 30}
            />
          </div>
          <div className={styles.sectionDividerHorizontal} />

          {/* ── Lap Analysis ─────────────────────────────────────────────────── */}
          <div className={styles.section}>
            <LapTimeline
              dots={lapDots}
              activeLap={activeLap}
              onLapClick={setActiveLap}
            />
          </div>
          <div className={styles.sectionDividerHorizontal} />

          {/* ── Speed ────────────────────────────────────────────────────────── */}
          <div className={styles.section}>
            <SpeedChart
              avgSpeed={session.avgSpeedKmh ?? 55}
              maxSpeed={session.maxSpeedChart ?? 120}
            />
          </div>

        </div>
      </div>
    </div>
  )
}