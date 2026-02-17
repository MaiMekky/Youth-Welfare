"use client";

import React from "react";
import styles from "../styles/EventsPage.module.css";
import { CalendarDays, Clock, Eye, MapPin, Trash2, Users, DollarSign } from "lucide-react";
import { EventRow } from "../page";

const STATUS_BADGE: Record<EventRow["status"], string> = {
  "نشط": "badgeGreen",
  "قريباً": "badgeBlue",
  "مكتمل": "badgeIndigo",
  "في انتظار الموافقة": "badgeAmber",
};

const TYPE_BADGE: Record<EventRow["type"], string> = {
  "تقني": "pillTech",
  "ثقافي": "pillCulture",
  "رياضي": "pillSport",
  "فني": "pillArt",
};

export default function EventCard({
  row,
  onView,
  onDelete,
  canDelete,
}: {
  row: EventRow;
  onView: (id: number) => void;
  onDelete: (id: number) => void;
  canDelete: boolean;
}) {
  return (
    <article className={styles.card}>
      <h3 className={styles.cardTitle}>{row.title}</h3>
      <p className={styles.cardSub}>
        <span className={styles.muted}>الخطة:</span> {row.plan}
      </p>

      <div className={styles.badgesRow}>
        <span className={styles[TYPE_BADGE[row.type] as keyof typeof styles]}>{row.type}</span>
        <span className={styles[STATUS_BADGE[row.status] as keyof typeof styles]}>{row.status}</span>
      </div>

      <div className={styles.metaList}>
        <div className={styles.metaItem}><CalendarDays size={16} /><span dir="ltr">{row.date}</span></div>
        <div className={styles.metaItem}><Clock size={16} /><span>{row.time}</span></div>
        <div className={styles.metaItem}><MapPin size={16} /><span>{row.place}</span></div>
        <div className={styles.metaItem}><Users size={16} /><span>{row.participants} مشارك</span></div>
        <div className={styles.metaItem}><DollarSign size={16} /><span>{row.cost}</span></div>
      </div>

      <div className={styles.cardActions}>
        <button className={styles.btnGhost} type="button" onClick={() => onView(row.id)}>
          <Eye size={16} />
          عرض التفاصيل
        </button>

        {canDelete && (
          <button className={styles.btnDanger} type="button" onClick={() => onDelete(row.id)}>
            <Trash2 size={16} />
            حذف
          </button>
        )}
      </div>
    </article>
  );
}