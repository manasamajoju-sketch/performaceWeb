export interface LapData {
  /** Brake percentage 0–100. Throttle is auto-calculated as 100 - brake */
  brake: number
  /** Throttle percentage — computed as 100 - brake, always present after mapping */
  throttle: number
}

export interface ThrottleBrakeChartProps {
  lapData?: LapData[]
  throttlePercent?: number
  brakePercent?: number
  throttleSpikes?: any
  brakeSpikes?: any
  playbackDuration?: string | number
  playbackMs?: number
  playing?: boolean
  totalMs?: number
}