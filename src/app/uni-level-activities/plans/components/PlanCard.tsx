"use client";

import React, { useMemo } from "react";
import styles from "../styles/PlanCard.module.css";
import type { PlanItem } from "../page";
import { Eye, CalendarDays, Building2, ClipboardList , Pencil} from "lucide-react";

function fmt(iso: string) {
  if (!iso) return "—";
  return iso.slice(0, 10);
}
export default function PlanCard({ item, onView, onEdit }: {
  item: PlanItem;
  onView: (id:number)=>void;
  onEdit: (p: PlanItem)=>void;
}) {
  const created = useMemo(() => fmt(item.createdAt), [item.createdAt]);

  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <h3 className={styles.title}>{item.title}</h3>
        <p className={styles.desc}>{item.description}</p>

        <div className={styles.badges}>
          <span
            className={`${styles.badge} ${
              item.statusLabel === "نشطة" ? styles.badgeActive : styles.badgeDraft
            }`}
          >
            {item.statusLabel}
          </span>

          <span className={`${styles.badge} ${styles.badgeTerm}`}>
            <ClipboardList size={14} />
            الفصل {item.term}
          </span>

          {item.facultyName && (
            <span className={`${styles.badge} ${styles.badgeFaculty}`}>
              <Building2 size={14} />
              {item.facultyName}
            </span>
          )}

          <span className={`${styles.badge} ${styles.badgeDate}`} dir="ltr">
            <CalendarDays size={14} />
            {created}
          </span>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <div className={styles.statLabel}>عدد الفعاليات الفعلية</div>
          <div className={styles.statValue}>{item.eventsCount}</div>
        </div>

        <div className={styles.statBox}>
          <div className={styles.statLabel}>آخر تحديث</div>
          <div className={styles.statValueSm} dir="ltr">
            {fmt(item.updatedAt)}
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.viewBtn} onClick={() => onView(item.id)} type="button">
          <Eye size={18} />
          عرض التفاصيل
        </button>
        <button className={styles.editBtn} onClick={() => onEdit(item)} type="button">
      <Pencil size={18} />
      تعديل
    </button>
      </div>
    </article>
  );
}