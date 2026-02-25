// app/events/page.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import styles from "../styles/EventManagment.module.css";
import { useRouter } from "next/navigation";

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

/* ══════════════════════════════════════════
   LOCAL TYPE
══════════════════════════════════════════ */
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

/* ══════════════════════════════════════════
   MAPPER  (facultyMap injected at call-site)
══════════════════════════════════════════ */
const mapApiEvent = (e: ApiEvent, facultyMap: Map<number, string>): EventRow => {
  const facultyName =
    (e.faculty_id != null ? facultyMap.get(e.faculty_id) : undefined) ??
    e.faculty_name ??
    "—";

  return {
    event_id:    e.event_id,
    title:       e.title,
    description: e.description,
    startDate:   e.st_date  ? e.st_date.slice(0, 10)  : "—",
    endDate:     e.end_date ? e.end_date.slice(0, 10) : "—",
    location:    e.location ?? "—",
    status:      e.status   ?? (e.active ? "active" : "pending"),
    type:        e.type     ?? "—",
    faculty:     facultyName,
    cost:        parseFloat(e.cost) || 0,
    capacity:    e.s_limit,
    createdBy:   "",
  };
};

/* ══════════════════════════════════════════
   ICONS
══════════════════════════════════════════ */
function PeopleIcon(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16 11a4 4 0 1 0-3.2-6.4A5 5 0 1 1 8 16h8a5 5 0 0 1 5 5v1H3v-1a5 5 0 0 1 5-5h2" fill="currentColor" opacity="0.18" />
      <path d="M16 12a5 5 0 1 0-4.55-2.93A6 6 0 0 0 8 15h8a6 6 0 0 1 6 6v1H2v-1a6 6 0 0 1 6-6h2.35" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M16 3.6a3.4 3.4 0 1 1 0 6.8 3.4 3.4 0 0 1 0-6.8Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function CheckDocIcon(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3h7l3 3v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" fill="currentColor" opacity="0.18" />
      <path d="M14 3v4a1 1 0 0 0 1 1h4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M7 3h7l5 5v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m8.2 14 2 2 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CalendarIcon(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 4h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4Z" fill="currentColor" opacity="0.18" />
      <path d="M8 2v4M16 2v4M3 9h18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7 4h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function BoltIcon(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13 2 4 14h7l-1 8 10-14h-7l0-6Z" fill="currentColor" opacity="0.18" />
      <path d="M13 2 4 14h7l-1 8 10-14h-7l0-6Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function SearchIcon(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16.5 16.5 21 21" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* ══════════════════════════════════════════
   SKELETON ROW — 8 cols
══════════════════════════════════════════ */
function SkeletonRow() {
  return (
    <tr className={styles.tr}>
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className={styles.td}>
          <div style={{
            height: 16,
            borderRadius: 6,
            background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s infinite",
            width: i === 0 ? "140px" : "60px",
          }} />
        </td>
      ))}
    </tr>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
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

  /* ── Fetch both APIs in parallel ── */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
        const headers: HeadersInit = {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "application/json",
        };

        const [eventsRes, facultiesRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/event/get-events/", { headers }),
          fetch("http://127.0.0.1:8000/api/solidarity/super_dept/faculties/", { headers }),
        ]);

        if (!eventsRes.ok) {
          const body = await eventsRes.json().catch(() => ({}));
          throw new Error(body.detail || body.message || `HTTP ${eventsRes.status}`);
        }

        const rawEvents    = await eventsRes.json();
        const rawFaculties = facultiesRes.ok ? await facultiesRes.json().catch(() => []) : [];

        const facArr: ApiFaculty[] = Array.isArray(rawFaculties)
          ? rawFaculties
          : (rawFaculties.results ?? rawFaculties.data ?? []);

        // id → name lookup
        const facultyMap = new Map<number, string>(
          facArr.map((f) => [f.faculty_id, f.name])
        );

        setFacultyList(facArr);

        const evArr: ApiEvent[] = Array.isArray(rawEvents)
          ? rawEvents
          : (rawEvents.results ?? rawEvents.data ?? []);

        setData(evArr.map((e) => mapApiEvent(e, facultyMap)));
      } catch (e: any) {
        setError(e.message ?? "حدث خطأ أثناء تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* ── Filtered rows ── */
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return data.filter((e) => {
      const matchesQuery =
        !query ||
        e.title.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.location.toLowerCase().includes(query) ||
        e.createdBy.toLowerCase().includes(query);

      const matchesStatus  = !statusFilter  || e.status  === statusFilter;
      const matchesType    = !typeFilter    || e.type    === typeFilter;
      const matchesFaculty = !facultyFilter || e.faculty === facultyFilter;

      return matchesQuery && matchesStatus && matchesType && matchesFaculty;
    });
  }, [data, q, statusFilter, typeFilter, facultyFilter]);

  /* ── Stats ── */
  const totalCapacity  = useMemo(() => data.reduce((s, e) => s + e.capacity, 0), [data]);
  const completedCount = useMemo(() => data.filter((e) => e.status === "مكتملة" || e.status === "completed").length, [data]);
  const activeCount    = useMemo(() => data.filter((e) => e.status === "active"  || e.status === "نشطة" || e.status === "مقبول").length, [data]);
  const totalEvents    = data.length;

  /* ── Dynamic filter options ── */
  const types    = useMemo(() => Array.from(new Set(data.map((e) => e.type).filter(Boolean))),   [data]);
  const statuses = useMemo(() => Array.from(new Set(data.map((e) => e.status).filter(Boolean))), [data]);

  const handleView = (eventId: number) => router.push(`/SuperAdmin/Events/${eventId}`);

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div className={styles.page} dir="rtl" lang="ar">
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes spin    { to { transform: rotate(360deg); } }
      `}</style>

      <div className={styles.container}>

        {/* ── Stats ── */}
        <section className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statIconWrap}><PeopleIcon className={styles.statIcon} /></div>
            <div className={styles.statMeta}>
              <div className={styles.statLabel}>السعة الإجمالية</div>
              <div className={styles.statValue}>{loading ? "…" : totalCapacity.toLocaleString("ar-EG")}</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIconWrap}><CheckDocIcon className={styles.statIcon} /></div>
            <div className={styles.statMeta}>
              <div className={styles.statLabel}>الفعاليات المكتملة</div>
              <div className={styles.statValue}>{loading ? "…" : completedCount}</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIconWrap}><BoltIcon className={styles.statIcon} /></div>
            <div className={styles.statMeta}>
              <div className={styles.statLabel}>الفعاليات النشطة</div>
              <div className={styles.statValue}>{loading ? "…" : activeCount}</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIconWrap}><CalendarIcon className={styles.statIcon} /></div>
            <div className={styles.statMeta}>
              <div className={styles.statLabel}>إجمالي الفعاليات</div>
              <div className={styles.statValue}>{loading ? "…" : totalEvents}</div>
            </div>
          </div>
        </section>

        {/* ── Management Panel ── */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>إدارة الفعاليات</h2>
            <div className={styles.searchRow}>
              <div className={styles.searchWrapFull}>
                <SearchIcon className={styles.searchIcon} />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className={styles.searchInput}
                  placeholder="ابحث باسم الفعالية، المكان، الوصف"
                />
              </div>
            </div>
          </div>

          {/* ── Filters ── */}
          <div className={styles.filters}>
            <select className={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">كل الحالات</option>
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <select className={styles.select} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">كل الأنواع</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>

            {/* Faculty filter — from /api/solidarity/super_dept/faculties/ */}
            <select className={styles.select} value={facultyFilter} onChange={(e) => setFacultyFilter(e.target.value)}>
              <option value="">كل الكليات</option>
              {facultyList.map((f) => (
                <option key={f.faculty_id} value={f.name}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* ── Error banner ── */}
          {error && (
            <div style={{
              padding: "12px 16px", margin: "12px 0", borderRadius: 8,
              background: "#fff2f2", border: "1px solid #fca5a5",
              color: "#dc2626", fontSize: 14, display: "flex", alignItems: "center", gap: 8,
            }}>
              ⚠️ {error}
              <button
                onClick={() => window.location.reload()}
                style={{ marginRight: "auto", fontSize: 13, color: "#dc2626", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {/* ── Desktop Table ── */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>تفاصيل الفعالية</th>
                  <th className={styles.th}>الكلية</th>
                  <th className={styles.th}>النوع</th>
                  <th className={styles.th}>الحالة</th>
                  <th className={styles.th}>التاريخ والمكان</th>
                  <th className={styles.th}>السعة</th>
                  <th className={styles.th}>التكلفة</th>
                  <th className={styles.th}>إجراءات</th>
                </tr>
              </thead>

              <tbody>
                {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

                {!loading && !error && filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className={styles.td} style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
                      لا توجد فعاليات تطابق معايير البحث
                    </td>
                  </tr>
                )}

                {!loading && filtered.map((e) => (
                  <tr key={e.event_id} className={styles.tr}>

                    <td className={styles.td}>
                      <div className={styles.detailsCell}>
                        <div className={styles.detailsTitle}>{e.title}</div>
                        
                        {e.createdBy && (
                          <div className={styles.detailsBy}>تم الإنشاء بواسطة: {e.createdBy}</div>
                        )}
                      </div>
                    </td>

                    <td className={styles.td}>{e.faculty}</td>

                    <td className={styles.td}>
                      <span className={styles.badge}>{e.type}</span>
                    </td>

                    <td className={styles.td}>
                      <span className={`${styles.badge} ${
                        e.status === "active"    || e.status === "نشطة"   || e.status === "مقبول"  ? styles.badgeActive    :
                        e.status === "completed" || e.status === "مكتملة" || e.status === "مرفوض"  ? styles.badgeCompleted :
                        ""
                      }`}>
                        {e.status}
                      </span>
                    </td>

                    <td className={styles.td}>
                      <div className={styles.dateCell}>
                        <div className={styles.dateRange}>{e.startDate} - {e.endDate}</div>
                        <div className={styles.locationText}>… {e.location}</div>
                      </div>
                    </td>

                    <td className={styles.td}>
                      <div className={styles.capacityCell}>
                        <div className={styles.capacityValue}>{e.capacity}</div>
                        <div className={styles.capacityHint}>أقصى عدد طلاب</div>
                      </div>
                    </td>

                    <td className={styles.td}>
                      {e.cost > 0 ? `${e.cost.toLocaleString("ar-EG")} ج` : "مجاني"}
                    </td>

                    <td className={styles.td}>
                      <button className={styles.viewBtn} onClick={() => handleView(e.event_id)} type="button">
                        عرض التفاصيل
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Cards ── */}
          <div className={styles.mobileList}>
            {loading && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>
                <div style={{ width: 32, height: 32, border: "3px solid #e5e7eb", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
                جاري تحميل الفعاليات...
              </div>
            )}

            {!loading && filtered.map((e) => (
              <article key={e.event_id} className={styles.mobileCard}>
                <div className={styles.mobileTop}>
                  <div className={styles.mobileTitle}>{e.title}</div>
                </div>

                <div className={styles.mobileMeta}>
                  <span className={`${styles.badge} ${
                    e.status === "active" || e.status === "نشطة" || e.status === "مقبول"
                      ? styles.badgeActive : styles.badgeCompleted
                  }`}>
                    {e.status}
                  </span>
                  <span className={styles.badge}>{e.type}</span>
                  <span className={styles.mobileChip}>{e.faculty}</span>
                </div>

                <div className={styles.mobileRow}>
                  <div className={styles.mobileLabel}>التاريخ</div>
                  <div className={styles.mobileValue}>{e.startDate} - {e.endDate}</div>
                </div>
                <div className={styles.mobileRow}>
                  <div className={styles.mobileLabel}>المكان</div>
                  <div className={styles.mobileValue}>… {e.location}</div>
                </div>
                <div className={styles.mobileRow}>
                  <div className={styles.mobileLabel}>السعة</div>
                  <div className={styles.mobileValue}>{e.capacity} (أقصى عدد طلاب)</div>
                </div>
                <div className={styles.mobileRow}>
                  <div className={styles.mobileLabel}>التكلفة</div>
                  <div className={styles.mobileValue}>
                    {e.cost > 0 ? `${e.cost.toLocaleString("ar-EG")} ج` : "مجاني"}
                  </div>
                </div>

                <div className={styles.mobileDesc}>… {e.description}</div>

                <button className={styles.viewBtnMobile} onClick={() => handleView(e.event_id)} type="button">
                  عرض التفاصيل
                </button>
              </article>
            ))}
          </div>

        </section>
      </div>
    </div>
  );
}