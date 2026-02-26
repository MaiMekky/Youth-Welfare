"use client";

import React from "react";
import styles from "../styles/EventsPage.module.css";
import { CalendarDays, Clock, Eye, MapPin, Trash2, Users, DollarSign , Pencil } from "lucide-react";
import { EventRow } from "../page";

const statusBadgeClass = (status: string) => {
  const s = (status || "").trim();
  if (s.includes("نشط")) return "badgeGreen";
  if (s.includes("قريب")) return "badgeBlue";
  if (s.includes("مكتمل")) return "badgeIndigo";
  if (s.includes("انتظار") || s.includes("منتظر")) return "badgeAmber";
  return "badgeBlue";
};

const typePillClass = (type: string) => {
  const t = (type || "").trim();
  if (t.includes("تقني") || t.includes("تكنولوج")) return "pillTech";
  if (t.includes("ثقاف")) return "pillCulture";
  if (t.includes("رياض")) return "pillSport";
  if (t.includes("فني")) return "pillArt";
  return "pillTech";
};

export default function EventCard({
  row,
  onView,
  onEdit,
  onDelete,
  canDelete,

  showToggle,
  busy,
  onActiveChange,
}: {
  row: EventRow;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  canDelete: boolean;

  showToggle?: boolean;
  busy?: boolean;
  onActiveChange?: (id: number, next: boolean) => void;
}) {
  return (
    <article className={styles.card}>
      <div className={styles.cardTopRow}>
        <h3 className={styles.cardTitle}>{row.title}</h3>

        {showToggle && (
          <div className={styles.toggleWrap}>
            <span className={styles.toggleLabel}>{row.isActive ? "نشط" : "غير نشط"}</span>

            <label className={styles.switch} aria-label="حالة النشاط">
              <input
                type="checkbox"
                checked={!!row.isActive}
                disabled={!!busy}
                onChange={(e) => onActiveChange?.(row.id, e.target.checked)}
              />
              <span className={styles.slider} />
            </label>
          </div>
        )}
      </div>

      <p className={styles.cardSub}>
        <span className={styles.muted}>الخطة:</span> {row.plan}
      </p>

      <div className={styles.badgesRow}>
        <span className={styles[typePillClass(row.type) as keyof typeof styles]}>{row.type}</span>
        <span className={styles[statusBadgeClass(row.status) as keyof typeof styles]}>{row.status}</span>
      </div>

      <div className={styles.metaList}>
        <div className={styles.metaItem}><CalendarDays size={16} /><span dir="ltr">{row.date}</span></div>
        <div className={styles.metaItem}><Clock size={16} /><span dir="ltr">{row.time}</span></div>
        <div className={styles.metaItem}><MapPin size={16} /><span>{row.place}</span></div>
        <div className={styles.metaItem}><Users size={16} /><span>{row.participants}</span></div>
        <div className={styles.metaItem}><DollarSign size={16} /><span>{row.cost}</span></div>
      </div>

      <div className={styles.cardActions}>
        <button className={styles.btnGhost} type="button" onClick={() => onView(row.id)}>
          <Eye size={16} />
          عرض التفاصيل
        </button>
        <button className={styles.secondary} onClick={() => onEdit(row.id)}>
          <Pencil size={18} />
          تعديل
        </button>
        {canDelete && (
          <button className={styles.btnDanger} type="button" onClick={() => onDelete(row.id)}>
            <Trash2 size={16} />
            الغاء
          </button>
        )}
      </div>
    </article>
  );
}