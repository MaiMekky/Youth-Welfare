"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  X,
  CalendarDays,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import styles from "./Notificationbell.module.css";

/* ─── Types ─── */
type ApiEvent = {
  event_id: number;
  title: string;
  description: string;
  st_date: string;
  end_date: string;
  location: string;
  status: string;
  type: string;
  cost: string;
  s_limit: number;
  faculty_id: number | null;
  dept_id: number;
};

type Notification = {
  id: string;
  event_id: number;
  title: string;
  subtitle: string;
  kind: "today" | "soon" | "new" | "rejected"; // ← add "rejected"
  daysUntil: number;
  date: string;
  read: boolean;
  timestamp: number;
};

/* ─── Helpers ─── */
function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function isNewEvent(dateStr: string): boolean {
  // Consider "new" if the event was created/registered in last 7 days
  // We use st_date as a proxy — events starting within next 30 days added recently
  // In real app you'd use a created_at field; we fake it with event_id ordering
  return false; // override per logic below
}

function fmt(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ar-EG", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function timeAgo(daysUntil: number): string {
  if (daysUntil === 0) return "اليوم";
  if (daysUntil === 1) return "غداً";
  if (daysUntil === 2) return "بعد يومين";
  if (daysUntil === 3) return "بعد 3 أيام";
  return `بعد ${daysUntil} أيام`;
}

/* ─── Storage helpers (persist read state) ─── */
const STORAGE_KEY = "notif_read_ids";
const DISMISSED_KEY = "notif_dismissed_ids";

function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {}
}

function getDismissedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveDismissedIds(ids: Set<string>) {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids]));
  } catch {}
}

/* ─── Build notifications from events ─── */function buildNotifications(events: ApiEvent[]): Notification[] {
  const notifs: Notification[] = [];
  const dismissed = getDismissedIds();

  const sorted = [...events].sort((a, b) => b.event_id - a.event_id);
  const newestIds = new Set(sorted.slice(0, 5).map((e) => e.event_id));

  events.forEach((ev) => {
    if (ev.status?.trim() === "ملغي") return;
    const days = getDaysUntil(ev.st_date);

    if (days >= 0 && days <= 3) {
      const id = `upcoming-${ev.event_id}`;
      if (!dismissed.has(id)) {
        notifs.push({
          id,
          event_id: ev.event_id,
          title: ev.title,
          subtitle: days === 0 ? "⚡ الفعالية تبدأ اليوم!" : `تبدأ ${timeAgo(days)} — ${fmt(ev.st_date)}`,
          kind: days === 0 ? "today" : "soon",
          daysUntil: days,
          date: ev.st_date,
          read: false,
          timestamp: new Date(ev.st_date).getTime(),
        });
      }
    }

    if (newestIds.has(ev.event_id) && days > 3) {
      const id = `new-${ev.event_id}`;
      if (!dismissed.has(id)) {
        notifs.push({
          id,
          event_id: ev.event_id,
          title: ev.title,
          subtitle: `فعالية جديدة · ${fmt(ev.st_date)}`,
          kind: "new",
          daysUntil: days,
          date: ev.st_date,
          read: false,
          timestamp: Date.now() - ev.event_id,
        });
      }
    }

    // ← NEW: rejected events
    if (ev.status?.trim() === "مرفوض") {
      const id = `rejected-${ev.event_id}`;
      if (!dismissed.has(id)) {
        notifs.push({
          id,
          event_id: ev.event_id,
          title: ev.title,
          subtitle: `تم رفض هذه الفعالية · ${fmt(ev.st_date)}`,
          kind: "rejected",
          daysUntil: 0,
          date: ev.st_date,
          read: false,
          timestamp: new Date(ev.st_date).getTime(),
        });
      }
    }
  });

  const kindOrder = { today: 0, soon: 1, new: 2, rejected: 3 }; // ← add rejected
  return notifs.sort(
    (a, b) => kindOrder[a.kind] - kindOrder[b.kind] || a.daysUntil - b.daysUntil
  );
}

