export interface SessionGraphLapData {
  /** Acceleration % for this lap (0-100). Deceleration is derived as 100 - accel,
   *  same convention as ThrottleBrakeChart's throttle/brake pair. */
  accel: number;
}

export interface SessionGraphStat {
  label: string;
  sublabel: string;
  avgValue: string;
  maxValue: string;
}

export interface SessionGraphAxisLabel {
  text: string;
  /** Position as a % up the chart (0 = baseline, 100 = top). */
  percent: number;
}

export interface SessionGraphDriver {
  id: string;
  initials: string;
  color: string;
  /** Index into lapData this marker sits above. */
  lapIndex: number;
}

export interface SessionGraphProps {
  leftStat?: SessionGraphStat;
  rightStat?: SessionGraphStat;
  lapData?: SessionGraphLapData[];
  /** Left-side axis labels, plotted against the 0-100 accel/decel scale. */
  leftAxisLabels?: SessionGraphAxisLabel[];
  /** Right-side axis labels, plotted against whatever secondary scale
   *  (e.g. pace) the dashed reference lines represent. */
  rightAxisLabels?: SessionGraphAxisLabel[];
  xAxisStart?: string;
  xAxisEnd?: string;
  drivers?: SessionGraphDriver[];
  /** Lap selected/highlighted by default, before any hover/click. */
  defaultActiveLap?: number | null;
}