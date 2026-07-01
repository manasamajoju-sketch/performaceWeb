export interface AxisDataPoint {
  x: number
  y: number
  z: number
}

export interface AccelerometerChartProps {
  data?: AxisDataPoint[]
  label?: string
  unit?: string
  avgValue?: number
  maxValue?: number
  xAvg?: number
  yAvg?: number
  zAvg?: number
  yMax?: number
  maxLine?: number
  avgLine?: number
  rightTopLabel?: string
  rightBottomLabel?: string
  playbackMs?: number
  playing?: boolean
  totalMs?: number
}