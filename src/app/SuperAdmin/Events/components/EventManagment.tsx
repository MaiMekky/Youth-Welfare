// app/events/page.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import styles from "../styles/EventManagment.module.css";
import { useRouter } from "next/navigation";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";

/* ══════════════════════════════════════════
   API TYPES
══════════════════════════════════════════ */
interface ApiEvent {
  event_id: number;
  title: string;
  description: string;
  st_date: string;
  end_date: string;
  location: string;
  type: string;
  cost: string;
  s_limit: number;
  faculty_id?: number | null;
  faculty_name?: string | null;
  dept_name?: string | null;
  days_remaining: number;
  is_full: boolean;
  current_participants: number;
  imgs: string | null;
  reward: string;
  status?: string;
  active?: boolean;
}

interface ApiFaculty {
  faculty_id: number;
  name: string;
}

type EventRow = {
  event_id: number;
  cost: number;
  capacity: number;
  startDate: string;
  endDate: string;
  location: string;
  status: string;
  type: string;
  faculty: string;
  title: string;
  description: string;
  createdBy: string;
};

const mapApiEvent = (e: ApiEvent, facultyMap: Map<number, string>): EventRow => {
  const facultyName =
    (e.faculty_id != null ? facultyMap.get(e.faculty_id) : undefined) ??
    e.faculty_name ?? "—";
  return {
    event_id:    e.event_id,
    title:       e.title       ?? "",
    description: e.description ?? "",
    startDate:   e.st_date  ? e.st_date.slice(0, 10)  : "—",
    endDate:     e.end_date ? e.end_date.slice(0, 10) : "—",
    location:    e.location ?? "",
    status:      e.status   ?? (e.active ? "active" : "pending"),
    type:        e.type     ?? "",
    faculty:     facultyName,
    cost:        parseFloat(e.cost) || 0,
    capacity:    e.s_limit,
    createdBy:   "",
  };
};

/* ══════════════════════════════════════════
   STATUS BADGE CLASS
══════════════════════════════════════════ */
function getStatusClass(status: string): string {
  switch (status) {
    case "مقبول":
    case "active":
    case "نشطة":
      return styles.badgeAccepted;
    case "منتظر":
    case "pending":
      return styles.badgePending;
    case "موافقة مبدئية":
      return styles.badgeProvisional;
    case "مرفوض":
    case "completed":
    case "مكتملة":
      return styles.badgeRejected;
    default:
      return styles.badgeDefault;
  }
}

/* ══════════════════════════════════════════
   ICONS
══════════════════════════════════════════ */
function MoneyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.2" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7v1.2M12 15.8V17M9.5 10a2.5 2.5 0 0 1 5 0c0 1.4-1.2 2-2.5 2.5S9.5 13.5 9.5 15h5"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function CheckDocIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3h7l3 3v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" fill="currentColor" opacity="0.2" />
      <path d="M14 3v4a1 1 0 0 0 1 1h4M7 3h7l5 5v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
        fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m8.2 14 2 2 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 4h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4Z" fill="currentColor" opacity="0.2" />
      <path d="M8 2v4M16 2v4M3 9h18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7 4h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4Z"
        fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function BoltIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13 2 4 14h7l-1 8 10-14h-7Z" fill="currentColor" opacity="0.2" />
      <path d="M13 2 4 14h7l-1 8 10-14h-7Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

/* ══════════════════════════════════════════
   SKELETON
══════════════════════════════════════════ */
function SkeletonRow() {
  return (
    <tr className={styles.tr}>
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className={styles.td}>
          <div style={{
            height: 14, borderRadius: 6,
            background: "linear-gradient(90deg,#EBF3FB 25%,#dce9f4 50%,#EBF3FB 75%)",
            backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
            width: i === 0 ? "130px" : i === 7 ? "60px" : "70px",
          }} />
        </td>
      ))}
    </tr>
  );
}

