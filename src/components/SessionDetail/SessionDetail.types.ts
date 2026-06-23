export interface SessionDetailProps {
  session: {
    id: string
    trackName: string
    subtitle?: string         // e.g. "Circuit | 05 June 2026"
    date: string
    device: string
    totalTime?: string        // "01:30:00"
    totalDistanceKm?: number  // 12.58
    maxSpeedKmh?: number      // 120
    elevationM?: number       // 12.58
    laps?: number
    polyline?: { lat: number; lng: number }[]
    minLat?: number; maxLat?: number
    minLng?: number; maxLng?: number
    // Acceleration / braking data
    throttlePercent?: number  // 60
    brakePercent?: number     // 60
    throttleSpikes?: number   // 5:30
    brakeSpikes?: number      // 5:30
    // Lap analysis
    lapCount?: number         // 03
    pitLap?: number           // 03
    hotLap?: number           // 19
    lapDots?: LapDot[]
    // Speed
    avgSpeedKmh?: number      // 55
    maxSpeedChart?: number    // 120
  }
  onBack?: () => void
}

export interface LapDot {
  lap: number
  type: 'normal' | 'pit' | 'hot' | 'outlap'
  speedKmh?: number
}