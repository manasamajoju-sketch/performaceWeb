export type Category = 'All' | 'Motorcycling' | 'Cycling' | 'Equestrian';

export interface SubFilter {
  label: string;   // e.g. "PRO 400"
  active: boolean;
}

export interface SessionItem {
  id: string;
  trackName: string;
  date: string;        // "23 May 2026 | 10:37 AM"
  device: string;      // "PRO 400"
  trackMapUrl?: string;
  laps?: number;
  distanceKm?: string; // "12:23"
  duration?: string;   // "01:02:99"

   polyline?: Array<{ lat: number; lng: number }>;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface QuinPod {
  id: string;
  name: string;
  lastConnected: string;
  imageUrl?: string;
}

export interface SessionsPanelProps {
  sessions: SessionItem[];
  pods: QuinPod[];
  categories?: Category[];
  subFilters?: SubFilter[];
  onSessionClick?: (session: SessionItem) => void;
  onSearch?: (query: string) => void;
   onListScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}