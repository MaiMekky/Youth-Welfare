"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./FacEvents.module.css";
import { CalendarDays, Building2, ClipboardList, Eye, MapPin, Users, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
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
    startDate: "",
    status: "الكل",
    type: "الكل",
    college: "الكل",
  });

  const [rows, setRows] = useState<ApiEvent[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ================= API: Faculties ================= */
  async function fetchFaculties() {
    try {

      const baseUrl = getBaseUrl();
      const res = await authFetch(
        `${baseUrl}/api/family/faculties/`,
        {
          method: "GET",
          headers: {
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


      const baseUrl = getBaseUrl();
      const res = await authFetch(
        `${baseUrl}/api/event/get-events/faculty/`,
        {
          method: "GET",
          headers: {
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

  /* ================= Filtering ================= */
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const startDateOk =
        !filters.startDate ? true : (r.st_date || "") >= filters.startDate;

      const statusOk =
        filters.status === "الكل" ? true : (r.status || "").trim() === filters.status;

      const typeOk =
        filters.type === "الكل" ? true : (r.type || "").trim() === filters.type;

      const collegeOk =
        filters.college === "الكل"
          ? true
          : String(r.faculty_id) === filters.college;

      return startDateOk && statusOk && typeOk && collegeOk;
    });
  }, [rows, filters]);

  /* ================= Status Badge CSS class ================= */
  const getStatusClass = (status: string) => {
    const s = (status || "").trim();
    if (s === "مقبول" || s === "approved" || s === "active" || s === "نشط") return styles.statusApproved;
    if (s === "منتظر" || s === "pending" || s === "في الانتظار") return styles.statusPending;
    if (s === "موافقة مبدئية") return styles.statusProvisional;
    if (s === "مرفوض" || s === "rejected") return styles.statusRejected;
    if (s === "مكتمل" || s === "completed" || s === "done") return styles.statusCompleted;
    if (s === "ملغي" || s === "cancelled" || s === "canceled") return styles.statusCancelled;
    return styles.statusDefault;
  };

  /* ================= Type Badge CSS class ================= */
  const getTypeClass = (type: string) => {
    const t = (type || "").trim();
    if (t === "داخلي") return styles.typeInternal;
    if (t === "خارجي") return styles.typeExternal;
    return styles.typeDefault;
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
    sessionStorage.setItem("eventDetails_from", `/uni-level-activities\/uni-level-faculty-events`);
    router.push(`/uni-level-activities/${eventId}`);
  };

  function scopeLabel(raw: string) {
    const s = (raw || "").trim();
    if (s === "داخلي") return "على مستوى الكلية";
    if (s === "خارجي") return "على مستوى الجامعة";
    return s || "—";
  }

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

        {/* Filters */}
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
                <option value="الكل">الكل</option>
                <option value="داخلي">داخلي</option>
                <option value="خارجي">خارجي</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>الحالة</label>
              <select
                className={styles.select}
                value={filters.status}
                onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="الكل">الكل</option>
                <option value="موافقة مبدئية">موافقة مبدئية</option>
                <option value="مقبول">مقبول</option>
                <option value="منتظر">منتظر</option>
                <option value="مرفوض">مرفوض</option>
                <option value="مكتمل">مكتمل</option>
                <option value="ملغي">ملغي</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>تاريخ البداية من</label>
              <input
                type="date"
                placeholder="التاريخ"
                className={styles.select}
                value={filters.startDate}
                onChange={(e) => setFilters((p) => ({ ...p, startDate: e.target.value }))}
              />
            </div>
          </div>
        </section>

        {loading && (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>جاري تحميل الفعاليات...</p>
          </div>
        )}

        {error && (
          <div className={styles.errorBanner}>{error}</div>
        )}

        {/* Table */}
        <section className={styles.cardsSection}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionTitle}>
              الفعاليات <span className={styles.count}>({filteredRows.length})</span>
            </div>
          </div>

          {/* Cards Grid */}
          <div className={styles.cardsGrid}>
            {filteredRows.map((r) => (
              <article key={r.event_id} className={styles.eventCard}>
                <div className={styles.cardTop}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{r.title}</h3>
                    {/* <div className={styles.cardId}>#{r.event_id}</div> */}
                  </div>
                  
                  <div className={styles.badges}>
                    <span className={`${styles.statusBadge} ${getStatusClass(r.status)}`}>
                      {r.status}
                    </span>
                    <span className={`${styles.typeBadge} ${getTypeClass(r.type)}`}>
                      {scopeLabel(r.type)}
                    </span>
                  </div>

                  <div className={styles.facultyBadge}>
                    <Building2 size={14} />
                    <span>{facultyNameById[r.faculty_id] ?? "—"}</span>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <p className={styles.description}>{r.description}</p>

                  <div className={styles.metaGrid}>
                    <div className={styles.metaItem}>
                      <CalendarDays size={16} />
                      <div className={styles.metaContent}>
                        <span className={styles.metaLabel}>تاريخ البداية</span>
                        <span className={styles.metaValue} dir="ltr">{r.st_date}</span>
                      </div>
                    </div>

                    <div className={styles.metaItem}>
                      <CalendarDays size={16} />
                      <div className={styles.metaContent}>
                        <span className={styles.metaLabel}>تاريخ النهاية</span>
                        <span className={styles.metaValue} dir="ltr">{r.end_date}</span>
                      </div>
                    </div>

                    <div className={styles.metaItem}>
                      <MapPin size={16} />
                      <div className={styles.metaContent}>
                        <span className={styles.metaLabel}>المكان</span>
                        <span className={styles.metaValue}>{r.location}</span>
                      </div>
                    </div>

                    <div className={styles.metaItem}>
                      <Users size={16} />
                      <div className={styles.metaContent}>
                        <span className={styles.metaLabel}>الحد الأقصى</span>
                        <span className={styles.metaValue}>{r.s_limit} مشارك</span>
                      </div>
                    </div>

                    <div className={styles.metaItem}>
                      <DollarSign size={16} />
                      <div className={styles.metaContent}>
                        <span className={styles.metaLabel}>التكلفة</span>
                        <span className={styles.metaValue}>
                          {r.cost ? `${r.cost} جنيه` : "مجاني"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button
                    className={styles.viewBtn}
                    type="button"
                    onClick={() => onView(r.event_id)}
                  >
                    <Eye size={18} />
                    عرض التفاصيل
                  </button>
                </div>
              </article>
            ))}

            {!loading && !error && filteredRows.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <ClipboardList size={48} />
                </div>
                <h3 className={styles.emptyTitle}>لا توجد فعاليات</h3>
                <p className={styles.emptyDesc}>لا توجد فعاليات مطابقة للفلاتر المحددة</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}