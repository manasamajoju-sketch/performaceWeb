import React, { useState, useRef, useEffect, useMemo } from 'react';
import styles from './Calender.module.scss';
import type { CalendarHeaderProps } from './Calender.types';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

// Monday-first weekday index (0=Mon … 6=Sun)
const mondayFirst = (d: Date) => (d.getDay() + 6) % 7;

interface CalendarCell {
  date: number;
  kind: 'empty' | 'session' | 'today' | 'past' | 'future';
}

function buildCells(year: number, month: number, sessionSet: Set<number>): CalendarCell[] {
  const today   = new Date();
  const isNow   = today.getFullYear() === year && today.getMonth() === month;
  const todayD  = today.getDate();
  const firstDay = new Date(year, month, 1);
  const daysInM  = new Date(year, month + 1, 0).getDate();
  const offset   = mondayFirst(firstDay);

  const cells: CalendarCell[] = [];
  for (let i = 0; i < offset; i++) cells.push({ date: 0, kind: 'empty' });

  for (let d = 1; d <= daysInM; d++) {
    let kind: CalendarCell['kind'];
    if (isNow && d === todayD)    kind = 'today';
    else if (sessionSet.has(d))   kind = 'session';
    else if (isNow && d > todayD) kind = 'future';
    else                          kind = 'past';
    cells.push({ date: d, kind });
  }

  while (cells.length % 7 !== 0) cells.push({ date: 0, kind: 'empty' });
  return cells;
}

/** Returns the row index (0-based) that contains today's date */
function getTodayRowIndex(cells: CalendarCell[]): number {
  const idx = cells.findIndex(c => c.kind === 'today');
  if (idx === -1) return 0;
  return Math.floor(idx / 7);
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  sessionDays = [],
  summary,
  year:  yearProp,
  month: monthProp,
  onMonthChange,
  onDateClick,
  collapsed = false,
}) => {
  const now = new Date();

  const [localYear, ]  = useState(yearProp  ?? now.getFullYear());
  const [localMonth, setLocalMonth] = useState(monthProp ?? now.getMonth());
  const [dropOpen,   setDropOpen]   = useState(false);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const year  = yearProp  ?? localYear;
  const month = monthProp ?? localMonth;

  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropOpen]);

  const sessionSet = useMemo(() => new Set(sessionDays), [sessionDays]);
  const cells      = useMemo(() => buildCells(year, month, sessionSet), [year, month, sessionSet]);

  // In collapsed mode, only show the week row containing today
  const todayRow   = useMemo(() => getTodayRowIndex(cells), [cells]);
  const visibleCells = useMemo(() => {
    if (!collapsed) return cells;
    return cells.slice(todayRow * 7, todayRow * 7 + 7);
  }, [collapsed, cells, todayRow]);

  const selectMonth = (m: number) => {
    setLocalMonth(m);
    onMonthChange?.(year, m);
    setDropOpen(false);
  };

  const handleDateClick = (cell: CalendarCell) => {
    if (cell.kind === 'empty') return;
    setSelectedDate(cell.date);
    onDateClick?.(cell.date, year, month);
  };

  const getCellClass = (cell: CalendarCell, isSelected: boolean) => {
    const base = cell.kind === 'empty' ? styles.cellEmpty : styles.cell;
    const kindCls = cell.kind !== 'empty' ? styles[`cell_${cell.kind}`] : '';
    const selCls  = isSelected ? styles.cell_selected : '';
    return [base, kindCls, selCls].filter(Boolean).join(' ');
  };

  return (
    <div className={`${styles.wrapper} ${collapsed ? styles.wrapperCollapsed : ''}`}>
      {/* ── Left: month nav + grid ── */}
      <div className={styles.left}>

        {/* Month label + dropdown */}
        <div className={styles.monthRow} ref={dropRef}>
          <button
            className={styles.monthBtn}
            onClick={() => setDropOpen(v => !v)}
            aria-haspopup="listbox"
            aria-expanded={dropOpen}
          >
            <span className={styles.monthLabel}>
              {MONTH_NAMES[month]} {year}
            </span>
            <span className={`${styles.chevron} ${dropOpen ? styles.chevronUp : ''}`} />
          </button>

          {dropOpen && (
            <div className={styles.dropdown} role="listbox">
              {MONTH_NAMES.map((name, i) => (
                <button
                  key={i}
                  role="option"
                  aria-selected={i === month}
                  className={`${styles.dropItem} ${i === month ? styles.dropItemActive : ''}`}
                  onClick={() => selectMonth(i)}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Calendar grid */}
        <div className={styles.calendarGrid}>
          {visibleCells.map((cell, idx) => {
            const isSelected = cell.date === selectedDate && cell.kind !== 'empty';
            return (
              <div
                key={idx}
                className={getCellClass(cell, isSelected)}
                onClick={() => handleDateClick(cell)}
                role={cell.kind !== 'empty' ? 'button' : undefined}
                tabIndex={cell.kind !== 'empty' ? 0 : undefined}
                aria-label={cell.kind !== 'empty' ? `${cell.date} ${MONTH_NAMES[month]}` : undefined}
                onKeyDown={e => e.key === 'Enter' && handleDateClick(cell)}
              >
                {cell.kind !== 'empty' ? cell.date : null}
              </div>
            );
          })}
        </div>
      </div>
     <div className={styles.divider} />
      {/* ── Summary ── */}
      <div className={styles.summary}>
        {!collapsed && <div className={styles.summaryTitle}>Summary</div>}

        {collapsed ? (
          <div className={styles.summaryRow}>
    <div className={styles.summaryMeta}>
      <span className={styles.summaryLabel}>Sessions</span>
      <span className={styles.summaryUnit}>COUNT</span>
    </div>
    <span className={styles.summaryValue}>{summary.sessions}</span>
  </div>
        ) : (
          [
            { label: 'Sessions', unit: 'COUNT',    value: String(summary.sessions) },
            { label: 'Duration', unit: 'HH:MM:SS', value: summary.duration },
            { label: 'Distance', unit: 'KM',        value: summary.distance.toFixed(2) },
          ].map(({ label, unit, value }) => (
            <div className={styles.summaryRow} key={label}>
              <div className={styles.summaryMeta}>
                <span className={styles.summaryLabel}>{label}</span>
                <span className={styles.summaryUnit}>{unit}</span>
              </div>
              <span className={styles.summaryValue}>{value}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CalendarHeader;