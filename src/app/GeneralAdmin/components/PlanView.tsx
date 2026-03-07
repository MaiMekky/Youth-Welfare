"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  FileText, BarChart3, Download, Calendar, Building2,
  RefreshCw, AlertCircle, Eye, Filter, CheckCircle,
  XCircle, Clock, Layers, Search,
} from "lucide-react";
import styles from "../Styles/Planview.module.css";

interface Plan {
  plan_id: number;
  name: string;
  term: number;
  faculty: number;
  faculty_name: string;
  events_count: number;
  created_at: string;
  updated_at: string;
  status?: string;
  students_count?: number;
  academic_year?: string;
  plan_status?: string;
  submitted_at?: string;
  last_updated?: string;
}

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("access") : null;

const BASE = "http://127.0.0.1:8000";

function fmt(d?: string) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("ar-EG", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });
}

function statusBadgeClass(status?: string) {
  const s = status?.trim() ?? "";
  if (s === "مكتملة" || s === "مكتمل" || s === "complete") return styles.badgeComplete;
  if (s === "مفقودة" || s === "مفقود" || s === "missing")  return styles.badgeMissing;
  return styles.badgePending;
}

function statusLabel(status?: string) {
  const s = status?.trim() ?? "";
  if (s === "مكتملة" || s === "complete") return "مكتملة";
  if (s === "مفقودة" || s === "missing")  return "مفقودة";
  if (s) return s;
  return "قيد المراجعة";
}

function planStatusBadgeClass(ps?: string) {
  if (!ps) return `${styles.metaBadge} ${styles["green"]}`;
  if (ps.includes("غير")) return `${styles.metaBadge} ${styles["orange"]}`;
  return `${styles.metaBadge} ${styles["green"]}`;
}

function FacultyCard({ plan, onDownload, downloading }: {
  plan: Plan;
  onDownload: (plan: Plan) => void;
  downloading: boolean;
}) {
  const isMissing = plan.status?.includes("مفقود") || plan.status === "missing";
  const badgeCls  = statusBadgeClass(plan.status);
  const label     = statusLabel(plan.status);

  return (
    <div className={styles.facultyCard}>
      <div className={styles.cardTop}>
        <h3 className={styles.facultyName}>{plan.faculty_name || plan.name}</h3>
        <span className={`${styles.badge} ${badgeCls}`}>{label}</span>
      </div>

      <div className={styles.cardCounts}>
        {plan.students_count !== undefined && (
          <div className={styles.countItem}>
            <div className={styles.countValue}>{plan.students_count.toLocaleString("ar-EG")}</div>
            <div className={styles.countLabel}>الطلاب</div>
          </div>
        )}
        <div className={styles.countItem}>
          <div className={styles.countValue}>{plan.events_count ?? 0}</div>
          <div className={styles.countLabel}>الفعاليات المخططة</div>
        </div>
      </div>

      <div className={styles.cardMeta}>
        {plan.academic_year && (
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>العام الدراسي</span>
            <span className={styles.metaValue}>{plan.academic_year}</span>
          </div>
        )}
        {plan.plan_status && (
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>حالة الخطة</span>
            <span className={planStatusBadgeClass(plan.plan_status)}>{plan.plan_status}</span>
          </div>
        )}
        {(plan.term !== undefined) && !plan.academic_year && (
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>الفصل الدراسي</span>
            <span className={styles.metaValue}>الفصل {plan.term}</span>
          </div>
        )}
      </div>

      <div className={`${styles.cardDetailsBox} ${isMissing ? styles.missing : ""}`}>
        {isMissing ? (
          "لم يتم إرسال خطة لهذا الفصل الدراسي"
        ) : (
          <>
            <strong>تفاصيل الخطة</strong>
            <br />
            {plan.submitted_at && <>تم الإرسال والموافقة عليها<br />آخر تحديث: {fmt(plan.submitted_at)}</>}
            {!plan.submitted_at && plan.created_at && <>تم الإرسال والموافقة عليها<br />آخر تحديث: {fmt(plan.updated_at ?? plan.created_at)}</>}
          </>
        )}
      </div>

      <div className={styles.cardActions}>
        {isMissing ? (
          <button className={styles.btnView} disabled>
            <Eye size={14} /> عرض الخطة
          </button>
        ) : (
          <button className={styles.btnView}>
            <Eye size={14} /> عرض الخطة
          </button>
        )}
        <button
          className={styles.btnDownload}
          onClick={() => onDownload(plan)}
          disabled={downloading || isMissing}
          title="تحميل PDF"
        >
          {downloading
            ? <RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} />
            : <Download size={13} />}
          تحميل
        </button>
      </div>
    </div>
  );
}

