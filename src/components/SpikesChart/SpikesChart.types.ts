export interface SpikeLapData {
  throttleAvg: number
  brakeAvg: number
}

export interface SpikesChartProps {
  lapData?: SpikeLapData[]
  /** AVG line value for throttle half (default 4) */
  throttleAvg?: number
  /** AVG line value for brake half (default 5) */
  brakeAvg?: number
  /** Max value for throttle y-axis (default 60) */
  throttleMax?: number
  /** Max value for brake y-axis (default 40) */
  brakeMax?: number
}