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
  History,
  CalendarClock,
  SunMedium,
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
        {ev.isToday ? (
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

/* ─── 1. Status Breakdown Card ─── */
function StatusBreakdown({ events }: { events: ApiEvent[] }) {
  const segments = useMemo(() => {
    if (!events.length) return [];
    const approved = events.filter((e) => isApproved(e.status)).length;
    const pending  = events.filter((e) => isPending(e.status)).length;
    const rejected = events.filter(
      (e) => e.status?.trim() === "مرفوض" || e.status?.toLowerCase() === "rejected"
    ).length;
    const other = events.length - approved - pending - rejected;

    return [
      { label: "مقبولة",       count: approved, color: "#10B981", bg: "#ECFDF5" },
      { label: "قيد المراجعة", count: pending,  color: "#C49B3A", bg: "#FFFBEB" },
      { label: "مرفوضة",       count: rejected, color: "#EF4444", bg: "#FEF2F2" },
      { label: "أخرى",         count: other,    color: "#6B7280", bg: "#F3F4F6" },
    ].filter((s) => s.count > 0);
  }, [events]);

  return (
    <div className={styles.sideCard}>
      <div className={styles.sideCardHeader}>
        <Activity size={17} />
        <span>توزيع حالات الفعاليات</span>
      </div>

      {!events.length ? (
        <div className={styles.sideCardEmpty}>
          <Activity size={28} opacity={0.2} />
          <p>لا توجد بيانات</p>
        </div>
      ) : (
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
              <span
                className={styles.statusCount}
                style={{ color: seg.color, background: seg.bg }}
              >
                {seg.count}
              </span>
            </div>
          ))}

          {/* Stacked progress strip */}
          <div className={styles.progressStrip}>
            {segments.map((seg) => (
              <div
                key={seg.label}
                className={styles.progressStripSeg}
                style={{
                  width: `${(seg.count / events.length) * 100}%`,
                  background: seg.color,
                }}
                title={`${seg.label}: ${seg.count}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── 2. Today / Past / Future Summary Card ─── */
function EventsSummaryCard({ processed }: { processed: ProcessedEvent[] }) {
  const todayEvs  = processed.filter((e) => e.isToday);
  const pastEvs   = processed.filter((e) => e.isPast);
  const futureEvs = processed.filter((e) => !e.isPast && !e.isToday);

  const rows = [
    {
      label:  "فعاليات اليوم",
      count:  todayEvs.length,
      icon:   <SunMedium size={16} />,
      color:  "#EF4444",
      bg:     "#FEF2F2",
      border: "#EF4444",
      subtitle: todayEvs.length
        ? todayEvs.slice(0, 2).map((e) => e.title).join("، ")
        : "لا توجد فعاليات اليوم",
    },
    {
      label:  "فعاليات ماضية",
      count:  pastEvs.length,
      icon:   <History size={16} />,
      color:  "#6B7280",
      bg:     "#F3F4F6",
      border: "#9BAFC4",
      subtitle: pastEvs.length
        ? `آخرها: ${fmtShort(pastEvs[pastEvs.length - 1]?.st_date)}`
        : "لا توجد فعاليات ماضية",
    },
    {
      label:  "فعاليات قادمة",
      count:  futureEvs.length,
      icon:   <CalendarClock size={16} />,
      color:  "#10B981",
      bg:     "#ECFDF5",
      border: "#10B981",
      subtitle: futureEvs.length
        ? `أقربها: ${fmtShort(futureEvs[0]?.st_date)}`
        : "لا توجد فعاليات قادمة",
    },
  ];

  return (
    <div className={styles.sideCard}>
      <div className={styles.sideCardHeader}>
        <CalendarDays size={17} />
        <span>ملخص الفعاليات</span>
      </div>
      <div className={styles.summaryRows}>
        {rows.map((row) => (
          <div
            key={row.label}
            className={styles.summaryRow}
            style={{ borderRightColor: row.border }}
          >
            <div className={styles.summaryRowLeft}>
              <div
                className={styles.summaryRowIcon}
                style={{ background: row.bg, color: row.color }}
              >
                {row.icon}
              </div>
              <div className={styles.summaryRowText}>
                <span className={styles.summaryRowLabel}>{row.label}</span>
                <span className={styles.summaryRowSub}>{row.subtitle}</span>
              </div>
            </div>
            <span
              className={styles.summaryRowCount}
              style={{ color: row.color, background: row.bg }}
            >
              {row.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── 3. Quick Actions Card ─── */
function QuickActionsCard() {
  const router = useRouter();
  return (
    <div className={styles.sideCard}>
      <div className={styles.sideCardHeader}>
        <LayoutDashboard size={17} />
        <span>إجراءات سريعة</span>
      </div>
      <div className={styles.quickActionsList}>
        <button
          className={styles.quickActionBtn}
          onClick={() => router.push("/uni-level-scouts/uni-level-activities")}
        >
          <CalendarDays size={16} />
          <span>إدارة الفعاليات</span>
        </button>
        <button
          className={`${styles.quickActionBtn} ${styles.quickActionBtnGold}`}
          onClick={() => router.push("/uni-level-scouts/uni-level-activities/create")}
        >
          <Plus size={16} />
          <span>إنشاء فعالية جديدة</span>
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function HomePage() {
  const router = useRouter();
  const [events,     setEvents]     = useState<ApiEvent[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName,   setUserName]   = useState("");
  const [facultyName,setFacultyName]= useState("");

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
    if (data && Array.isArray(data)) setEvents(data);
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const processed = useMemo<ProcessedEvent[]>(() => {
    return events
      .map((e) => {
        const daysUntil = getDaysUntil(e.st_date);
        return {
          ...e,
          daysUntil,
          isToday:  daysUntil === 0,
          isUrgent: daysUntil >= 0 && daysUntil <= 3,
          isPast:   daysUntil < 0,
        };
      })
      .sort((a, b) => new Date(a.st_date).getTime() - new Date(b.st_date).getTime());
  }, [events]);

  const upcomingEvents = useMemo(
    () => processed.filter((e) => !e.isPast && e.daysUntil <= 30).slice(0, 8),
    [processed]
  );

  const stats = useMemo<StatCard[]>(() => {
    const total     = events.length;
    const approved  = events.filter((e) => isApproved(e.status)).length;
    const pending   = events.filter((e) => isPending(e.status)).length;
    const upcoming7 = processed.filter((e) => !e.isPast && e.daysUntil <= 7).length;

    return [
      {
        label: "إجمالي الفعاليات",
        value: total,
        icon:  <CalendarDays size={22} />,
        accent: "navy" as const,
        sub:   "كل الفعاليات المسجلة",
      },
      {
        label: "الفعاليات المقبولة",
        value: approved,
        icon:  <CheckCircle2 size={22} />,
        accent: "green" as const,
        sub:   "تمت الموافقة عليها",
      },
      {
        label: "في انتظار المراجعة",
        value: pending,
        icon:  <Clock size={22} />,
        accent: "gold" as const,
        sub:   "تحتاج إجراء",
      },
      {
        label: "خلال 7 أيام",
        value: upcoming7,
        icon:  <TrendingUp size={22} />,
        accent: "red" as const,
        sub:   "فعاليات قريبة",
      },
    ];
  }, [events, processed]);

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
              {userName || "مدير النظام"}{" "}
              <span className={styles.wave}>👋</span>
            </h1>
            <p className={styles.heroSub}>
              مرحباً بك في لوحة التحكم — إليك ملخص فعاليات اليوم
            </p>
            {facultyName && (
              <span className={styles.facultyPill}>{facultyName}</span>
            )}
          </div>

          <div className={styles.heroActions}>
            <button
              className={`${styles.refreshBtn} ${refreshing ? styles.refreshing : ""}`}
              onClick={() => fetchEvents(true)}
              aria-label="تحديث البيانات"
              title="تحديث"
            >
              <RefreshCw size={18} />
            </button>
            <NotificationBell events={events} />
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

      {/* ── Main Grid ── */}
      <div className={styles.mainGrid}>

        {/* Left: Upcoming Events Panel */}
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
                    sessionStorage.setItem("eventDetails_from", "/uni-level-scouts/uni-level-activities/Home");
                    router.push(`/uni-level-scouts/uni-level-activities/${ev.event_id}`);
                  }}
                />
              ))}
            </div>
          )}

          {!loading && upcomingEvents.length > 0 && (
            <div className={styles.panelFooter}>
              <button
                className={styles.viewAllBtn}
                onClick={() => router.push("/uni-level-scouts/uni-level-activities")}
              >
                عرض كل الفعاليات
                <ChevronLeft size={15} />
              </button>
            </div>
          )}
        </div>

        {/* Right: Side Panel — 3 cards stacked */}
        <div className={styles.sidePanel}>
          <StatusBreakdown events={events} />
          <QuickActionsCard />
          <EventsSummaryCard processed={processed} />     
        </div>

      </div>
    </div>
  );
}