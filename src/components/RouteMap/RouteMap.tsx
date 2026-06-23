import React, { useMemo } from "react";
import styles from "./RouteMap.module.scss";
import type { RouteMapProps } from "./RouteMap.types";

const EPS = 1e-10;

function projectPoints(
  points: Array<{ lat: number; lng: number }>,
  minLat: number, maxLat: number,
  minLng: number, maxLng: number,
  w: number, h: number,
  padding: number
): string {
  const dLat = Math.max(maxLat - minLat, EPS);
  const dLng = Math.max(maxLng - minLng, EPS);
  const drawW = w * (1 - 2 * padding);
  const drawH = h * (1 - 2 * padding);
  const scale = Math.min(drawW / dLng, drawH / dLat);
  const ox = padding * w + (drawW - dLng * scale) / 2;
  const oy = padding * h + (drawH - dLat * scale) / 2;

  return points
    .map(({ lat, lng }) =>
      `${(ox + (lng - minLng) * scale).toFixed(2)},${(oy + (maxLat - lat) * scale).toFixed(2)}`
    )
    .join(" ");
}

const RouteMap = React.memo(function RouteMap({
  points,
  minLat, maxLat, minLng, maxLng,
  width = 140,
  height = 80,
  padding = 0.1,
  strokeColor = "#3EC7D9",
  strokeWidth = 2.5,
  ariaLabel = "Route preview",
}: RouteMapProps) {
  const content = useMemo(() => {
    if (!points || points.length === 0) {
      return (
        <line
          x1={width * 0.25} y1={height / 2}
          x2={width * 0.75} y2={height / 2}
          stroke={strokeColor} strokeWidth={strokeWidth}
          strokeOpacity={0.3} strokeLinecap="round"
          strokeDasharray="4 4"
        />
      );
    }

    if (points.length === 1) {
      return (
        <circle
          cx={width / 2} cy={height / 2}
          r={strokeWidth * 1.5}
          fill={strokeColor} fillOpacity={0.6}
        />
      );
    }

    const svgPoints = projectPoints(
      points, minLat, maxLat, minLng, maxLng,
      width, height, padding
    );

    return (
      <polyline
        points={svgPoints}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }, [points, minLat, maxLat, minLng, maxLng, width, height, padding, strokeColor, strokeWidth]);

  return (
    <svg
      className={styles.root}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
    >
      {content}
    </svg>
  );
});

export default RouteMap;