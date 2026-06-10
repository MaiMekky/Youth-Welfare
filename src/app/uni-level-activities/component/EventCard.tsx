"use client";

import React from "react";
import styles from "../styles/EventsPage.module.css";
import { CalendarDays, MapPin, Users, DollarSign, Eye, Pencil, Trash2, CheckCircle2 } from "lucide-react";

export type ChipVariant = "success" | "primary" | "info" | "purple" | "danger" | "warning" | "orange" | "teal" | "rose" | "accepted" | "tentative" | "pending" | "completed" | "expired" | "rejected" | "cancelled";

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
  isActive: boolean;
  hideToggle?: boolean;
  facultyName?: string;  
};
function Chip({ label, variant }: { label: string; variant: ChipVariant }) {
  return <span className={`${styles.chip} ${styles[variant]}`}>{label}</span>;
}

/** Maps raw API type values to user-facing display labels */
function mapCategoryLabel(raw: string): string {
  if (raw === "داخلي") return "على مستوى الكلية";
  if (raw === "خارجي") return "على مستوى الجامعة";
  return raw;
}

/**
 * Maps status label for display.
 * موافقة مبدئية → منتظر
 */
function mapStatusLabel(raw: string): string {
  if (raw === "موافقة مبدئية") return "منتظر";
  return raw;
}

/** Check if end_date has passed */
function isPastEndDate(endDateStr: string): boolean {
  if (!endDateStr) return false;
  try {
    return new Date(endDateStr) <= new Date();
  } catch {
    return false;
  }
}

/**
 * Returns how many full days have elapsed since end_date.
 * Returns -1 if end date is in the future or invalid.
 */
function daysSinceEnd(endDateStr: string): number {
  if (!endDateStr) return -1;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDateStr);
    end.setHours(0, 0, 0, 0);
    const diff = Math.floor((today.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : -1;
  } catch {
    return -1;
  }
}

export default function EventCard({
  item,
  onView,
  onEdit,
  onDelete,
  onActiveChange,
  onMarkCompleted,
  busy,
  hideToggle,
}: {
  item?: EventItem;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onActiveChange?: (id: number, nextActive: boolean) => void;
  onMarkCompleted?: (id: number) => void;
  busy?: boolean;
  hideToggle?: boolean; 
}) {
  if (!item) return null;

  const displayCategory = mapCategoryLabel(item.categoryLabel);
  const displayStatus   = mapStatusLabel(item.statusLabel);

  const isCancelled = item.statusLabel === "ملغي";
  const isRejected  = item.statusLabel === "مرفوض";
  const isPastEnd   = isPastEndDate(item.time);
  const isAccepted  = item.statusLabel === "مقبول";
  const isCompleted = item.statusLabel === "مكتمل";

  // Days elapsed since end_date (0 = ended today, 1 = 1 day ago, etc.)
  const elapsed     = daysSinceEnd(item.time);

  // Hide edit & cancel when: cancelled, rejected, or end date has passed
  const hideEditDelete = isCancelled || isRejected || isPastEnd || isCompleted;

  // Show "إتمام الفعالية" anytime when:
  //   • hideToggle is false (university-level events only)
  //   • status is مقبول
  //   • end date has passed
  const showMarkCompleted =
    !hideToggle &&
    isAccepted &&
    isPastEnd;

  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <div className={styles.topRow}>
          <div className={styles.titleBox}>
            <h3 className={styles.title}>{item.title}</h3>
            <p className={styles.plan}>{item.planName}</p>
          </div>

            {!hideToggle  && item.statusLabel === "مقبول" && (
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
        )}
        </div>

        <div className={styles.chips}>
          <Chip label={displayStatus} variant={item.statusVariant} />
          <Chip label={displayCategory} variant={item.categoryVariant} />
              {item.facultyName && (
              <div className={styles.facultyTag}>
                {item.facultyName}
              </div>
            )}
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

         <button className={styles.secondary} onClick={() => onView(item.id)}>
          <Eye size={18} />
          عرض التفاصيل
        </button>
        {!hideToggle && !hideEditDelete && (
          <>
            <button className={styles.secondary} onClick={() => onEdit(item.id)}>
              <Pencil size={18} />
              تعديل
            </button>

            <button className={styles.danger} onClick={() => onDelete(item.id)}>
              <Trash2 size={18} />
              الغاء
            </button>
          </>
        )}

        {showMarkCompleted && (
          <button
            className={styles.completeBtn}
            onClick={() => onMarkCompleted?.(item.id)}
            disabled={busy}
          >
            <CheckCircle2 size={18} />
            إتمام الفعالية
            {elapsed >= 0 && (
              <span
                style={{
                  marginRight: "6px",
                  padding: "1px 7px",
                  borderRadius: "99px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  background: "rgba(21,128,61,0.15)",
                  color: "#15803D",
                }}
              >
                {elapsed === 0 ? "انتهى اليوم" : `منذ ${elapsed} ${elapsed === 1 ? "يوم" : "أيام"}`}
              </span>
            )}
          </button>
        )}
     
      </div>
    </article>
  );
}