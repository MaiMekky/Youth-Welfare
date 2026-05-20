import React from "react";
import { Users, CheckCircle2 } from "lucide-react";
import styles from "../styles/EventDetails.module.css";

type Props = {
  remaining: number;
  max: number;
  registered: number;
};

export default function StatsRow({ remaining, max, registered }: Props) {
  return (
    <div className={styles.statsRow}>
      <div className={`${styles.statCard} ${styles.statAmber}`}>
        <div className={styles.statIcon}><Users size={20} /></div>
        <div className={styles.statText}>
          <div className={styles.statLabel}>المقاعد المتبقية</div>
          <div className={styles.statValue}>{remaining}</div>
        </div>
      </div>

      <div className={`${styles.statCard} ${styles.statGreen}`}>
        <div className={styles.statIcon}><CheckCircle2 size={20} /></div>
        <div className={styles.statText}>
          <div className={styles.statLabel}>الحد الأقصى</div>
          <div className={styles.statValue}>{max}</div>
        </div>
      </div>

      <div className={`${styles.statCard} ${styles.statIndigo}`}>
        <div className={styles.statIcon}><Users size={20} /></div>
        <div className={styles.statText}>
          <div className={styles.statLabel}>العدد الحالي</div>
          <div className={styles.statValue}>{registered}</div>
        </div>
      </div>
    </div>
  );
}