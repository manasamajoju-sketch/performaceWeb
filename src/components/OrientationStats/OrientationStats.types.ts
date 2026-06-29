export interface OrientationStatsProps {
  /** Live/interpolated orientation at current playback position */
  yaw: number
  pitch: number
  roll: number
  /** Session-wide aggregate shown in the top summary row */
  avgValue?: number
  maxValue?: number
}