/* ══════════════════════════════════════════
   PAGE
══════════════════════════════════════════ */
export default function EventsPage() {
  const [data, setData]                   = useState<EventRow[]>([]);
  const [facultyList, setFacultyList]     = useState<ApiFaculty[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);

  const [q, setQ]                         = useState("");
  const [statusFilter, setStatusFilter]   = useState("");
  const [typeFilter, setTypeFilter]       = useState("");
  const [facultyFilter, setFacultyFilter] = useState("");

  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true); setError(null);
        const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
        const headers: HeadersInit = {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "application/json",
        };
        const baseUrl = getBaseUrl();
        const [eventsRes, facultiesRes] = await Promise.all([
          authFetch(`${baseUrl}/api/event/get-events/`, { headers }),
          authFetch(`${baseUrl}/api/family/faculties/`, { headers }),
        ]);
        if (!eventsRes.ok) {
          const body = await eventsRes.json().catch(() => ({}));
          throw new Error(body.detail || body.message || `HTTP ${eventsRes.status}`);
        }
        const rawEvents    = await eventsRes.json();
        const rawFaculties = facultiesRes.ok ? await facultiesRes.json().catch(() => []) : [];
        const facArr: ApiFaculty[] = Array.isArray(rawFaculties)
          ? rawFaculties : (rawFaculties.results ?? rawFaculties.data ?? []);
        const facultyMap = new Map<number, string>(facArr.map((f) => [f.faculty_id, f.name]));
        setFacultyList(facArr);
        const evArr: ApiEvent[] = Array.isArray(rawEvents)
          ? rawEvents : (rawEvents.results ?? rawEvents.data ?? []);
        setData(evArr.map((e) => mapApiEvent(e, facultyMap)));
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "حدث خطأ أثناء تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ✅ FIX: null-safe toLowerCase with optional chaining + fallback
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return data.filter((e) => {
      const mq = !query ||
        (e.title       ?? "").toLowerCase().includes(query) ||
        (e.description ?? "").toLowerCase().includes(query) ||
        (e.location    ?? "").toLowerCase().includes(query);
      return mq &&
        (!statusFilter  || e.status  === statusFilter) &&
        (!typeFilter    || e.type    === typeFilter) &&
        (!facultyFilter || e.faculty === facultyFilter);
    });
  }, [data, q, statusFilter, typeFilter, facultyFilter]);

  const totalCost      = useMemo(() => data.reduce((s, e) => s + e.cost, 0), [data]);
  const completedCount = useMemo(() => data.filter((e) => e.status === "مكتملة" || e.status === "completed").length, [data]);
  const activeCount    = useMemo(() => data.filter((e) => e.status === "active" || e.status === "نشطة" || e.status === "مقبول").length, [data]);
  const totalEvents    = data.length;

  const handleView = (id: number) => router.push(`/SuperAdmin/Events/${id}`);

  return (
    <div className={styles.activityLogsContainer} dir="rtl" lang="ar">

      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>إدارة الفعاليات</h1>
          <p className={styles.pageSubtitle}>عرض وتصفية جميع الفعاليات المسجلة في المنظومة</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <div className={`${styles.statCard} ${styles.statTotal}`}>
          {/* <div className={styles.statIconWrap}><CalendarIcon className={styles.statIcon} /></div> */}
          <div className={styles.statMeta}>
            <div className={styles.statNum}>{loading ? "…" : totalEvents}</div>
            <div className={styles.statLabel}>إجمالي الفعاليات</div>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.statSuccess}`}>
          {/* <div className={styles.statIconWrap}><BoltIcon className={styles.statIcon} /></div> */}
          <div className={styles.statMeta}>
            <div className={styles.statNum}>{loading ? "…" : activeCount}</div>
            <div className={styles.statLabel}>الفعاليات النشطة</div>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.statFailed}`}>
          {/* <div className={styles.statIconWrap}><CheckDocIcon className={styles.statIcon} /></div> */}
          <div className={styles.statMeta}>
            <div className={styles.statNum}>{loading ? "…" : completedCount}</div>
            <div className={styles.statLabel}>الفعاليات المكتملة</div>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.statFiltered}`}>
          {/* <div className={styles.statIconWrap}><MoneyIcon className={styles.statIcon} /></div> */}
          <div className={styles.statMeta}>
            <div className={styles.statNum}>{loading ? "…" : `${totalCost.toLocaleString("EG")}`}</div>
            <div className={styles.statLabel}>التكلفة الإجمالية (ج)</div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.selectWrapper}>
          <select
            className={styles.roleSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">كل الحالات</option>
            <option value="مقبول">مقبول</option>
            <option value="موافقة مبدئية">موافقة مبدئية</option>
            <option value="منتظر">منتظر</option>
          </select>
        </div>

        <div className={styles.selectWrapper}>
          <select
            className={styles.roleSelect}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">كل الأنواع</option>
            <option value="داخلي">داخلي</option>
            <option value="خارجي">خارجي</option>
          </select>
        </div>

        <div className={styles.selectWrapper}>
          <select
            className={styles.roleSelect}
            value={facultyFilter}
            onChange={(e) => setFacultyFilter(e.target.value)}
          >
            <option value="">كل الكليات</option>
            {facultyList.map((f) => (
              <option key={f.faculty_id} value={f.name}>{f.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.searchWrapper}>
          <svg className={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="ابحث باسم الفعالية، المكان، الوصف..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className={styles.errorBanner}>
          {error}
          <button onClick={() => window.location.reload()} className={styles.retryBtn}>إعادة المحاولة</button>
        </div>
      )}

      {/* Table */}
      <div className={styles.tableContainer}>
        <table className={styles.logsTable}>
          <thead>
            <tr>
              <th>الفعالية</th>
              <th>الكلية</th>
              <th>النوع</th>
              <th>الحالة</th>
              <th>التاريخ والمكان</th>
              <th>السعة</th>
              <th>التكلفة</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

            {!loading && !error && filtered.length === 0 && (
              <tr>
                <td colSpan={8} className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"/>
                    </svg>
                  </div>
                  <p>لا توجد فعاليات تطابق معايير البحث</p>
                </td>
              </tr>
            )}

            {!loading && filtered.map((e) => (
              <tr key={e.event_id} className={styles.tr}>
                <td>
                  <div className={styles.actorCell}>
                    <div className={styles.actorAvatar}>{(e.title ?? "؟").charAt(0)}</div>
                    <div>
                      <div className={styles.actorName}>{e.title || "—"}</div>
                      {e.createdBy && <div className={styles.actorSub}>بواسطة: {e.createdBy}</div>}
                    </div>
                  </div>
                </td>
                <td><span className={styles.roleBadge}>{e.faculty}</span></td>
                <td><span className={styles.typeChip}>{e.type || "—"}</span></td>
                <td>
                  <span className={`${styles.statusTag} ${getStatusClass(e.status)}`}>
                    {e.status}
                  </span>
                </td>
                <td>
                  <div className={styles.dateCell}>
                    <span className={styles.dateText}>{e.startDate} — {e.endDate}</span>
                    <span className={styles.locationText}>{e.location || "—"}</span>
                  </div>
                </td>
                <td>
                  <div className={styles.capacityCell}>
                    <span className={styles.capacityValue}>{e.capacity}</span>
                    <span className={styles.capacityHint}>طالب</span>
                  </div>
                </td>
                <td>
                  <span className={e.cost > 0 ? styles.costValue : styles.costFree}>
                    {e.cost > 0 ? `${e.cost.toLocaleString("EG")} ج` : "مجاني"}
                  </span>
                </td>
                <td>
                  <button className={styles.viewBtn} onClick={() => handleView(e.event_id)} type="button">
                    عرض التفاصيل
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className={styles.mobileList}>
        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#6B8299", fontFamily: "Cairo, sans-serif" }}>
            <div style={{
              width: 32, height: 32,
              border: "3px solid #EBF3FB",
              borderTopColor: "#2D5F8A",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px"
            }} />
            جاري التحميل...
          </div>
        )}
        {!loading && filtered.map((e) => (
          <article key={e.event_id} className={styles.mobileCard}>
            <div className={styles.mobileTop}>
              <div className={styles.actorCell}>
                <div className={styles.actorAvatar}>{(e.title ?? "؟").charAt(0)}</div>
                <span className={styles.actorName}>{e.title || "—"}</span>
              </div>
              <span className={`${styles.statusTag} ${getStatusClass(e.status)}`}>{e.status}</span>
            </div>
            <div className={styles.mobileMeta}>
              <span className={styles.typeChip}>{e.type || "—"}</span>
              <span className={styles.roleBadge}>{e.faculty}</span>
            </div>
            <div className={styles.mobileRow}>
              <div className={styles.mobileLabel}>التاريخ</div>
              <div className={styles.mobileValue}>{e.startDate} — {e.endDate}</div>
            </div>
            <div className={styles.mobileRow}>
              <div className={styles.mobileLabel}>المكان</div>
              <div className={styles.mobileValue}>{e.location || "—"}</div>
            </div>
            <div className={styles.mobileRow}>
              <div className={styles.mobileLabel}>السعة</div>
              <div className={styles.mobileValue}>{e.capacity} طالب</div>
            </div>
            <div className={styles.mobileRow}>
              <div className={styles.mobileLabel}>التكلفة</div>
              <div className={styles.mobileValue}>
                {e.cost > 0 ? `${e.cost.toLocaleString("EG")} ج` : "مجاني"}
              </div>
            </div>
            <button className={styles.viewBtn} onClick={() => handleView(e.event_id)} type="button" style={{ width: "100%", justifyContent: "center" }}>
              عرض التفاصيل
            </button>
          </article>
        ))}
      </div>

    </div>
  );
}