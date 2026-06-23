export interface SummaryData {
  sessions: number;
  duration: string; // HH:MM:SS
  distance: number; // KM
}

export interface CalendarHeaderProps {
  sessionDays?: number[];
  summary: SummaryData;
  year?: number;
  month?: number; // 0-indexed
  collapsed?: boolean;
  onMonthChange?: (year: number, month: number) => void;
  onDateClick?: (date: number, year: number, month: number) => void;
}