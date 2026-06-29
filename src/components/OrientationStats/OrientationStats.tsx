import styles from './OrientationStats.module.scss'
import type { OrientationStatsProps } from './OrientationStats.types'

export function OrientationStats({
  yaw,
  pitch,
  roll,
  avgValue,
  maxValue,
}: OrientationStatsProps) {
  const fmt = (n: number) => Math.round(Math.abs(n)).toString()

  return (
    <div className={styles.row}>

      {/* ── Left: Orientation label + AVG + MAX ──────────────────────── */}
      <div className={styles.leftCluster}>
        <div className={styles.titleGroup}>
          <span className={styles.heading}>Orientation</span>
          <span className={styles.subtext}>MS</span>
        </div>

        <div className={styles.statCell}>
          <span className={styles.statValue}>{avgValue ?? 85}</span>
          <span className={styles.statLabel}>AVG</span>
        </div>

        <div className={styles.statCell}>
          <span className={styles.statValue}>{maxValue ?? 120}</span>
          <span className={styles.statLabel}>MAX</span>
        </div>
      </div>

      <div className={styles.spacer} />

      {/* ── Right: YAW / PITCH / ROLL ────────────────────────────────── */}
      <div className={styles.rightCluster}>
        {([
          { label: 'YAW',   value: yaw   },
          { label: 'PITCH', value: pitch },
          { label: 'ROLL',  value: roll  },
        ] as const).map(({ label, value }) => (
          <div key={label} className={styles.axisCell}>
            <div className={styles.axisValueWrap}>
              <span className={styles.axisValue}>{fmt(value)}</span>
              <sup className={styles.axisSup}>o</sup>
            </div>
            <span className={styles.axisLabel}>{label}</span>
          </div>
        ))}
      </div>

    </div>
  )
}