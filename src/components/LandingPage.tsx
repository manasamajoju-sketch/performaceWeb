import React, { useState, useRef, useCallback } from 'react'
import Navbar from '../components/Navbar'
import CalendarHeader from '../components/Calender'
import SessionsPanel from '../components/SessionPanel'
import { SessionDetail } from '../components/SessionDetail'
import type { SessionItem, QuinPod } from '../components/SessionPanel/SessionPanel.types'
import styles from './LandingPage.module.scss'

const sessions: SessionItem[] = [
  {
    id: '1',
    trackName: 'Silverstone Circuit',
    date: '23 May 2026 | 10:37 AM',
    device: 'PRO 400',
    trackMapUrl: '/assets/maps/silverstone.svg',
    distanceKm: '12:23',
    duration: '01:02:99',
    minLat: 52.0734, maxLat: 52.0861, minLng: -1.0169, maxLng: -0.9921,
    polyline: [
      { lat: 52.0786, lng: -1.0169 }, { lat: 52.0815, lng: -1.0142 },
      { lat: 52.0843, lng: -1.0088 }, { lat: 52.0861, lng: -1.0021 },
      { lat: 52.0857, lng: -0.9963 }, { lat: 52.0838, lng: -0.9932 },
      { lat: 52.0806, lng: -0.9921 }, { lat: 52.0771, lng: -0.9941 },
      { lat: 52.0748, lng: -0.9982 }, { lat: 52.0734, lng: -1.0044 },
      { lat: 52.0738, lng: -1.0105 }, { lat: 52.0757, lng: -1.0152 },
      { lat: 52.0786, lng: -1.0169 },
    ],
  },
  {
    id: '2',
    trackName: 'Yas Marina - Test 2',
    date: '23 May 2026 | 10:37 AM',
    device: 'PRO 400',
    trackMapUrl: '/assets/maps/yas-marina.svg',
    laps: 22,
    distanceKm: '19:23',
    duration: '01:52:99',
    minLat: 24.4663, maxLat: 24.4727, minLng: 54.6008, maxLng: 54.6083,
    polyline: [
      { lat: 24.4672, lng: 54.6031 }, { lat: 24.4691, lng: 54.6058 },
      { lat: 24.4708, lng: 54.6083 }, { lat: 24.4719, lng: 54.6071 },
      { lat: 24.4727, lng: 54.6048 }, { lat: 24.4718, lng: 54.6022 },
      { lat: 24.4701, lng: 54.6008 }, { lat: 24.4682, lng: 54.6012 },
      { lat: 24.4668, lng: 54.6023 }, { lat: 24.4663, lng: 54.6041 },
      { lat: 24.4672, lng: 54.6031 },
    ],
  },
  {
    id: '3',
    trackName: 'Suzuka - Test 12',
    date: '23 May 2026 | 10:37 AM',
    device: 'PRO 400',
    trackMapUrl: '/assets/maps/suzuka.svg',
    distanceKm: '12:23',
    duration: '01:02:99',
    minLat: 34.8431, maxLat: 34.8496, minLng: 136.5371, maxLng: 136.5444,
    polyline: [
      { lat: 34.8431, lng: 136.5408 }, { lat: 34.8452, lng: 136.5431 },
      { lat: 34.8474, lng: 136.5444 }, { lat: 34.8488, lng: 136.5437 },
      { lat: 34.8496, lng: 136.5418 }, { lat: 34.8491, lng: 136.5397 },
      { lat: 34.8479, lng: 136.5381 }, { lat: 34.8468, lng: 136.5371 },
      { lat: 34.8457, lng: 136.5379 }, { lat: 34.8448, lng: 136.5395 },
      { lat: 34.8441, lng: 136.5412 }, { lat: 34.8455, lng: 136.5422 },
      { lat: 34.8462, lng: 136.5410 }, { lat: 34.8458, lng: 136.5395 },
      { lat: 34.8444, lng: 136.5388 }, { lat: 34.8431, lng: 136.5408 },
    ],
  },
  {
    id: '4',
    trackName: 'Silverstone Circuit',
    date: '23 May 2026 | 10:37 AM',
    device: 'PRO 400',
    trackMapUrl: '/assets/maps/silverstone.svg',
    laps: 22,
    distanceKm: '19:23',
    duration: '01:52:99',
    minLat: 52.0734, maxLat: 52.0861, minLng: -1.0169, maxLng: -0.9921,
    polyline: [
      { lat: 52.0786, lng: -1.0169 }, { lat: 52.0815, lng: -1.0142 },
      { lat: 52.0843, lng: -1.0088 }, { lat: 52.0861, lng: -1.0021 },
      { lat: 52.0857, lng: -0.9963 }, { lat: 52.0838, lng: -0.9932 },
      { lat: 52.0806, lng: -0.9921 }, { lat: 52.0771, lng: -0.9941 },
      { lat: 52.0748, lng: -0.9982 }, { lat: 52.0734, lng: -1.0044 },
      { lat: 52.0738, lng: -1.0105 }, { lat: 52.0757, lng: -1.0152 },
      { lat: 52.0786, lng: -1.0169 },
    ],
  },
]

