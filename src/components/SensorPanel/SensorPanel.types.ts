export interface OrientationFrame {
  yaw: number    // degrees -180 to 180
  pitch: number  // degrees -90 to 90
  roll: number   // degrees -180 to 180
  timestamp: number // ms
}

export interface AccelFrame {
  x: number      // m/s²
  y: number
  z: number
  timestamp: number
}

export interface SensorData {
  orientation: OrientationFrame[]
  accel: AccelFrame[]
  /** Session-wide orientation aggregate for the summary row */
  orientationAvg?: number
  orientationMax?: number
}

export interface SensorPanelProps {
  data?: SensorData
  playbackMs: number
  playing: boolean
  totalMs: number
}