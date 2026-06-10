"use client";

import React from "react";
import styles from "../styles/EventsPage.module.css";
import { CalendarDays, MapPin, Users, DollarSign, Eye, Pencil, Trash2, CheckCircle2, AlertTriangle, UserPlus } from "lucide-react";

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
  faculty_id: number | null;
  dept_id: number;
  hideToggle?: boolean;
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


function canAcceptMembersBeforeEvent(startDateStr: string): boolean {
  if (!startDateStr) return false;
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const start = new Date(startDateStr);
    start.setHours(0, 0, 0, 0);
    const diffMs = start.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    // Can join only if event is at least 3 days away
    return diffDays >= 3;
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
  onJoinEvent,
  busy,
  hideToggle,
}: {
  item?: EventItem;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onActiveChange?: (id: number, nextActive: boolean) => void;
  onMarkCompleted?: (id: number) => void;
  onJoinEvent?: (id: number) => void;
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

  // Check if event is university-level (type is "خارجي" which displays as "على مستوى الجامعة")
  const isUniversityLevel = item.categoryLabel === "خارجي";
  
  // Check if we can still accept members (at least 3 days before event starts)
  const canJoinEvent = isUniversityLevel && canAcceptMembersBeforeEvent(item.date) && isAccepted && !isPastEnd;

  // Days elapsed since end_date (0 = ended today, 1 = 1 day ago, etc.)
  const elapsed = daysSinceEnd(item.time);

  // Hide edit & cancel when: cancelled, rejected, or end date has passed
  const hideEditDelete = isCancelled || isRejected || isPastEnd;

  // Show "إتمام الفعالية" only when:
  //   • faculty_id is present (dept events are hidden from fac admin)
  //   • status is مقبول
  //   • end date has passed (no time restriction)
  const showMarkCompleted =
    item.faculty_id !== null &&
    isAccepted &&
    isPastEnd &&
    elapsed >= 0;

  // Urgency level for the warning strip
  const isUrgent = elapsed <= 3;

  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <div className={styles.topRow}>
          <div className={styles.titleBox}>
            <h3 className={styles.title}>{item.title}</h3>
            <p className={styles.plan}>{item.planName}</p>
          </div>

          {!hideToggle && isAccepted && (
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

      {/* ── Completion warning strip ── */}
      {/* {showMarkCompleted && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            margin: "8px 0 0",
            padding: "8px 12px",
            borderRadius: "8px",
            fontSize: "0.82rem",
            fontWeight: 600,
            background: elapsed === 0
              ? "#FEF2F2"
              : isUrgent
              ? "#FFFBEB"
              : "#F0FDF4",
            color: elapsed === 0
              ? "#DC2626"
              : isUrgent
              ? "#B45309"
              : "#15803D",
            border: `1px solid ${
              elapsed === 0 ? "#FECACA" : isUrgent ? "#FDE68A" : "#BBF7D0"
            }`,
          }}
        >
          <AlertTriangle size={15} />
          {elapsed === 0
            ? "⛔ تنتهي اليوم — يرجى إتمام الفعالية"
            : isUrgent
            ? `⚠ انتهت منذ ${elapsed} ${elapsed === 1 ? "يوم" : "أيام"} — تحتاج للإتمام`
            : `انتهت منذ ${elapsed} ${elapsed === 1 ? "يوم" : "أيام"} — تحتاج للإتمام`}
        </div>
      )} */}

      <div className={styles.actions}>
        <button className={styles.secondary} onClick={() => onView(item.id)}>
          <Eye size={18} />
          عرض التفاصيل
        </button>

        {canJoinEvent && onJoinEvent && (
          <button 
            className={styles.joinBtn}
            onClick={() => onJoinEvent(item.id)}
            disabled={busy}
          >
            <UserPlus size={18} />
            الانضمام للفعالية
          </button>
        )}

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
                  background: elapsed === 0
                    ? "rgba(220,38,38,0.18)"
                    : isUrgent
                    ? "rgba(180,83,9,0.15)"
                    : "rgba(21,128,61,0.15)",
                  color: elapsed === 0 ? "#DC2626" : isUrgent ? "#B45309" : "#15803D",
                }}
              >
                {elapsed === 0
                  ? "اليوم"
                  : elapsed === 1
                  ? "منذ يوم"
                  : `منذ ${elapsed} أيام`}
              </span>
            )}
          </button>
        )}
      </div>
    </article>
  );
}