const pods: QuinPod[] = [
  { id: 'pod-1', name: 'PRO+ 400X', lastConnected: '3 hours ago', imageUrl: '/assets/pod.png' },
  { id: 'pod-2', name: 'PRO+ 400X', lastConnected: '3 hours ago', imageUrl: '/assets/pod.png' },
]

const NAVBAR_H        = 94
const CAL_EXPANDED_H  = 292
const CAL_COLLAPSED_H = 60

export default function LandingPage() {
  const [collapsed, setCollapsed]           = useState(false)
  const [selectedSession, setSelectedSession] = useState<SessionItem | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCollapsed(el.scrollTop > 0)
  }, [])

  const headerHeight = NAVBAR_H + (collapsed ? CAL_COLLAPSED_H : CAL_EXPANDED_H)

  // ── Session detail view ───────────────────────────────────────────────────
  if (selectedSession) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar userInitials="PG" />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <SessionDetail
            session={{
              id:               selectedSession.id,
              trackName:        selectedSession.trackName,
              subtitle:         `Circuit | ${selectedSession.date}`,
              date:             selectedSession.date,
              device:           selectedSession.device,
              totalTime:        selectedSession.duration,
              totalDistanceKm:  parseFloat(selectedSession.distanceKm ?? '0'),
              maxSpeedKmh:      120,
              elevationM:       12.58,
              laps:             selectedSession.laps ?? 32,
              polyline:         selectedSession.polyline,
              minLat:           selectedSession.minLat,
              maxLat:           selectedSession.maxLat,
              minLng:           selectedSession.minLng,
              maxLng:           selectedSession.maxLng,
              throttlePercent:  60,
              brakePercent:     60,
              throttleSpikes:   40,
              brakeSpikes:      30,
              lapCount:         3,
              pitLap:           3,
              hotLap:           19,
              avgSpeedKmh:      55,
              maxSpeedChart:    120,
            }}
            onBack={() => setSelectedSession(null)}
          />
        </div>
      </div>
    )
  }

  // ── Session list view (default) ───────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.fixedHeader}>
        <Navbar userInitials="PG" />
        <CalendarHeader
          sessionDays={[]}
          summary={{ sessions: 12, duration: '21:21:21', distance: 25.21 }}
          collapsed={collapsed}
          onDateClick={(date, year, month) =>
            console.log('Date clicked:', date, year, month)
          }
        />
      </div>

      <div
        ref={scrollRef}
        className={styles.scrollContent}
        style={{
          top:    headerHeight,
          height: `calc(100vh - ${headerHeight}px)`,
        }}
        onScroll={handleScroll}
      >
        <SessionsPanel
          sessions={sessions}
          pods={pods}
          onSessionClick={setSelectedSession}
          onSearch={(q) => console.log('Search:', q)}
        />
      </div>
    </div>
  )
}