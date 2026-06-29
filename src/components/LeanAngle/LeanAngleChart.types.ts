// ─── LeanAngleChart Types ─────────────────────────────────────────────────────

export interface LeanAngleDataPoint {
  /** Left lean magnitude as a percentage of maxDegree (0–100) */
  left: number
  /** Right lean magnitude as a percentage of maxDegree (0–100) */
  right: number
  /** Timestamp in milliseconds — used to sync with playbackMs */
  timestamp: number
}

export interface LeanAngleChartProps {
  /**
   * Array of data points. Should ideally contain 61 entries to match
   * the BAR_COUNT spec. Falls back to generated mock data if omitted.
   */
  data?: LeanAngleDataPoint[]

  /** Peak left lean angle shown in the header (degrees) */
  leftDegree?: number

  /** Peak right lean angle shown in the header (degrees) */
  rightDegree?: number

  /**
   * The degree value shown on the right Y-axis at the MAX line.
   * @default 36
   */
  maxDegree?: number

  /**
   * The degree value shown on the right Y-axis at the AVG (centre) line.
   * @default 26
   */
  avgDegree?: number

  /**
   * Current playback position in milliseconds.
   * Drives the playback cursor position and playback tooltip.
   * @default 0
   */
  playbackMs?: number

  /**
   * Whether playback is actively running.
   * Controls opacity state (State 7 / State 8) and cursor visibility.
   * @default false
   */
  playing?: boolean

  /**
   * Total session duration in milliseconds.
   * Used to compute cursor position and X-axis labels.
   * @default 72000
   */
  totalMs?: number
}