export interface StreamLocationPoint {
  lat: number
  lng: number
  speedMps?: number
  timestamp?: number
}

export interface ActivityMapProps {
  locations: StreamLocationPoint[]
  playbackMs: number
  ready: boolean
  playing: boolean
  onTogglePlay: () => void
}