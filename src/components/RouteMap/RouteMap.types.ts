export interface RouteMapProps {
  points: Array<{ lat: number; lng: number }>;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  width?: number;
  height?: number;
  /** Fractional padding on each side (0–0.45). Default: 0.1 */
  padding?: number;
  strokeColor?: string;
  strokeWidth?: number;
  ariaLabel?: string;
}