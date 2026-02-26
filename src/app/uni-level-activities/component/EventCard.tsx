"use client";

import React from "react";
import styles from "../styles/EventsPage.module.css";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

export type ChipVariant = "success" | "primary" | "info" | "purple" | "danger";

export type EventItem = {
  id: number;
  title: string;
  planName: string;
  statusLabel: string;
  statusVariant: ChipVariant;
  categoryLabel: string;
  categoryVariant: ChipVariant;
  date: string;
  time: string;
  location: string;
  participantsText: string;
  priceText: string;

  // ✅ جديد
  isActive: boolean;
};

function Chip({ label, variant }: { label: string; variant: ChipVariant }) {
  return <span className={`${styles.chip} ${styles[variant]}`}>{label}</span>;
}

export default function EventCard({
  item,
  onView,
  onEdit,
  onDelete,
  onActiveChange,
  busy,
}: {
  item?: EventItem;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onActiveChange?: (id: number, nextActive: boolean) => void;
  busy?: boolean;
}) {
  if (!item) return null;

  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <div className={styles.topRow}>
          <div className={styles.titleBox}>
            <h3 className={styles.title}>{item.title}</h3>
            <p className={styles.plan}>{item.planName}</p>
          </div>

          {/* ✅ السويتش: نشط / غير نشط */}
          <div className={styles.approvalWrap}>
            <span className={styles.approvalLabel}>
              {item.isActive ? "نشط" : "غير نشط"}
            </span>

            <label className={styles.switch} aria-label="حالة النشاط">
              <input
                type="checkbox"
                checked={item.isActive}
                disabled={busy}
                onChange={(e) => onActiveChange?.(item.id, e.target.checked)}
              />
              <span className={styles.slider} />
            </label>
          </div>
        </div>

        <div className={styles.chips}>
          <Chip label={item.statusLabel} variant={item.statusVariant} />
          <Chip label={item.categoryLabel} variant={item.categoryVariant} />
        </div>
      </div>

      <div className={styles.meta}>
       <div className={styles.metaRow}>
        <CalendarDays size={18} />
        <span dir="ltr">{item.date}</span>
        <span className={styles.dot}>•</span>
        <CalendarDays size={18} />
        <span dir="ltr">{item.time}</span>
      </div>

        <div className={styles.metaRow}>
          <MapPin size={18} />
          <span>{item.location}</span>
        </div>

        <div className={styles.metaRow}>
          <Users size={18} />
          <span>{item.participantsText}</span>
        </div>

        <div className={styles.metaRow}>
          <DollarSign size={18} />
          <span>{item.priceText}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.danger} onClick={() => onDelete(item.id)}>
          <Trash2 size={18} />
          الغاء
        </button>

        <button className={styles.secondary} onClick={() => onEdit(item.id)}>
          <Pencil size={18} />
          تعديل
        </button>

        <button className={styles.secondary} onClick={() => onView(item.id)}>
          <Eye size={18} />
          عرض التفاصيل
        </button>
      </div>
    </article>
  );
}