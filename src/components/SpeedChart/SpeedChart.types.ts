export interface SpeedLapData {
  /** Max speed for the lap (light teal bar) */
  maxSpeed: number
  /** Avg speed for the lap (dark navy bar) */
  avgSpeed: number
}

export interface SpeedChartProps {
  lapData?: SpeedLapData[]
  /** Overall avg speed shown in header (teal when AVG selected) */
  avgSpeed?: number
  /** Overall max speed shown in header (teal when MAX selected) */
  maxSpeed?: number
  /** Y-axis top value (default 100) */
  yMax?: number
  /** MAX dashed reference line value (default 90) */
  maxLine?: number
  /** AVG dashed reference line value (default 20) */
  avgLine?: number
  /** Unit label (default 'KM/H') */
  unit?: string
}