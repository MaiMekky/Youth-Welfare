"use client";

import React, { useMemo } from "react";
import styles from "../styles/PlanCard.module.css";
import type { PlanItem } from "../page";
import { Eye, CheckCircle2, FileText } from "lucide-react";

export default function PlanCard({
  item,
  onView,
}: {
  item: PlanItem;
  onView: (id: number) => void;
}) {
  const total = Math.max(item.activeEvents + item.proposedEvents, 0);
  const completed = Math.max(item.completedEvents, 0);
  const progress = useMemo(() => {
    if (!total) return 0;
    return Math.min(100, Math.round((completed / total) * 100));
  }, [total, completed]);

  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <h3 className={styles.title}>{item.title}</h3>
        <p className={styles.desc}>{item.description}</p>

        <div className={styles.badges}>
          <span className={styles.year}>{item.yearLabel}</span>
          <span className={item.statusLabel === "نشطة" ? styles.active : styles.draft}>
            {item.statusLabel}
          </span>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={`${styles.statBox} ${styles.green}`}>
          <div className={styles.statHead}>
            <CheckCircle2 size={16} />
            <span>الفعاليات الفعلية</span>
          </div>
          <div className={styles.statValue}>{item.activeEvents}</div>
        </div>

        <div className={`${styles.statBox} ${styles.blue}`}>
          <div className={styles.statHead}>
            <FileText size={16} />
            <span>الفعاليات المقترحة</span>
          </div>
          <div className={styles.statValue}>{item.proposedEvents}</div>
        </div>
      </div>

      <div className={styles.progressWrap}>
        <div className={styles.progressHead}>
          <span>نسبة الإنجاز</span>
          <span>{progress}%</span>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <div className={styles.progressMeta}>
          {completed} من {total} فعاليات مكتملة
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.viewBtn} onClick={() => onView(item.id)} type="button">
          <Eye size={18} />
          عرض التفاصيل
        </button>
      </div>
    </article>
  );
}
