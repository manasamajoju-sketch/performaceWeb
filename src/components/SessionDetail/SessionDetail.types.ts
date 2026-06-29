import type { LeanAngleDataPoint } from '../LeanAngle/LeanAngleChart.types'
import type { SensorData } from '../SensorPanel'


export interface SessionDetailProps {
  session: {
    // ─── Identity ───────────────────────────────────────────────────────────
    id: string
    trackName: string
    subtitle?: string           // "Circuit | 05 June 2026"
    date: string
    device: string
sensorData?: SensorData
    // ─── Stats ──────────────────────────────────────────────────────────────
    totalTime?: string          // "01:30:00"
    totalDistanceKm?: number    // 12.58
    maxSpeedKmh?: number        // 120
    elevationM?: number         // 12.58
    laps?: number

    // ─── Map / route ────────────────────────────────────────────────────────
    // ActivityMap uses StreamLocationPoint[] (lat, lng, speedMps, timestamp)
    locations?: StreamLocationPoint[]
    // Fallback simple polyline (converted to locations internally)
    polyline?: { lat: number; lng: number }[]
    minLat?: number
    maxLat?: number
    minLng?: number
    maxLng?: number

    // ─── ThrottleBrakeChart ──────────────────────────────────────────────────
    throttlePercent?: number    // 60
    brakePercent?: number       // 60
    lapData?: { brake: number; throttle: number }[]

    // ─── SpikesChart ─────────────────────────────────────────────────────────
    throttleSpikes?: string | number  // "5:30"
    brakeSpikes?: string | number     // "5:30"
    throttleAvg?: number              // 4
    brakeAvg?: number                 // 5
    throttleMax?: number              // 60
    brakeMax?: number                 // 40
    spikeLapData?: { throttleAvg: number; brakeAvg: number }[]

    // ─── Lap analysis ────────────────────────────────────────────────────────
    lapCount?: number           // 03
    pitLap?: number             // 03
    hotLap?: number             // 19
    lapDots?: LapDot[]

    // ─── Speed ───────────────────────────────────────────────────────────────
    avgSpeedKmh?: number        // 55
    maxSpeedChart?: number      // 120

    // ─── Session graph (LapAnalysis) ─────────────────────────────────────────
    lapTimeAvg?: string         // "5:30"
    lapTimeMax?: string         // "5:30"
    paceAvg?: string            // "5:30"
    paceMax?: string            // "5:30"

    // ─── LeanAngleChart ──────────────────────────────────────────────────────
    /** 61-point array of left/right lean percentages with timestamps */
    leanAngleData?: LeanAngleDataPoint[]
    /** Peak left lean shown in chart header (degrees) */
    leanLeftDeg?: number        // 36
    /** Peak right lean shown in chart header (degrees) */
    leanRightDeg?: number       // 36
    /** Max degree label on right Y-axis */
    leanMaxDeg?: number         // 36
    /** Avg degree label at centre line on right Y-axis */
    leanAvgDeg?: number         // 26
  }
  onBack?: () => void
}

export interface LapDot {
  lap: number
  type: 'normal' | 'pit' | 'hot' | 'outlap'
  speedKmh?: number
}

// Matches ActivityMap's expected location shape
export interface StreamLocationPoint {
  lat: number
  lng: number
  speedMps?: number
  timestamp?: number
}