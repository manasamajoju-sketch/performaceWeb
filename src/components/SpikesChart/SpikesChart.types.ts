export interface LapData {
  brake: number
  throttle: number
}

export interface SpikesChartProps {
  lapData?: LapData[]
  throttleMax?: number
  brakeMax?: number
  throttleSpikes?: string | number
  brakeSpikes?: string | number
}