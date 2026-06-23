import React, { useState, useMemo } from 'react';
import styles from './SessionPanel.module.scss';
import type {
  SessionsPanelProps,
  Category,
  SessionItem,
  QuinPod,
} from './SessionPanel.types';
import defaultPodIcon from '../../assets/pod.svg';
import blackPodIcon from '../../assets/blackPod.svg';
import rightArrowIcon from '../../assets/rightArrow.svg';
import searchIcon from '../../assets/search.svg';
import RouteMap from '../RouteMap';

const DEFAULT_CATEGORIES: Category[] = ['All', 'Motorcycling', 'Cycling', 'Equestrian'];

const DEFAULT_SUB_FILTERS = [
  { label: 'PRO 400',   active: true  },
  { label: 'PRO+ 400',  active: true  },
  { label: 'Pro X',     active: false },
  { label: 'Pro X 300', active: false },
];
const TrackMap: React.FC<{ session: SessionItem }> = ({ session }) => (
  <div className={styles.trackMap}>
    <RouteMap
      points={session.polyline ?? []}
      minLat={session.minLat}
      maxLat={session.maxLat}
      minLng={session.minLng}
      maxLng={session.maxLng}
      width={140}
      height={80}
    />
  </div>
);
// ── Sub-component: session row ────────────────────────────────────────
const SessionRow: React.FC<{ session: SessionItem; onClick?: () => void }> = ({ session, onClick }) => (
  <div className={styles.sessionRow} onClick={onClick} role="button" tabIndex={0}
    onKeyDown={e => e.key === 'Enter' && onClick?.()}
  >
    <TrackMap session={session} />

    <div className={styles.sessionInfo}>
      <span className={styles.sessionName}>{session.trackName}</span>
      <span className={styles.sessionDate}>{session.date}</span>
      <span className={styles.sessionDevice}>{session.device}</span>
    </div>

    <div className={styles.sessionStats}>
      {session.laps !== undefined && (
        <div className={styles.statItem}>
          <span className={styles.statValue}>{session.laps}</span>
          <span className={styles.statUnit}>LAPS</span>
        </div>
      )}
      {session.distanceKm && (
        <div className={styles.statItem}>
          <span className={styles.statValue}>{session.distanceKm}</span>
          <span className={styles.statUnit}>KM</span>
        </div>
      )}
      {session.duration && (
        <div className={styles.statItem}>
          <span className={styles.statValue}>{session.duration}</span>
          <span className={styles.statUnit}>HH:MM:SS</span>
        </div>
      )}
    </div>

    <img src={rightArrowIcon} className={styles.rowArrow} aria-hidden="true" />
  </div>
);

// ── Sub-component: pod card ───────────────────────────────────────────
const PodCard: React.FC<{ pod: QuinPod }> = ({ pod }) => {
  const src = pod.imageUrl?.includes('blackPod') ? blackPodIcon : defaultPodIcon;
  const rotateRight = !pod.imageUrl?.includes('blackPod');

  return (
    <div className={styles.podCard}>
      <div className={styles.podInfo}>
        <span className={styles.podName}>{pod.name}</span>
        <div className={styles.podMeta}>
          <span className={styles.podMetaLabel}>Last connected{'\n'}</span>
          <br />
          <span className={styles.podMetaTime}>{pod.lastConnected}</span>
        </div>
      </div>
      <img
        src={src}
        alt={`${pod.name} image`}
        className={`${styles.podImage} ${rotateRight ? styles.podImageRotated : ''}`}
      />
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────
const SessionsPanel: React.FC<SessionsPanelProps> = ({
  sessions,
  pods,
  categories = DEFAULT_CATEGORIES,
  subFilters: subFiltersProp,
  onSessionClick,
  onSearch,
}) => {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [subFilters, setSubFilters] = useState(subFiltersProp ?? DEFAULT_SUB_FILTERS);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSubFilter = (index: number) => {
    setSubFilters(prev =>
      prev.map((f, i) => i === index ? { ...f, active: !f.active } : f)
    );
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      const matchesSearch = searchQuery === '' ||
        s.trackName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [sessions, searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <div className={styles.root}>
      {/* ── Sessions column ── */}
      <div className={styles.sessionsCol}>
        <div className={styles.topBar}>
          {/* Category + sub-filter tabs */}
          <div className={styles.filtersGroup}>
            <div className={styles.categories}>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`${styles.catTab} ${activeCategory === cat ? styles.catTabActive : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className={styles.subFilters}>
              {subFilters.map((sf, i) => (
                <button
                  key={sf.label}
                  className={`${styles.subTab} ${sf.active ? styles.subTabActive : ''}`}
                  onClick={() => toggleSubFilter(i)}
                >
                  {sf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className={styles.searchBar}>
            <img src={searchIcon} className={styles.searchIcon} aria-hidden="true" />
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search Tests"
              value={searchQuery}
              onChange={handleSearch}
              aria-label="Search sessions"
            />
          </div>
        </div>

        {/* Session rows */}
        <div className={styles.sessionList}>
          {filteredSessions.map(session => (
            <SessionRow
              key={session.id}
              session={session}
              onClick={() => onSessionClick?.(session)}
            />
          ))}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className={styles.divider} />

      {/* ── Quin Pods column ── */}
      <div className={styles.podsCol}>
        <div className={styles.podsTitle}>Quin Pods</div>
        {pods.map(pod => (
          <PodCard key={pod.id} pod={pod} />
        ))}
      </div>
    </div>
  );
};

export default SessionsPanel;