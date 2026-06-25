import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { Map as LeafletMap, Marker, Polyline, TileLayer } from 'leaflet'
import styles from './ActivityMap.module.scss'
import { speedColorAtRatio, SPEED_COLOR_GRADIENT_CSS } from './speedColorScale'
import { latestLocationAtPlayhead } from './locationPlayback'
import type { ActivityMapProps, StreamLocationPoint } from './ActivityMap.types'

// ─── Constants ────────────────────────────────────────────────────────────────
const FOLLOW_ZOOM_MIN      = 14
const FOLLOW_ZOOM_MAX      = 17
const FOLLOW_COMFORT_MARGIN = 0.28
const START_MARKER_SIZE    = 28
const FINISH_MARKER_SIZE   = 24
const PLAYHEAD_MARKER_SIZE = 36

const START_MARKER_HTML = `
  <div class="activity-route-marker activity-route-marker--start" aria-hidden="true">
    <span class="activity-route-marker__play"></span>
  </div>
`

const FINISH_MARKER_HTML = `
  <div class="activity-route-marker activity-route-marker--finish" aria-hidden="true">
    <span class="activity-route-marker__finish-core"></span>
  </div>
`

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatSpeedKmh(value: number): string {
  return value < 10 ? value.toFixed(1) : Math.round(value).toString()
}

function maxSpeedMps(locations: readonly StreamLocationPoint[]): number {
  const speeds = locations
    .map(loc => loc.speedMps)
    .filter((s): s is number => s !== undefined && Number.isFinite(s) && s >= 0)
  return Math.max(...speeds, 0.001)
}

interface SpeedRange {
  color: string
  label: string
}

function buildSpeedLegend(maxSpeedKmh: number): SpeedRange[] | null {
  if (!Number.isFinite(maxSpeedKmh) || maxSpeedKmh <= 0) return null
  const bands = [
    { from: 0,    to: 0.25 },
    { from: 0.25, to: 0.5  },
    { from: 0.5,  to: 0.75 },
    { from: 0.75, to: 1    },
  ] as const
  return bands.map(band => ({
    color: speedColorAtRatio((band.from + band.to) / 2),
    label: `${Math.round(band.from * 100)}–${Math.round(band.to * 100)}% · ${formatSpeedKmh(band.from * maxSpeedKmh)}–${formatSpeedKmh(band.to * maxSpeedKmh)} km/h`,
  }))
}

// ─── Play / Pause icons ───────────────────────────────────────────────────────
function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <path d="M3 1.5l10 5.5-10 5.5V1.5z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <rect x="2" y="1" width="4" height="12" rx="1" />
      <rect x="8" y="1" width="4" height="12" rx="1" />
    </svg>
  )
}

