"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./FacEvents.module.css";
import { CalendarDays, Building2, ClipboardList, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

type ApiEvent = {
  event_id: number;
  title: string;
  description: string;
  st_date: string; // "2026-02-25"
  end_date: string;
  location: string;
  status: string;
  type: string;
  cost: string; // "615"
  s_limit: number;
  faculty_id: number;
  dept_id: number;
};

type Faculty = {
  faculty_id: number;
  name: string;
};

export default function Page() {
  const router = useRouter();

  const [filters, setFilters] = useState({
    year: "الكل",
    status: "الكل",
    type: "الكل",
    college: "الكل", // هنخزن فيها faculty_id كـ string
  });

  const [rows, setRows] = useState<ApiEvent[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ================= API: Faculties ================= */
  async function fetchFaculties() {
    try {
      const token = localStorage.getItem("access");
      if (!token) return;

      const res = await fetch(
        "http://localhost:8000/api/solidarity/super_dept/faculties/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) {
        console.error("Faculties fetch failed:", res.status);
        setFaculties([]);
        return;
      }

      const data: Faculty[] = await res.json();
      setFaculties(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setFaculties([]);
    }
  }

  const facultyNameById = useMemo(() => {
    const map: Record<number, string> = {};
    faculties.forEach((f) => (map[f.faculty_id] = f.name));
    return map;
  }, [faculties]);

  /* ================= API: Events ================= */
  async function fetchFacultyEvents() {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("access");
      if (!token) {
        setRows([]);
        setError("مفيش access token. اعملي تسجيل دخول تاني.");
        return;
      }

      const res = await fetch(
        "http://localhost:8000/api/event/get-events/faculty/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const text = await res.text();
      console.log("GET events status:", res.status);
      console.log("GET events raw body:", text);

      if (!res.ok) {
        setRows([]);
        setError(`فشل تحميل الفعاليات (Status ${res.status})`);
        return;
      }

      const parsed = text ? JSON.parse(text) : [];
      const data: ApiEvent[] = Array.isArray(parsed) ? parsed : parsed?.results ?? [];

      if (!Array.isArray(data)) {
        setRows([]);
        setError("الـ API رجّع شكل بيانات غير متوقع.");
        return;
      }

      setRows(data);
    } catch (err) {
      console.error(err);
      setRows([]);
      setError("حصل خطأ أثناء تحميل الفعاليات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFaculties();
    fetchFacultyEvents();
  }, []);

  /* ================= Dynamic filter options ================= */
  const uniqueStatuses = useMemo(() => {
    const s = Array.from(new Set(rows.map((r) => (r.status || "").trim()).filter(Boolean)));
    return ["الكل", ...s];
  }, [rows]);

  const uniqueTypes = useMemo(() => {
    const s = Array.from(new Set(rows.map((r) => (r.type || "").trim()).filter(Boolean)));
    return ["الكل", ...s];
  }, [rows]);

  const uniqueYears = useMemo(() => {
    const years = Array.from(
      new Set(
        rows
          .map((r) => (r.st_date || "").slice(0, 4))
          .filter((y) => y && /^\d{4}$/.test(y))
      )
    ).sort();
    return ["الكل", ...years];
  }, [rows]);

  /* ================= Filtering ================= */
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const yearOk =
        filters.year === "الكل" ? true : (r.st_date || "").startsWith(filters.year);

      const statusOk =
        filters.status === "الكل" ? true : (r.status || "") === filters.status;

      const typeOk =
        filters.type === "الكل" ? true : (r.type || "") === filters.type;

      const collegeOk =
        filters.college === "الكل"
          ? true
          : String(r.faculty_id) === filters.college;

      return yearOk && statusOk && typeOk && collegeOk;
    });
  }, [rows, filters]);

  /* ================= Elegant Status Badge ================= */
  const statusStyle = (status: string): React.CSSProperties => {
    const s = (status || "").trim().toLowerCase();

    // Active / Accepted
    if (s === "نشط" || s === "active" || s === "مقبول" || s === "approved") {
      return {
        background: "rgba(16,185,129,.14)",
        color: "#0f766e",
        border: "1px solid rgba(16,185,129,.28)",
      };
    }

    // Upcoming / Pending-ish
    if (s === "قريباً" || s === "upcoming" || s === "في الانتظار" || s === "pending") {
      return {
        background: "rgba(245,158,11,.16)",
        color: "#92400e",
        border: "1px solid rgba(245,158,11,.30)",
      };
    }

    // Completed
    if (s === "مكتمل" || s === "completed" || s === "done") {
      return {
        background: "rgba(59,130,246,.14)",
        color: "#1d4ed8",
        border: "1px solid rgba(59,130,246,.28)",
      };
    }

    // Rejected / Cancelled / Other
    if (s === "مرفوض" || s === "rejected" || s === "cancelled" || s === "canceled") {
      return {
        background: "rgba(239,68,68,.14)",
        color: "#b91c1c",
        border: "1px solid rgba(239,68,68,.28)",
      };
    }

    // Default
    return {
      background: "rgba(100,116,139,.12)",
      color: "#334155",
      border: "1px solid rgba(100,116,139,.22)",
    };
  };

  const badgeBase: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    fontWeight: 900,
    fontSize: 12,
    lineHeight: 1,
    whiteSpace: "nowrap",
  };
  /* ================= Elegant Type Badge ================= */