export default function PlanView() {
  const [activeTab, setActiveTab]         = useState<"plans" | "reports">("plans");
  const [plans, setPlans]                 = useState<Plan[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [yearFilter, setYearFilter]       = useState("all");
  const [facultyFilter, setFacultyFilter] = useState("all");   // ← NEW
  const [facultySearch, setFacultySearch] = useState("");       // ← NEW
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [toastMsg, setToastMsg]           = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

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
      a.download = `${plan.faculty_name ?? plan.name}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("✅ تم تحميل الخطة بنجاح");
    } catch {
      showToast("⚠️ فشل تحميل الملف، حاول مجدداً");
    } finally {
      setDownloadingId(null);
    }
  };

  const totalPlans    = plans.length;
  const completePlans = plans.filter(p => !p.status?.includes("مفقود") && p.status !== "missing").length;
  const missingPlans  = plans.filter(p => p.status?.includes("مفقود") || p.status === "missing").length;

  const years = Array.from(new Set(plans.map(p => p.academic_year).filter(Boolean))) as string[];

  // ── Unique faculty names from API ──
  const facultyNames = Array.from(
    new Set(plans.map(p => p.faculty_name).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, "ar"));

  // ── Apply all filters ──
  const filtered = plans.filter(p => {
    const matchYear    = yearFilter === "all" || p.academic_year === yearFilter;
    const matchFaculty = facultyFilter === "all" || p.faculty_name === facultyFilter;
    const matchSearch  = facultySearch === "" ||
      p.faculty_name?.toLowerCase().includes(facultySearch.toLowerCase());
    return matchYear && matchFaculty && matchSearch;
  });

  const currentYear = years[0] ?? "2026-2027";

  return (
    <div className={styles.root}>

      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "plans" ? styles.active : ""}`}
          onClick={() => setActiveTab("plans")}
        >
          <FileText size={16} /> خطة الكليات
        </button>
      
      </div>

      {activeTab === "plans" && (
        <>
          {/* Info banner */}
          <div className={styles.infoBanner}>
            <CheckCircle size={18} />
            <div className={styles.infoBannerText}>
              <h3>خطط الكليات السنوية</h3>
              <p>عرض ومراجعة الخطط السنوية المرسلة من كل كلية للأنشطة الطلابية والفعاليات. يتم تحديث هذه الخطط في بداية كل عام دراسي.</p>
            </div>
          </div>

          {/* Stats row */}
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <div className={`${styles.statIconBox} ${styles.navy}`}>
                <Layers size={19} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{totalPlans}</div>
                <div className={styles.statTitle}>إجمالي الكليات</div>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={`${styles.statIconBox} ${styles.green}`}>
                <CheckCircle size={19} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{completePlans}</div>
                <div className={styles.statTitle}>خطط مكتملة</div>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={`${styles.statIconBox} ${styles.amber}`}>
                <Clock size={19} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{missingPlans}</div>
                <div className={styles.statTitle}>خطط مفقودة</div>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={`${styles.statIconBox} ${styles.blue}`}>
                <Calendar size={19} />
              </div>
              <div className={styles.statContent}>
                <div className={`${styles.statValue} ${styles.yearValue}`}>{currentYear}</div>
                <div className={styles.statTitle}>العام الدراسي</div>
              </div>
            </div>
          </div>

          {/* Section header */}
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderText}>
              <h2>خطط الكليات</h2>
              <p>مراجعة وتحميل الخطط السنوية للأنشطة الطلابية</p>
            </div>
            <div className={styles.sectionControls}>

              {/* ── Faculty search input ── */}
              <div className={styles.searchWrap}>
                <Search size={13} className={styles.searchIcon} />
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="ابحث باسم الكلية…"
                  value={facultySearch}
                  onChange={e => {
                    setFacultySearch(e.target.value);
                    setFacultyFilter("all"); // reset dropdown when typing
                  }}
                />
              </div>

              {/* ── Faculty dropdown ── */}
              <select
                className={styles.filterSelect}
                value={facultyFilter}
                onChange={e => {
                  setFacultyFilter(e.target.value);
                  setFacultySearch(""); // reset search when dropdown chosen
                }}
              >
                <option value="all">كل الكليات</option>
                {facultyNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>

              {/* ── Year dropdown ── */}
              {years.length > 0 && (
                <select
                  className={styles.filterSelect}
                  value={yearFilter}
                  onChange={e => setYearFilter(e.target.value)}
                >
                  <option value="all">العام الدراسي</option>
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              )}

              {/* ── Reset filters ── */}
              {(facultyFilter !== "all" || yearFilter !== "all" || facultySearch !== "") && (
                <button
                  className={styles.resetBtn}
                  onClick={() => {
                    setFacultyFilter("all");
                    setYearFilter("all");
                    setFacultySearch("");
                  }}
                >
                  <XCircle size={13} /> مسح
                </button>
              )}

              <button className={styles.filterBtn} onClick={fetchPlans}>
                <Filter size={13} /> تحديث
              </button>
            </div>
          </div>

          {/* Results count */}
          {(facultyFilter !== "all" || yearFilter !== "all" || facultySearch !== "") && (
            <p className={styles.resultsCount}>
              {filtered.length} نتيجة من أصل {plans.length}
            </p>
          )}

          {error && (
            <div className={styles.errorBanner}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {loading ? (
            <div className={styles.stateBox}>
              <RefreshCw size={36} className={styles.spinner} />
              <p>جاري تحميل البيانات…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.stateBox}>
              <Building2 size={44} style={{ opacity: 0.3, display: "block", margin: "0 auto" }} />
              <p>لا توجد نتائج مطابقة</p>
            </div>
          ) : (
            <div className={styles.cardsGrid}>
              {filtered.map(plan => (
                <FacultyCard
                  key={plan.plan_id}
                  plan={plan}
                  onDownload={handleDownload}
                  downloading={downloadingId === plan.plan_id}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "reports" && (
        <div className={styles.reportsWrapper} />
      )}

      {toastMsg && <div className={styles.toast}>{toastMsg}</div>}
    </div>
  );
}