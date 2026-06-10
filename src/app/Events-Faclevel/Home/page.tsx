"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
  Bell,
  ChevronLeft,
  Activity,
  CalendarCheck,
  Plus,
  LayoutDashboard,
  RefreshCw,
  Tag,
  AlertTriangle,
} from "lucide-react";
import styles from "./page.module.css";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { getSessionMeta } from "@/utils/cookieHelpers";
import NotificationBell from "./Notificationbell";

const API_URL = getBaseUrl();

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

type ProcessedEvent = ApiEvent & {
  daysUntil: number;
  isUrgent: boolean;
  isToday: boolean;
  isPast: boolean;
};

type StatCard = {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent: "gold" | "green" | "navy" | "red";
  sub?: string;
};

/* ─── Helpers ─── */
function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getDaysOverEnd(endDateStr: string): number {
  if (!endDateStr) return -1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDateStr);
  end.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff : -1;
}

function fmtShort(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ar-EG", { month: "short", day: "numeric" });
}

function isApproved(s: string) {
  const k = s?.trim();
  return k === "مقبول" || k?.toLowerCase() === "approved";
}

function isPending(s: string) {
  const k = s?.trim();
  return k === "موافقة مبدئية" || k === "منتظر" || k?.toLowerCase() === "pending";
}