const typeStyle = (type: string): React.CSSProperties => {
  const t = (type || "").trim().toLowerCase();

  // تقني
  if (t === "تقني" || t === "technical") {
    return {
      background: "rgba(59,130,246,.14)",
      color: "#1d4ed8",
      border: "1px solid rgba(59,130,246,.28)",
    };
  }

  // ثقافي
  if (t === "ثقافي" || t === "cultural") {
    return {
      background: "rgba(168,85,247,.14)",
      color: "#6d28d9",
      border: "1px solid rgba(168,85,247,.28)",
    };
  }

  // رياضي
  if (t === "رياضي" || t === "sports") {
    return {
      background: "rgba(239,68,68,.14)",
      color: "#b91c1c",
      border: "1px solid rgba(239,68,68,.28)",
    };
  }

  // فني
  if (t === "فني" || t === "art") {
    return {
      background: "rgba(14,165,233,.14)",
      color: "#0369a1",
      border: "1px solid rgba(14,165,233,.28)",
    };
  }

  return {
    background: "rgba(100,116,139,.12)",
    color: "#334155",
    border: "1px solid rgba(100,116,139,.22)",
  };
};
  /* ================= Stats ================= */
  const stats = useMemo(() => {
    const totalColleges = new Set(rows.map((r) => r.faculty_id)).size;
    const totalEvents = rows.length;

    const isActive = (status: string) => {
      const s = (status || "").trim().toLowerCase();
      return s === "نشط" || s === "active" || s === "مقبول" || s === "approved";
    };

    const activeEvents = rows.filter((r) => isActive(r.status)).length;

    return {
      totalColleges,
      activeEvents,
      totalEvents,
    };
  }, [rows]);

  const onView = (eventId: number) => {
    router.push(`/uni-level-activities/${eventId}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.pageTitle}>مراقبة فعاليات الكليات</h1>
            <p className={styles.pageSubtitle}>عرض وإدارة الفعاليات التي أنشأتها الكليات</p>
          </div>
        </div>

        {/* Stats (شيلنا كارت المشاركين) */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.statGold}`}>
            <div className={styles.statIcon}>
              <Building2 size={22} />
            </div>
            <div className={styles.statText}>
              <div className={styles.statLabel}>عدد الكليات</div>
              <div className={styles.statValue}>{stats.totalColleges}</div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statGreen}`}>
            <div className={styles.statIcon}>
              <ClipboardList size={22} />
            </div>
            <div className={styles.statText}>
              <div className={styles.statLabel}>الفعاليات النشطة</div>
              <div className={styles.statValue}>{stats.activeEvents}</div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statBlue}`}>
            <div className={styles.statIcon}>
              <CalendarDays size={22} />
            </div>
            <div className={styles.statText}>
              <div className={styles.statLabel}>إجمالي الفعاليات</div>
              <div className={styles.statValue}>{stats.totalEvents}</div>
            </div>
          </div>
        </div>

        {/* Filters (شيلنا فلتر الخطة) */}
        <section className={styles.filtersCard}>
          <div className={styles.filtersGrid}>
            <div className={styles.field}>
              <label className={styles.label}>الكلية</label>
              <select
                className={styles.select}
                value={filters.college}
                onChange={(e) => setFilters((p) => ({ ...p, college: e.target.value }))}
              >
                <option value="الكل">الكل</option>
                {faculties.map((f) => (
                  <option key={f.faculty_id} value={String(f.faculty_id)}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>نوع الفعالية</label>
              <select
                className={styles.select}
                value={filters.type}
                onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}
              >
                {uniqueTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>الحالة</label>
              <select
                className={styles.select}
                value={filters.status}
                onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
              >
                {uniqueStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>العام</label>
              <select
                className={styles.select}
                value={filters.year}
                onChange={(e) => setFilters((p) => ({ ...p, year: e.target.value }))}
              >
                {uniqueYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {loading && (
          <div style={{ textAlign: "center", padding: 16 }}>جاري تحميل الفعاليات...</div>
        )}

        {error && (
          <div style={{ textAlign: "center", padding: 16, color: "crimson" }}>
            {error}
          </div>
        )}

        {/* Table */}
        <section className={styles.tableBlock}>
          <div className={styles.tableHead}>
            <div className={styles.tableTitle}>
              الفعاليات <span className={styles.count}>({filteredRows.length})</span>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>رقم الفعالية</th>
                    <th>العنوان</th>
                    <th>الكلية</th>
                    <th>الوصف</th>
                    <th>تاريخ البداية</th>
                    <th>تاريخ النهاية</th>
                    <th>المكان</th>
                    <th>الحالة</th>
                    <th>النوع</th>
                    <th>التكلفة</th>
                    <th>الحد الأقصى</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.map((r) => (
                    <tr key={r.event_id}>
                      <td>{r.event_id}</td>
                      <td className={styles.cellTitle}>{r.title}</td>

                      <td>{facultyNameById[r.faculty_id] ?? "—"}</td>

                      <td>{r.description}</td>
                      <td dir="ltr">{r.st_date}</td>
                      <td dir="ltr">{r.end_date}</td>
                      <td>{r.location}</td>

                      <td>
                        <span style={{ ...badgeBase, ...statusStyle(r.status) }}>
                          {r.status}
                        </span>
                      </td>

                      <td>
                      <span style={{ ...badgeBase, ...typeStyle(r.type) }}>
                        {r.type}
                      </span>
                    </td>

                      <td className={styles.cellValue}>
                        {r.cost ? `${r.cost} جنيه` : "مجاني"}
                      </td>

                      <td className={styles.cellValue}>{r.s_limit}</td>

                      <td>
                        <div className={styles.rowActions}>
                          <button
                            className={styles.actionBtn}
                            type="button"
                            onClick={() => onView(r.event_id)}
                          >
                            <Eye size={16} />
                            عرض التفاصيل
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!loading && !error && filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={12} style={{ textAlign: "center", padding: 18, color: "#64748b" }}>
                        لا توجد فعاليات مطابقة للفلاتر
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}