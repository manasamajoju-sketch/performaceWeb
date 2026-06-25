export interface SessionDetailProps {
  session: {
    // ─── Identity ───────────────────────────────────────────────────────────
    id: string
    trackName: string
    subtitle?: string           // "Circuit | 05 June 2026"
    date: string
    device: string

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