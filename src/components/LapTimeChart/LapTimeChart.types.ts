export interface LapTimeDataPoint {
  /** Bar height as a % of the chart's y-axis scale (0-100). */
  value: number;
  time?: string;
  /** Optional label to display below the bar. */
  label?: string;
  /** Optional tooltip text to display on hover. */
  tooltip?: string;
  timeLabel?: string;
}

export interface LapTimeRefLine {
  /** e.g. "AVG" or "MAX" */
  label: string;
  /** Displayed time value on the right, e.g. "05:30" */
  value: string;
  /** Position up the chart, 0-100. */
  percent: number;
}

export interface LapTimeYAxisLabel {
  text: string;
  percent: number;
}

export interface LapTimeProps {
  label?: string;
  sublabel?: string;
  avgValue?: string;
  maxValue?: string;
  data?: LapTimeDataPoint[];
  yAxisLabels?: LapTimeYAxisLabel[];
  refLines?: LapTimeRefLine[];
  xAxisLabels?: string[];
    playbackIndex?: number | null;
}