/* ─── Notification Item ─── */
function NotifItem({
  notif,
  onRead,
  onDismiss,
  onClick,
}: {
  notif: Notification;
  onRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onClick: (event_id: number) => void;
}) {
 const icon =
  notif.kind === "today" ? (
    <AlertTriangle size={20} />
  ) : notif.kind === "soon" ? (
    <Clock size={20} />
  ) : notif.kind === "rejected" ? ( // ← add this
    <X size={20} />
  ) : (
    <Sparkles size={20} />
  );

  return (
    <div
      className={`${styles.notifItem} ${!notif.read ? styles.notifUnread : ""} ${
        styles[`notif_${notif.kind}`]
      }`}
      onClick={() => {
        onRead(notif.id);
        onClick(notif.event_id);
      }}
    >
      <div className={`${styles.notifIconWrap} ${styles[`icon_${notif.kind}`]}`}>
        {icon}
      </div>
      <div className={styles.notifContent}>
        <div className={styles.notifTitle}>{notif.title}</div>
        <div className={styles.notifSub}>{notif.subtitle}</div>
      </div>
      <div className={styles.notifActions}>
        {!notif.read && <span className={styles.unreadDot} />}
        <button
          className={styles.dismissBtn}
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(notif.id);
          }}
          aria-label="حذف الإشعار"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function NotificationBell({
  events,
}: {
  events: ApiEvent[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [animateIn, setAnimateIn] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  // Build notifications whenever events change
  useEffect(() => {
    const dismissed = getDismissedIds();
    setDismissedIds(dismissed);
    const read = getReadIds();
    setReadIds(read);

    const built = buildNotifications(events);
    setNotifications(
      built.map((n) => ({ ...n, read: read.has(n.id) }))
    );
  }, [events]);

  // Panel open animation + position calculation
  useEffect(() => {
    if (open) {
      // Calculate panel position from bell button's screen rect
      if (bellRef.current) {
        const rect = bellRef.current.getBoundingClientRect();
        const panelWidth = Math.min(400, window.innerWidth - 24);
        const spaceRight = window.innerWidth - rect.right;
        const spaceLeft  = rect.left;

        let left: number;
        if (spaceRight >= panelWidth + 12) {
          // enough room to the right of bell → align panel left edge with bell left
          left = rect.left;
        } else if (spaceLeft >= panelWidth + 12) {
          // enough room to the left → align panel right edge with bell right
          left = rect.right - panelWidth;
        } else {
          // center on screen
          left = (window.innerWidth - panelWidth) / 2;
        }

        // clamp so panel never goes off-screen
        left = Math.max(12, Math.min(left, window.innerWidth - panelWidth - 12));

        setPanelStyle({
          top: rect.bottom + 10,
          left,
          width: panelWidth,
        });
      }
      requestAnimationFrame(() => setAnimateIn(true));
    } else {
      setAnimateIn(false);
    }
  }, [open]);

  // Click outside to close
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setReadIds((prev) => {
      const next = new Set([...prev, id]);
      saveReadIds(next);
      return next;
    });
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setDismissedIds((prev) => {
      const next = new Set([...prev, id]);
      saveDismissedIds(next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    const ids = notifications.map((n) => n.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setReadIds((prev) => {
      const next = new Set([...prev, ...ids]);
      saveReadIds(next);
      return next;
    });
  }, [notifications]);

const todayCount    = notifications.filter((n) => n.kind === "today").length;
const soonCount     = notifications.filter((n) => n.kind === "soon").length;
const newCount      = notifications.filter((n) => n.kind === "new").length;
const rejectedCount = notifications.filter((n) => n.kind === "rejected").length; // ← add
  return (
    <div className={styles.wrapper}>
      {/* ── Bell Button ── */}
      <button
        ref={bellRef}
        className={`${styles.bellBtn} ${open ? styles.bellActive : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="الإشعارات"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Notification Panel ── */}
      {open && (
        <>
          <div className={styles.backdrop} onClick={() => setOpen(false)} />
          <div
            ref={panelRef}
            className={`${styles.panel} ${animateIn ? styles.panelIn : ""}`}
            style={panelStyle}
          >
            {/* Header */}
            <div className={styles.panelHeader}>
              <div className={styles.panelHeaderLeft}>
                <h3 className={styles.panelTitle}>الإشعارات</h3>
                {unreadCount > 0 && (
                  <span className={styles.unreadBadge}>{unreadCount} جديد</span>
                )}
              </div>
              <div className={styles.panelHeaderRight}>
                {unreadCount > 0 && (
                  <button className={styles.markAllBtn} onClick={markAllRead}>
                    <CheckCircle2 size={14} />
                    تعليم الكل كمقروء
                  </button>
                )}
                <button
                  className={styles.closeBtn}
                  onClick={() => setOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Summary pills */}
            {notifications.length > 0 && (
              <div className={styles.summaryRow}>
                {todayCount > 0 && (
                  <span className={`${styles.pill} ${styles.pillToday}`}>
                    <AlertTriangle size={12} />
                    {todayCount} اليوم
                  </span>
                )}
                {soonCount > 0 && (
                  <span className={`${styles.pill} ${styles.pillSoon}`}>
                    <Clock size={12} />
                    {soonCount} قريباً
                  </span>
                )}
                {newCount > 0 && (
                  <span className={`${styles.pill} ${styles.pillNew}`}>
                    <Sparkles size={12} />
                    {newCount} جديدة
                  </span>
                )}
                {rejectedCount > 0 && (
                  <span className={`${styles.pill} ${styles.pillToday}`}>
                    <X size={12} />
                    {rejectedCount} مرفوضة
                  </span>
                )}
              </div>
            )}

            {/* Notification list */}
            <div className={styles.notifList}>
              {notifications.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <Bell size={32} />
                  </div>
                  <p className={styles.emptyTitle}>لا توجد إشعارات</p>
                  <p className={styles.emptySub}>
                    ستظهر هنا الفعاليات القادمة والجديدة
                  </p>
                </div>
              ) : (
                <>
                  {/* Today section */}
                  {notifications.filter((n) => n.kind === "today").length > 0 && (
                    <div className={styles.section}>
                      <div className={styles.sectionLabel}>
                        <span className={styles.sectionDotRed} />
                        اليوم
                      </div>
                      {notifications
                        .filter((n) => n.kind === "today")
                        .map((n) => (
                          <NotifItem
                            key={n.id}
                            notif={n}
                            onRead={markRead}
                            onDismiss={dismiss}
                            onClick={(id) => {
                              setOpen(false);
                              sessionStorage.setItem("eventDetails_from", window.location.pathname);
                              router.push(`/uni-level-scouts/uni-level-activities/${id}`);
                            }}
                          />
                        ))}
                    </div>
                  )}

                  {/* Soon section */}
                  {notifications.filter((n) => n.kind === "soon").length > 0 && (
                    <div className={styles.section}>
                      <div className={styles.sectionLabel}>
                        <span className={styles.sectionDotGold} />
                        خلال 3 أيام
                      </div>
                      {notifications
                        .filter((n) => n.kind === "soon")
                        .map((n) => (
                          <NotifItem
                            key={n.id}
                            notif={n}
                            onRead={markRead}
                            onDismiss={dismiss}
                            onClick={(id) => {
                              setOpen(false);
                              sessionStorage.setItem("eventDetails_from", window.location.pathname);
                              router.push(`/uni-level-scouts/uni-level-activities/${id}`);
                            }}
                          />
                        ))}
                    </div>
                  )}

                  {/* New events section */}
                  {notifications.filter((n) => n.kind === "new").length > 0 && (
                    <div className={styles.section}>
                      <div className={styles.sectionLabel}>
                        <span className={styles.sectionDotBlue} />
                        فعاليات جديدة
                      </div>
                      {notifications
                        .filter((n) => n.kind === "new")
                        .map((n) => (
                          <NotifItem
                            key={n.id}
                            notif={n}
                            onRead={markRead}
                            onDismiss={dismiss}
                            onClick={(id) => {
                              setOpen(false);
                              sessionStorage.setItem("eventDetails_from", window.location.pathname);
                              router.push(`/uni-level-scouts/uni-level-activities/${id}`);
                            }}
                          />
                        ))}
                    </div>
                  )}
                </>
              )}
              {notifications.filter((n) => n.kind === "rejected").length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionLabel}>
                    <span className={styles.sectionDotRed} />
                    مرفوضة
                  </div>
                  {notifications
                    .filter((n) => n.kind === "rejected")
                    .map((n) => (
                      <NotifItem
                        key={n.id}
                        notif={n}
                        onRead={markRead}
                        onDismiss={dismiss}
                        onClick={(id) => {
                          setOpen(false);
                          sessionStorage.setItem("eventDetails_from", window.location.pathname);
                          router.push(`/uni-level-scouts/uni-level-activities/${id}`);
                        }}
                      />
                    ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className={styles.panelFooter}>
                <button
                  className={styles.viewAllBtn}
                  onClick={() => {
                    setOpen(false);
                    router.push("/uni-level-scouts/uni-level-activities");
                  }}
                >
                  عرض كل الفعاليات
                  <ChevronLeft size={16} />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}