async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await authFetch(`${API_URL}${path}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/* ─── Upcoming Event Row ─── */
function UpcomingRow({ ev, onClick }: { ev: ProcessedEvent; onClick: () => void }) {
  const urgencyClass = ev.isToday
    ? styles.urgencyToday
    : ev.isUrgent
    ? styles.urgencySoon
    : styles.urgencyNormal;
  return (
    <button className={styles.upcomingRow} onClick={onClick}>
      <div className={`${styles.upcomingDot} ${urgencyClass}`} />
      <div className={styles.upcomingDateBox}>
        <span className={styles.upcomingDateDay}>
          {new Date(ev.st_date).toLocaleDateString("ar-EG", { day: "numeric" })}
        </span>
        <span className={styles.upcomingDateMonth}>
          {new Date(ev.st_date).toLocaleDateString("ar-EG", { month: "short" })}
        </span>
      </div>
      <div className={styles.upcomingInfo}>
        <div className={styles.upcomingTitle}>{ev.title}</div>
        <div className={styles.upcomingMeta}>
          {ev.location && (
            <span className={styles.upcomingMetaItem}>
              <MapPin size={12} /> {ev.location}
            </span>
          )}
          {ev.type && (
            <span className={styles.upcomingMetaItem}>
              <Tag size={12} /> {ev.type}
            </span>
          )}
        </div>
      </div>
      <div className={styles.upcomingRight}>
        {ev.status?.trim() === "مرفوض" ? (
          <span style={{
            padding: "4px 10px",
            borderRadius: 999,
            background: "#FEF2F2",
            color: "#B42318",
            fontWeight: 900,
            fontSize: 12,
            border: "1px solid #FECACA",
            whiteSpace: "nowrap",
          }}>
            مرفوض
          </span>
        ) : ev.isToday ? (
          <span className={styles.badgeToday}>اليوم</span>
        ) : ev.daysUntil === 1 ? (
          <span className={styles.badgeSoon}>غداً</span>
        ) : ev.isUrgent ? (
          <span className={styles.badgeSoon}>{ev.daysUntil} أيام</span>
        ) : (
          <span className={styles.badgeNormal}>{fmtShort(ev.st_date)}</span>
        )}
        <ChevronLeft size={16} className={styles.chevron} />
      </div>
    </button>
  );
}

/* ─── Stat Card ─── */
function StatCardComp({ card }: { card: StatCard }) {
  return (
    <div className={`${styles.statCard} ${styles[`accent_${card.accent}`]}`}>
      <div className={styles.statIconWrap}>{card.icon}</div>
      <div className={styles.statBody}>
        <div className={styles.statValue}>{card.value}</div>
        <div className={styles.statLabel}>{card.label}</div>
        {card.sub && <div className={styles.statSub}>{card.sub}</div>}
      </div>
    </div>
  );
}

/* ─── Status Bar ─── */
function StatusBreakdown({ events }: { events: ApiEvent[] }) {
  if (!events.length) return null;

  const approved = events.filter((e) => isApproved(e.status)).length;
  const pending = events.filter((e) => isPending(e.status)).length;
  const rejected = events.filter(
    (e) => e.status?.trim() === "مرفوض" || e.status?.toLowerCase() === "rejected"
  ).length;
  const other = events.length - approved - pending - rejected;

  const segments = [
    { label: "مقبولة", count: approved, color: "#10B981", bg: "#ECFDF5" },
    { label: "قيد المراجعة", count: pending, color: "#C49B3A", bg: "#FFFBEB" },
    { label: "مرفوضة", count: rejected, color: "#EF4444", bg: "#FEF2F2" },
    { label: "أخرى", count: other, color: "#6B7280", bg: "#F3F4F6" },
  ].filter((s) => s.count > 0);

  return (
    <div className={styles.statusCard}>
      <div className={styles.statusHeader}>
        <Activity size={17} />
        <span>توزيع حالات الفعاليات</span>
      </div>
      <div className={styles.statusRows}>
        {segments.map((seg) => (
          <div key={seg.label} className={styles.statusRow}>
            <div className={styles.statusLabelWrap}>
              <span className={styles.statusDot} style={{ background: seg.color }} />
              <span className={styles.statusLabel}>{seg.label}</span>
            </div>
            <div className={styles.statusBarTrack}>
              <div
                className={styles.statusBarFill}
                style={{
                  width: `${(seg.count / events.length) * 100}%`,
                  background: seg.color,
                }}
              />
            </div>
            <span className={styles.statusCount} style={{ color: seg.color, background: seg.bg }}>
              {seg.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function HomePage() {
  const router = useRouter();
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState("");
  const [facultyName, setFacultyName] = useState("");

  useEffect(() => {
    const meta = getSessionMeta();
    if (meta) {
      setUserName(meta.name || "");
      setFacultyName(meta.faculty_name || "");
    }
  }, []);

  const fetchEvents = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    const data = await apiFetch<ApiEvent[]>("/api/event/get-events/");
    if (isRefresh) setRefreshing(false);
    else setLoading(false);
    if (data && Array.isArray(data))
      setEvents(data.filter((e) => e.status?.trim() !== "ملغي"));
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
  
const processed = useMemo<ProcessedEvent[]>(() => {
  return events
    .map((e) => {
      const daysUntil = getDaysUntil(e.st_date);
      return {
        ...e,
        daysUntil,
        isToday: daysUntil === 0,
        isUrgent: daysUntil >= 0 && daysUntil <= 3,
        isPast: daysUntil < 0,
      };
    })
    .sort((a, b) => new Date(a.st_date).getTime() - new Date(b.st_date).getTime());
}, [events]);

  // Upcoming events (within 30 days) + events needing completion
  const upcomingEvents = useMemo(() => {
  return processed.filter((e) => !e.isPast && e.daysUntil <= 30).slice(0, 8);
}, [processed]);

 const stats = useMemo<StatCard[]>(() => {
  const total    = events.length;
  const approved = events.filter((e) => isApproved(e.status)).length;
  const pending  = events.filter((e) => isPending(e.status)).length;
  const rejected = events.filter((e) => e.status?.trim() === "مرفوض").length;

  return [
    { label: "إجمالي الفعاليات",    value: total,    icon: <CalendarDays size={22} />, accent: "navy"  as const, sub: "كل الفعاليات المسجلة" },
    { label: "الفعاليات المقبولة",   value: approved, icon: <CheckCircle2 size={22} />, accent: "green" as const, sub: "تمت الموافقة عليها" },
    { label: "في انتظار المراجعة",   value: pending,  icon: <Clock size={22} />,        accent: "gold"  as const, sub: "تحتاج إجراء" },
    { label: "الفعاليات المرفوضة",   value: rejected, icon: <TrendingUp size={22} />,   accent: "red"   as const, sub: "تم رفضها" },
  ];
}, [events]);

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? "صباح الخير" : greetingHour < 18 ? "مساء الخير" : "مساء النور";

  return (
    <div className={styles.page}>

      {/* ── Hero Header ── */}
      <div className={styles.heroHeader}>
        <div className={styles.heroBg} aria-hidden="true" />

        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <p className={styles.greeting}>{greeting}،</p>
            <h1 className={styles.heroTitle}>
              {userName || "مدير النظام"} <span className={styles.wave}>👋</span>
            </h1>
            <p className={styles.heroSub}>
              مرحباً بك في لوحة التحكم — إليك ملخص فعاليات اليوم
            </p>
            {facultyName && (
              <span className={styles.facultyPill}>{facultyName}</span>
            )}
          </div>

          <div className={styles.heroActions}>
            {/* Refresh */}
            <button
              className={`${styles.refreshBtn} ${refreshing ? styles.refreshing : ""}`}
              onClick={() => fetchEvents(true)}
              aria-label="تحديث البيانات"
              title="تحديث"
            >
              <RefreshCw size={18} />
            </button>

            {/* Notification Bell */}
            <NotificationBell events={events} />

            {/* Date Badge */}
            <div className={styles.heroBadge}>
              <CalendarCheck size={24} />
              <div>
                <div className={styles.heroBadgeDate}>
                  {new Date().toLocaleDateString("ar-EG", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </div>
                <div className={styles.heroBadgeSub}>اليوم</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className={styles.statsGrid}>
        {stats.map((card, i) => (
          <div
            key={card.label}
            className={styles.statCardWrap}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <StatCardComp card={card} />
          </div>
        ))}
      </div>

      {/* ── Main Content ── */}
      <div className={styles.mainGrid}>

        {/* ── Upcoming Events Panel ── */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitleWrap}>
              <Bell size={17} className={styles.panelIcon} />
              <h2 className={styles.panelTitle}>الفعاليات القادمة</h2>
            </div>
            <span className={styles.panelCount}>{upcomingEvents.length}</span>
          </div>

          {loading ? (
            <div className={styles.loadingWrap}>
              <div className={styles.spinner} />
              <p>جاري التحميل…</p>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className={styles.emptyWrap}>
              <CalendarDays size={40} opacity={0.3} />
              <p>لا توجد فعاليات قادمة خلال 30 يوماً</p>
            </div>
          ) : (
            <div className={styles.upcomingList}>
              {upcomingEvents.map((ev) => (
                <UpcomingRow
                  key={ev.event_id}
                  ev={ev}
                  onClick={() => {
                    sessionStorage.setItem("eventDetails_from", "/Events-Faclevel/Home");
                    router.push(`/Events-Faclevel/${ev.event_id}`);
                  }}
                />
              ))}
            </div>
          )}

          {!loading && upcomingEvents.length > 0 && (
            <div className={styles.panelFooter}>
              <button
                className={styles.viewAllBtn}
                onClick={() => router.push("/Events-Faclevel")}
              >
                عرض كل الفعاليات
                <ChevronLeft size={15} />
              </button>
            </div>
          )}
        </div>

        {/* ── Side Panel ── */}
        <div className={styles.sidePanel}>

          {/* Status Breakdown */}
          <StatusBreakdown events={events} />

          {/* Quick Actions */}
          <div className={styles.quickActionsCard}>
            <div className={styles.quickHeader}>
              <LayoutDashboard size={17} />
              <span>إجراءات سريعة</span>
            </div>
            <div className={styles.quickActionsList}>
              <button
                className={styles.quickActionBtn}
                onClick={() => router.push("/Events-Faclevel")}
              >
                <CalendarDays size={16} />
                <span>إدارة الفعاليات</span>
              </button>
              <button
                className={`${styles.quickActionBtn} ${styles.quickActionBtnGold}`}
                onClick={() => router.push("/Events-Faclevel/create")}
              >
                <Plus size={16} />
                <span>إنشاء فعالية جديدة</span>
              </button>
            </div>
          </div>

          {/* Summary mini card */}
          <div className={styles.summaryMiniCard}>
            <div className={styles.summaryMiniRow}>
              <span className={styles.summaryMiniLabel}>فعاليات اليوم</span>
              <span className={styles.summaryMiniVal}>
                {processed.filter((e) => e.isToday).length}
              </span>
            </div>
            <div className={styles.summaryDivider} />
            <div className={styles.summaryMiniRow}>
              <span className={styles.summaryMiniLabel}>فعاليات ماضية</span>
              <span className={`${styles.summaryMiniVal} ${styles.summaryPast}`}>
                {processed.filter((e) => e.isPast).length}
              </span>
            </div>
            <div className={styles.summaryDivider} />
            <div className={styles.summaryMiniRow}>
              <span className={styles.summaryMiniLabel}>فعاليات قادمة</span>
              <span className={`${styles.summaryMiniVal} ${styles.summaryFuture}`}>
                {processed.filter((e) => !e.isPast).length}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}