// ─── ActivityMap ──────────────────────────────────────────────────────────────
export default function ActivityMap({
  locations,
  playbackMs,
  ready,
  playing,
  onTogglePlay,
}: ActivityMapProps) {
  const [leafletReady, setLeafletReady] = useState(false)

  const mapContainerRef    = useRef<HTMLDivElement | null>(null)
  const leafletRef         = useRef<typeof import('leaflet') | null>(null)
  const mapRef             = useRef<LeafletMap | null>(null)
  const tileRef            = useRef<TileLayer | null>(null)
  const segmentRefs        = useRef<Polyline[]>([])
  const startMarkerRef     = useRef<Marker | null>(null)
  const finishMarkerRef    = useRef<Marker | null>(null)
  const playbackMarkerRef  = useRef<Marker | null>(null)
  const routeBoundsKeyRef  = useRef('')
  const playingRef         = useRef(playing)
  const wasPlayingRef      = useRef(false)

  // Dark tile layer — matches the dark UI
  const mapTileUrl =
     'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

  // ── Route segments coloured by speed ──────────────────────────────────────
  const routeSegments = useMemo(() => {
    const maxMps      = maxSpeedMps(locations)
    const maxSpeedKmh = maxMps * 3.6

    if (locations.length < 2) {
      return { segments: [], speedLegend: buildSpeedLegend(maxSpeedKmh), maxSpeedKmh }
    }

    const segments: { latlngs: [number, number][]; color: string }[] = []
    for (let i = 1; i < locations.length; i++) {
      const a     = locations[i - 1]!
      const b     = locations[i]!
      const speed = Math.max(0, b.speedMps ?? a.speedMps ?? 0)
      const ratio = speed / maxMps
      segments.push({
        latlngs: [[a.lat, a.lng], [b.lat, b.lng]],
        color: speedColorAtRatio(ratio),
      })
    }
    return { segments, speedLegend: buildSpeedLegend(maxSpeedKmh), maxSpeedKmh }
  }, [locations])

  const playhead = useMemo(
    () => latestLocationAtPlayhead(locations, playbackMs),
    [locations, playbackMs],
  )

  const routeBoundsKey = useMemo(() => {
    if (locations.length === 0) return ''
    const first = locations[0]!
    const last  = locations[locations.length - 1]!
    return `${locations.length}:${first.lat},${first.lng}:${last.lat},${last.lng}`
  }, [locations])

  useEffect(() => { playingRef.current = playing }, [playing])

  // ── Fit route to view ──────────────────────────────────────────────────────
  const fitRouteToView = useCallback(() => {
    const map = mapRef.current
    if (!map || locations.length < 2 || playingRef.current) return
    map.invalidateSize({ animate: false })
    map.fitBounds(
      locations.map(loc => [loc.lat, loc.lng] as [number, number]),
      { padding: [48, 48], maxZoom: 17, animate: false },
    )
  }, [locations])

  const followZoom = useCallback(() => {
    const L   = leafletRef.current
    const map = mapRef.current
    if (!L || !map || locations.length < 2) return 15
    const bounds    = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng] as [number, number]))
    const routeZoom = map.getBoundsZoom(bounds, false, L.point(48, 48))
    return Math.min(FOLLOW_ZOOM_MAX, Math.max(FOLLOW_ZOOM_MIN, Number.isFinite(routeZoom) ? routeZoom + 1 : 15))
  }, [locations])

  // ── Load Leaflet async ─────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    void (async () => {
      const L = await import('leaflet')
      await import('leaflet/dist/leaflet.css')
      if (!cancelled) {
        leafletRef.current = L
        setLeafletReady(true)
      }
    })()
    return () => { cancelled = true }
  }, [])

  // ── Init map ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const L         = leafletRef.current
    const container = mapContainerRef.current
    if (!leafletReady || !L || !container || mapRef.current) return

    const map  = L.map(container, { zoomControl: true, preferCanvas: true })
    const tile = L.tileLayer(mapTileUrl, {
      maxZoom: 19,
      attribution: '&copy; <a href="https://carto.com">CARTO</a>',
    }).addTo(map)

    mapRef.current  = map
    tileRef.current = tile
    map.setView([0, 0], 2)
  }, [leafletReady, mapTileUrl])

  // ── Draw route + markers ───────────────────────────────────────────────────
  useEffect(() => {
    const L   = leafletRef.current
    const map = mapRef.current
    if (!L || !map || locations.length === 0) return

    // Remove old segments
    segmentRefs.current.forEach(line => line.remove())
    segmentRefs.current = routeSegments.segments.map(seg =>
      L.polyline(seg.latlngs, {
        color: seg.color, weight: 5, opacity: 0.95,
        lineCap: 'round', lineJoin: 'round',
      }).addTo(map),
    )

    const start  = locations[0]!
    const finish = locations[locations.length - 1]!

    // Start marker
    if (!startMarkerRef.current) {
      const half = START_MARKER_SIZE / 2
      startMarkerRef.current = L.marker([start.lat, start.lng], {
        icon: L.divIcon({
          className: 'activity-route-marker-wrap',
          html: START_MARKER_HTML,
          iconSize:   [START_MARKER_SIZE,  START_MARKER_SIZE],
          iconAnchor: [half, half],
        }),
        zIndexOffset: 600,
      }).addTo(map)
    } else {
      startMarkerRef.current.setLatLng([start.lat, start.lng])
    }

    // Finish marker
    if (!finishMarkerRef.current) {
      const half = FINISH_MARKER_SIZE / 2
      finishMarkerRef.current = L.marker([finish.lat, finish.lng], {
        icon: L.divIcon({
          className: 'activity-route-marker-wrap',
          html: FINISH_MARKER_HTML,
          iconSize:   [FINISH_MARKER_SIZE,  FINISH_MARKER_SIZE],
          iconAnchor: [half, half],
        }),
        zIndexOffset: 600,
      }).addTo(map)
    } else {
      finishMarkerRef.current.setLatLng([finish.lat, finish.lng])
    }

    // Playhead marker
    if (playhead) {
      const ll: [number, number] = [playhead.lat, playhead.lng]
      if (!playbackMarkerRef.current) {
        playbackMarkerRef.current = L.marker(ll, {
          icon: L.divIcon({
            className: 'activity-playhead-marker-wrap',
            html: `
              <div class="activity-playhead-marker" aria-hidden="true">
                <span class="activity-playhead-marker__pulse"></span>
                <span class="activity-playhead-marker__core"></span>
              </div>
            `,
            iconSize:   [PLAYHEAD_MARKER_SIZE, PLAYHEAD_MARKER_SIZE],
            iconAnchor: [PLAYHEAD_MARKER_SIZE / 2, PLAYHEAD_MARKER_SIZE / 2],
          }),
          zIndexOffset: 1000,
        }).addTo(map)
      } else {
        playbackMarkerRef.current.setLatLng(ll)
      }
    }
  }, [locations, routeSegments, playhead])

  // ── Follow playhead ────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    const L   = leafletRef.current
    if (!map || !L || !playhead || !playing) {
      wasPlayingRef.current = playing
      return
    }

    const latlng = L.latLng(playhead.lat, playhead.lng)

    if (!wasPlayingRef.current) {
      wasPlayingRef.current = true
      map.flyTo(latlng, followZoom(), { duration: 0.45 })
      return
    }

    if (!map.getBounds().isValid()) {
      map.setView(latlng, followZoom(), { animate: false })
      return
    }

    const bounds  = map.getBounds()
    const ne      = bounds.getNorthEast()
    const sw      = bounds.getSouthWest()
    const latSpan = ne.lat - sw.lat
    const lngSpan = ne.lng - sw.lng
    const inner   = L.latLngBounds(
      [sw.lat + latSpan * FOLLOW_COMFORT_MARGIN, sw.lng + lngSpan * FOLLOW_COMFORT_MARGIN],
      [ne.lat - latSpan * FOLLOW_COMFORT_MARGIN, ne.lng - lngSpan * FOLLOW_COMFORT_MARGIN],
    )

    if (inner.contains(latlng)) return
    if (!bounds.contains(latlng)) {
      map.flyTo(latlng, map.getZoom(), { duration: 0.3 })
      return
    }
    map.panTo(latlng, { animate: true, duration: 0.2 })
  }, [playing, playhead, followZoom])

  // ── Fit on route change ────────────────────────────────────────────────────
  useEffect(() => {
    if (!routeBoundsKey) { routeBoundsKeyRef.current = ''; return }
    if (!ready || routeBoundsKeyRef.current === routeBoundsKey) return
    routeBoundsKeyRef.current = routeBoundsKey
    const t = window.setTimeout(() => fitRouteToView(), 120)
    return () => window.clearTimeout(t)
  }, [ready, routeBoundsKey, fitRouteToView])

  // ── Resize observer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!ready) return
    const container = mapContainerRef.current
    if (!container) return
    const ro = new ResizeObserver(() => {
      const map = mapRef.current
      if (!map) return
      map.invalidateSize({ animate: false })
      if (playingRef.current && playhead) {
        map.panTo([playhead.lat, playhead.lng], { animate: false })
        return
      }
      if (routeBoundsKeyRef.current) fitRouteToView()
    })
    ro.observe(container)
    return () => ro.disconnect()
  }, [ready, fitRouteToView, playhead])

  // ── Tile URL update ────────────────────────────────────────────────────────
  useEffect(() => { tileRef.current?.setUrl(mapTileUrl) }, [mapTileUrl])

  // ── Initial fit ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!ready) return
    const t = window.setTimeout(() => fitRouteToView(), 180)
    return () => window.clearTimeout(t)
  }, [ready, fitRouteToView])

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => () => {
    segmentRefs.current.forEach(line => line.remove())
    mapRef.current?.remove()
    mapRef.current         = null
    tileRef.current        = null
    segmentRefs.current    = []
    startMarkerRef.current  = null
    finishMarkerRef.current = null
    playbackMarkerRef.current = null
  }, [])

  return (
    <div className={styles.wrap}>
      {/* Leaflet map container */}
      <div ref={mapContainerRef} className={styles.map} />

      {/* Speed legend */}
      <div className={styles.legend}>
        <div className={styles.legendHead}>
          Route speed
          {routeSegments.maxSpeedKmh > 0 && (
            <span className={styles.legendMax}>
              {' '}· max {formatSpeedKmh(routeSegments.maxSpeedKmh)} km/h
            </span>
          )}
        </div>
        <div className={styles.legendBarWrap}>
          <span
            className={styles.legendBar}
            style={{ background: SPEED_COLOR_GRADIENT_CSS }}
            aria-hidden
          />
        </div>
        {routeSegments.speedLegend ? (
          <ul className={styles.legendRanges}>
            {routeSegments.speedLegend.map(band => (
              <li key={band.label} className={styles.legendRange}>
                <span
                  className={styles.legendSwatch}
                  style={{ backgroundColor: band.color }}
                  aria-hidden
                />
                <span>{band.label}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.legendEmpty}>No speed data</p>
        )}
      </div>

      {/* Play / Pause button */}
      {/* <button
        type="button"
        className={styles.playBtn}
        onClick={onTogglePlay}
        disabled={!ready}
        aria-pressed={playing}
        aria-label={playing ? 'Pause playback' : 'Start playback'}
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button> */}
    </div>
  )
}