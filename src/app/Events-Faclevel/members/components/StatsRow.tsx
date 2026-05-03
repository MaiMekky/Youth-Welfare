import React from "react";
import styles from "../styles/StatsRow.module.css";

type Props = {
  stats: { total: number; accepted: number; pending: number; unassigned: number };
};

export default function StatsRow({ stats }: Props) {
  return (
    <div className={styles.statsRow}>
      <div className={`${styles.statCard} ${styles.blue}`}>
        <p className={styles.statLabel}>إجمالي الأعضاء</p>
        <p className={styles.statValue}>{stats.total}</p>
      </div>
      <div className={`${styles.statCard} ${styles.green}`}>
        <p className={styles.statLabel}>الأعضاء المقبولون</p>
        <p className={styles.statValue}>{stats.accepted}</p>
      </div>
      <div className={`${styles.statCard} ${styles.amber}`}>
        <p className={styles.statLabel}>قيد المراجعة</p>
        <p className={styles.statValue}>{stats.pending}</p>
      </div>
      <div className={`${styles.statCard} ${styles.indigo}`}>
        <p className={styles.statLabel}>غير موزعين</p>
        <p className={styles.statValue}>{stats.unassigned}</p>
      </div>
    </div>
  );
}