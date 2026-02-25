"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  FileText, BarChart3, Download, Calendar, Building2,
  RefreshCw, AlertCircle, ChevronLeft, ChevronRight,
  Layers, Hash, BookOpen,
} from "lucide-react";
import SemesterReports from "./SemesterReports";
import styles from "../Styles/PlanView.module.css";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Plan {
  plan_id: number;
  name: string;
  term: number;
  faculty: number;
  faculty_name: string;
  events_count: number;
  created_at: string;
  updated_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("access") : null;

const BASE = "http://127.0.0.1:8000";

function fmt(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ar-EG", {
    year: "numeric", month: "short", day: "numeric",
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PlanView() {
  const [activeTab, setActiveTab] = useState<"plans" | "reports">("plans");

  // ── Plans state ──
  const [plans, setPlans]                 = useState<Plan[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [search, setSearch]               = useState("");
  const [currentPage, setCurrentPage]     = useState(1);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [toastMsg, setToastMsg]           = useState("");
  const rowsPerPage = 8;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // ── Fetch plans ──
  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE}/api/events/plans/list/`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : data.results ?? []);
      setError("");
    } catch {
      setError("فشل في جلب البيانات. تحقق من الاتصال.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "plans") fetchPlans();
  }, [activeTab, fetchPlans]);

  // ── Download PDF ──
  const handleDownload = async (plan: Plan) => {
    if (downloadingId !== null) return;
    setDownloadingId(plan.plan_id);
    try {
      const res = await fetch(`${BASE}/api/event/export-plan-pdf/${plan.plan_id}/`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${plan.name}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("✅ تم تحميل الخطة بنجاح");
    } catch {
      showToast("⚠️ فشل تحميل الملف، حاول مجدداً");
    } finally {
      setDownloadingId(null);
    }
  };

  // ── Stats ──
  const totalFaculties = new Set(plans.map(p => p.faculty)).size;
  const totalEvents    = plans.reduce((sum, p) => sum + (p.events_count ?? 0), 0);

  // ── Filter ──
  const filtered = plans.filter(p => {
    const term = search.toLowerCase();
    return !search ||
      p.name?.toLowerCase().includes(term) ||
      p.faculty_name?.toLowerCase().includes(term) ||
      p.term?.toString().includes(term);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated  = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className={styles.root}>

      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <h1>خطة الكلية والتقارير</h1>
      </div>

      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "plans" ? styles.active : ""}`}
          onClick={() => setActiveTab("plans")}
        >
          <FileText size={17} />
          خطة الكلية
        </button>
        <button
          className={`${styles.tab} ${activeTab === "reports" ? styles.active : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          <BarChart3 size={17} />
          تقارير الفصول
        </button>
      </div>

      {/* ── Plans Tab ── */}
      {activeTab === "plans" && (
        <div className={styles.sectionCard}>

          {/* Stat cards */}
          <div className={styles.statsRow}>
            <div className={`${styles.statCard} ${styles.blue}`}>
              <div className={styles.statIcon}><Layers size={20} /></div>
              <div className={styles.statBody}>
                <div className={styles.statNum}>{plans.length}</div>
                <div className={styles.statLabel}>إجمالي الخطط</div>
              </div>
            </div>
            <div className={`${styles.statCard} ${styles.gold}`}>
              <div className={styles.statIcon}><Building2 size={20} /></div>
              <div className={styles.statBody}>
                <div className={styles.statNum}>{totalFaculties}</div>
                <div className={styles.statLabel}>الكليات المشاركة</div>
              </div>
            </div>
            <div className={`${styles.statCard} ${styles.teal}`}>
              <div className={styles.statIcon}><Hash size={20} /></div>
              <div className={styles.statBody}>
                <div className={styles.statNum}>{totalEvents}</div>
                <div className={styles.statLabel}>إجمالي الفعاليات</div>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className={styles.toolbar}>
            <h2 className={styles.toolbarTitle}>قائمة خطط الفعاليات</h2>
            <div className={styles.toolbarControls}>
              <input
                className={styles.searchInput}
                placeholder="🔍 ابحث بالاسم، الكلية، الفصل…"
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              />
              <button className={styles.refreshBtn} onClick={fetchPlans}>
                <RefreshCw size={14} /> تحديث
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className={styles.errorBanner}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Table */}
          <div className={styles.tableWrap}>
            {loading ? (
              <div className={styles.stateBox}>
                <RefreshCw size={34} className={styles.spinner} />
                <p>جاري تحميل البيانات…</p>
              </div>
            ) : paginated.length === 0 ? (
              <div className={styles.stateBox}>
                <BookOpen size={42} />
                <p>لا توجد خطط مطابقة</p>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>اسم الخطة</th>
                    <th>الكلية</th>
                    <th>الفصل الدراسي</th>
                    <th>عدد الفعاليات</th>
                    <th>تاريخ الإنشاء</th>
                    <th>آخر تحديث</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(plan => (
                    <tr key={plan.plan_id}>
                      <td className={styles.idCell}>#{plan.plan_id}</td>

                      <td>
                        <div className={styles.fileNameCell}>
                          <FileText size={14} />
                          {plan.name || "—"}
                        </div>
                      </td>

                      <td>
                        <div className={styles.facultyCell}>
                          <Building2 size={13} />
                          {plan.faculty_name || "—"}
                        </div>
                      </td>

                      <td>
                        <span className={styles.termBadge}>الفصل {plan.term ?? "—"}</span>
                      </td>

                      <td>
                        <div className={styles.countCell}>
                          <Hash size={13} />
                          {plan.events_count ?? 0} فعالية
                        </div>
                      </td>

                      <td>
                        <div className={styles.dateCell}>
                          <Calendar size={12} />
                          {fmt(plan.created_at)}
                        </div>
                      </td>

                      <td>
                        <div className={styles.dateCell}>
                          <Calendar size={12} />
                          {fmt(plan.updated_at)}
                        </div>
                      </td>

                      <td>
                        <button
                          className={styles.downloadBtn}
                          onClick={() => handleDownload(plan)}
                          disabled={downloadingId === plan.plan_id}
                          title={`تحميل خطة ${plan.name}`}
                        >
                          {downloadingId === plan.plan_id ? (
                            <>
                              <RefreshCw size={12} style={{ animation: "spin 1s linear infinite" }} />
                              جاري…
                            </>
                          ) : (
                            <>
                              <Download size={13} />
                              تحميل PDF
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && filtered.length > 0 && (
            <div className={styles.pagination}>
              <span className={styles.pgInfo}>
                عرض{" "}
                <strong>{(currentPage - 1) * rowsPerPage + 1}</strong>–
                <strong>{Math.min(currentPage * rowsPerPage, filtered.length)}</strong>{" "}
                من <strong>{filtered.length}</strong> خطة
              </span>
              <div className={styles.pgControls}>
                <button
                  className={styles.pgBtn}
                  onClick={() => setCurrentPage(p => p - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronRight size={15} />
                </button>
                <span className={styles.pgLabel}>{currentPage} / {totalPages}</span>
                <button
                  className={styles.pgBtn}
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronLeft size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Reports Tab ── */}
      {activeTab === "reports" && (
        <div className={styles.reportsWrapper}>
          <SemesterReports />
        </div>
      )}

      {/* ── Toast ── */}
      {toastMsg && <div className={styles.toast}>{toastMsg}</div>}
    </div>
  );
}