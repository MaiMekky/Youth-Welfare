// "use client";
// import React, { useEffect, useState, useCallback } from "react";
// import {
//   FileText, BarChart3, Download, Calendar, Building2,
//   RefreshCw, AlertCircle, Eye, Filter, CheckCircle,
//   XCircle, Clock, Layers,
// } from "lucide-react";
// // import SemesterReports from "./SemesterReports";
// import styles from "../Styles/Planview.module.css";

// // ─── Types ───────────────────────────────────────────────────────────────────

// interface Plan {
//   plan_id: number;
//   name: string;
//   term: number;
//   faculty: number;
//   faculty_name: string;
//   events_count: number;
//   created_at: string;
//   updated_at: string;
//   // Optional fields the API may return
//   status?: string;           // e.g. "مكتملة" | "مفقودة" | "قيد المراجعة"
//   students_count?: number;
//   academic_year?: string;
//   plan_status?: string;      // e.g. "محدثة" | "غير محدثة"
//   submitted_at?: string;
//   last_updated?: string;
// }

// // ─── Helpers ─────────────────────────────────────────────────────────────────

// const getToken = () =>
//   typeof window !== "undefined" ? localStorage.getItem("access") : null;

// const BASE = "http://127.0.0.1:8000";

// function fmt(d?: string) {
//   if (!d) return null;
//   return new Date(d).toLocaleDateString("ar-EG", {
//     year: "numeric", month: "2-digit", day: "2-digit",
//   });
// }

// // Derive badge class from status string
// function statusBadgeClass(status?: string) {
//   const s = status?.trim() ?? "";
//   if (s === "مكتملة" || s === "مكتمل" || s === "complete") return styles.badgeComplete;
//   if (s === "مفقودة" || s === "مفقود" || s === "missing")  return styles.badgeMissing;
//   return styles.badgePending;
// }

// function statusLabel(status?: string) {
//   const s = status?.trim() ?? "";
//   if (s === "مكتملة" || s === "complete") return "مكتملة";
//   if (s === "مفقودة" || s === "missing")  return "مفقودة";
//   if (s) return s;
//   return "قيد المراجعة";
// }

// function planStatusBadgeClass(ps?: string) {
//   if (!ps) return `${styles.metaBadge} ${styles["green"]}`;
//   if (ps.includes("غير")) return `${styles.metaBadge} ${styles["orange"]}`;
//   return `${styles.metaBadge} ${styles["green"]}`;
// }

// // ─── Faculty Card ─────────────────────────────────────────────────────────────

// function FacultyCard({ plan, onDownload, downloading }: {
//   plan: Plan;
//   onDownload: (plan: Plan) => void;
//   downloading: boolean;
// }) {
//   const isMissing = plan.status?.includes("مفقود") || plan.status === "missing";
//   const badgeCls  = statusBadgeClass(plan.status);
//   const label     = statusLabel(plan.status);

//   return (
//     <div className={styles.facultyCard}>

//       {/* Top: name + status */}
//       <div className={styles.cardTop}>
//         <h3 className={styles.facultyName}>{plan.faculty_name || plan.name}</h3>
//         <span className={`${styles.badge} ${badgeCls}`}>{label}</span>
//       </div>

//       {/* Counts: students + events */}
//       <div className={styles.cardCounts}>
//         {plan.students_count !== undefined && (
//           <div className={styles.countItem}>
//             <div className={styles.countValue}>{plan.students_count.toLocaleString("ar-EG")}</div>
//             <div className={styles.countLabel}>الطلاب</div>
//           </div>
//         )}
//         <div className={styles.countItem}>
//           <div className={styles.countValue}>{plan.events_count ?? 0}</div>
//           <div className={styles.countLabel}>الفعاليات المخططة</div>
//         </div>
//       </div>

//       {/* Meta rows */}
//       <div className={styles.cardMeta}>
//         {plan.academic_year && (
//           <div className={styles.metaRow}>
//             <span className={styles.metaLabel}>العام الدراسي</span>
//             <span className={styles.metaValue}>{plan.academic_year}</span>
//           </div>
//         )}
//         {plan.plan_status && (
//           <div className={styles.metaRow}>
//             <span className={styles.metaLabel}>حالة الخطة</span>
//             <span className={planStatusBadgeClass(plan.plan_status)}>{plan.plan_status}</span>
//           </div>
//         )}
//         {(plan.term !== undefined) && !plan.academic_year && (
//           <div className={styles.metaRow}>
//             <span className={styles.metaLabel}>الفصل الدراسي</span>
//             <span className={styles.metaValue}>الفصل {plan.term}</span>
//           </div>
//         )}
//       </div>

//       {/* Details box */}
//       <div className={`${styles.cardDetailsBox} ${isMissing ? styles.missing : ""}`}>
//         {isMissing ? (
//           "لم يتم إرسال خطة لهذا الفصل الدراسي"
//         ) : (
//           <>
//             <strong>تفاصيل الخطة</strong>
//             <br />
//             {plan.submitted_at && <>تم الإرسال والموافقة عليها<br />آخر تحديث: {fmt(plan.submitted_at)}</>}
//             {!plan.submitted_at && plan.created_at && <>تم الإرسال والموافقة عليها<br />آخر تحديث: {fmt(plan.updated_at ?? plan.created_at)}</>}
//           </>
//         )}
//       </div>

//       {/* Actions */}
//       <div className={styles.cardActions}>
//         {isMissing ? (
//           <button className={styles.btnView} disabled>
//             <Eye size={14} /> عرض الخطة
//           </button>
//         ) : (
//           <button className={styles.btnView}>
//             <Eye size={14} /> عرض الخطة
//           </button>
//         )}

//         <button
//           className={styles.btnDownload}
//           onClick={() => onDownload(plan)}
//           disabled={downloading || isMissing}
//           title="تحميل PDF"
//         >
//           {downloading
//             ? <RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} />
//             : <Download size={13} />}
//           تحميل
//         </button>
//       </div>
//     </div>
//   );
// }

// // ─── Main Component ───────────────────────────────────────────────────────────

// export default function PlanView() {
//   const [activeTab, setActiveTab]         = useState<"plans" | "reports">("plans");
//   const [plans, setPlans]                 = useState<Plan[]>([]);
//   const [loading, setLoading]             = useState(true);
//   const [error, setError]                 = useState("");
//   const [yearFilter, setYearFilter]       = useState("all");
//   const [downloadingId, setDownloadingId] = useState<number | null>(null);
//   const [toastMsg, setToastMsg]           = useState("");

//   const showToast = (msg: string) => {
//     setToastMsg(msg);
//     setTimeout(() => setToastMsg(""), 3500);
//   };

//   // ── Fetch plans ──
//   const fetchPlans = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res = await fetch(`${BASE}/api/events/plans/list/`, {
//         headers: { Authorization: `Bearer ${getToken()}` },
//       });
//       if (!res.ok) throw new Error();
//       const data = await res.json();
//       setPlans(Array.isArray(data) ? data : data.results ?? []);
//       setError("");
//     } catch {
//       setError("فشل في جلب البيانات. تحقق من الاتصال.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (activeTab === "plans") fetchPlans();
//   }, [activeTab, fetchPlans]);

//   // ── Download PDF ──
//   const handleDownload = async (plan: Plan) => {
//     if (downloadingId !== null) return;
//     setDownloadingId(plan.plan_id);
//     try {
//       const res = await fetch(`${BASE}/api/event/export-plan-pdf/${plan.plan_id}/`, {
//         headers: { Authorization: `Bearer ${getToken()}` },
//       });
//       if (!res.ok) throw new Error();
//       const blob = await res.blob();
//       const url  = URL.createObjectURL(blob);
//       const a    = document.createElement("a");
//       a.href     = url;
//       a.download = `${plan.faculty_name ?? plan.name}.pdf`;
//       a.click();
//       URL.revokeObjectURL(url);
//       showToast("✅ تم تحميل الخطة بنجاح");
//     } catch {
//       showToast("⚠️ فشل تحميل الملف، حاول مجدداً");
//     } finally {
//       setDownloadingId(null);
//     }
//   };

//   // ── Derived stats ──
//   const totalPlans    = plans.length;
//   const completePlans = plans.filter(p => !p.status?.includes("مفقود") && p.status !== "missing").length;
//   const missingPlans  = plans.filter(p => p.status?.includes("مفقود") || p.status === "missing").length;

//   // derive academic years from data
//   const years = Array.from(new Set(plans.map(p => p.academic_year).filter(Boolean))) as string[];

//   // ── Filter ──
//   const filtered = plans.filter(p =>
//     yearFilter === "all" || p.academic_year === yearFilter
//   );

//   // current academic year from data or fallback
//   const currentYear = years[0] ?? "2024-2025";

//   return (
//     <div className={styles.root}>

//       {/* ── Tabs ── */}
//       <div className={styles.tabs}>
//         <button
//           className={`${styles.tab} ${activeTab === "plans" ? styles.active : ""}`}
//           onClick={() => setActiveTab("plans")}
//         >
//           <FileText size={16} />
//           خطة الكليات
//         </button>
//         <button
//           className={`${styles.tab} ${activeTab === "reports" ? styles.active : ""}`}
//           onClick={() => setActiveTab("reports")}
//         >
//           <BarChart3 size={16} />
//           التقارير الفصلية
//         </button>
//       </div>

//       {/* ── Plans Tab ── */}
//       {activeTab === "plans" && (
//         <>
//           {/* Info banner */}
//           <div className={styles.infoBanner}>
//             <CheckCircle size={18} />
//             <div className={styles.infoBannerText}>
//               <h3>خطط الكليات السنوية</h3>
//               <p>عرض ومراجعة الخطط السنوية المرسلة من كل كلية للأنشطة الطلابية والفعاليات. يتم تحديث هذه الخطط في بداية كل عام دراسي.</p>
//             </div>
//           </div>

//           {/* Stats row */}
//           <div className={styles.statsRow}>
//             <div className={styles.statItem}>
//               <div className={`${styles.statIconBox} ${styles.navy}`}>
//                 <Layers size={19} />
//               </div>
//               <div className={styles.statContent}>
//                 <div className={styles.statValue}>{totalPlans}</div>
//                 <div className={styles.statTitle}>إجمالي الكليات</div>
//               </div>
//             </div>

//             <div className={styles.statItem}>
//               <div className={`${styles.statIconBox} ${styles.green}`}>
//                 <CheckCircle size={19} />
//               </div>
//               <div className={styles.statContent}>
//                 <div className={styles.statValue}>{completePlans}</div>
//                 <div className={styles.statTitle}>خطط مكتملة</div>
//               </div>
//             </div>

//             <div className={styles.statItem}>
//               <div className={`${styles.statIconBox} ${styles.amber}`}>
//                 <Clock size={19} />
//               </div>
//               <div className={styles.statContent}>
//                 <div className={styles.statValue}>{missingPlans}</div>
//                 <div className={styles.statTitle}>خطط مفقودة</div>
//               </div>
//             </div>

//             <div className={styles.statItem}>
//               <div className={`${styles.statIconBox} ${styles.blue}`}>
//                 <Calendar size={19} />
//               </div>
//               <div className={styles.statContent}>
//                 <div className={`${styles.statValue} ${styles.yearValue}`}>{currentYear}</div>
//                 <div className={styles.statTitle}>العام الدراسي</div>
//               </div>
//             </div>
//           </div>

//           {/* Section header */}
//           <div className={styles.sectionHeader}>
//             <div className={styles.sectionHeaderText}>
//               <h2>خطط الكليات</h2>
//               <p>مراجعة وتحميل الخطط السنوية للأنشطة الطلابية</p>
//             </div>
//             <div className={styles.sectionControls}>
//               {years.length > 0 && (
//                 <select
//                   className={styles.filterSelect}
//                   value={yearFilter}
//                   onChange={e => setYearFilter(e.target.value)}
//                 >
//                   <option value="all">العام الدراسي</option>
//                   {years.map(y => (
//                     <option key={y} value={y}>{y}</option>
//                   ))}
//                 </select>
//               )}
//               <button className={styles.filterBtn} onClick={fetchPlans}>
//                 <Filter size={13} /> تصفية
//               </button>
//             </div>
//           </div>

//           {/* Error */}
//           {error && (
//             <div className={styles.errorBanner}>
//               <AlertCircle size={16} /> {error}
//             </div>
//           )}

//           {/* Cards */}
//           {loading ? (
//             <div className={styles.stateBox}>
//               <RefreshCw size={36} className={styles.spinner} />
//               <p>جاري تحميل البيانات…</p>
//             </div>
//           ) : filtered.length === 0 ? (
//             <div className={styles.stateBox}>
//               <Building2 size={44} style={{ opacity: 0.3, display: "block", margin: "0 auto" }} />
//               <p>لا توجد خطط متاحة</p>
//             </div>
//           ) : (
//             <div className={styles.cardsGrid}>
//               {filtered.map(plan => (
//                 <FacultyCard
//                   key={plan.plan_id}
//                   plan={plan}
//                   onDownload={handleDownload}
//                   downloading={downloadingId === plan.plan_id}
//                 />
//               ))}
//             </div>
//           )}
//         </>
//       )}

//       {/* ── Reports Tab ── */}
//       {activeTab === "reports" && (
//         <div className={styles.reportsWrapper}>
//           <SemesterReports />
//         </div>
//       )}

//       {/* ── Toast ── */}
//       {toastMsg && <div className={styles.toast}>{toastMsg}</div>}
//     </div>
//   );
// }

"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  FileText, BarChart3, Download, Calendar, Building2,
  RefreshCw, AlertCircle, Eye, Filter, CheckCircle,
  Clock, Layers,
} from "lucide-react";
// import SemesterReports from "./SemesterReports";
import styles from "../Styles/Planview.module.css";

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
  status?: string;
  students_count?: number;
  academic_year?: string;
  plan_status?: string;
  submitted_at?: string;
  last_updated?: string;
}

// ─── Dummy Data (shown when API is unreachable) ───────────────────────────────

const DUMMY_PLANS: Plan[] = [
  {
    plan_id: 1,
    name: "خطة كلية الهندسة",
    term: 1,
    faculty: 1,
    faculty_name: "كلية الهندسة",
    events_count: 12,
    created_at: "2024-09-01T00:00:00Z",
    updated_at: "2024-09-01T00:00:00Z",
    submitted_at: "2024-09-01T00:00:00Z",
    status: "مكتملة",
    students_count: 850,
    academic_year: "2024-2025",
    plan_status: "محدثة",
  },
  {
    plan_id: 2,
    name: "خطة كلية إدارة الأعمال",
    term: 1,
    faculty: 2,
    faculty_name: "كلية إدارة الأعمال",
    events_count: 8,
    created_at: "2024-08-28T00:00:00Z",
    updated_at: "2024-08-28T00:00:00Z",
    submitted_at: "2024-08-28T00:00:00Z",
    status: "مكتملة",
    students_count: 720,
    academic_year: "2024-2025",
    plan_status: "محدثة",
  },
  {
    plan_id: 3,
    name: "خطة كلية الآداب",
    term: 1,
    faculty: 3,
    faculty_name: "كلية الآداب",
    events_count: 15,
    created_at: "2024-08-20T00:00:00Z",
    updated_at: "2024-08-20T00:00:00Z",
    submitted_at: "2024-08-20T00:00:00Z",
    status: "مفقودة",
    students_count: 480,
    academic_year: "2024-2025",
    plan_status: "غير محدثة",
  },
  {
    plan_id: 4,
    name: "خطة كلية العلوم",
    term: 1,
    faculty: 4,
    faculty_name: "كلية العلوم",
    events_count: 10,
    created_at: "2024-09-05T00:00:00Z",
    updated_at: "2024-09-05T00:00:00Z",
    submitted_at: "2024-09-05T00:00:00Z",
    status: "مكتملة",
    students_count: 630,
    academic_year: "2024-2025",
    plan_status: "محدثة",
  },
  {
    plan_id: 5,
    name: "خطة كلية الطب",
    term: 1,
    faculty: 5,
    faculty_name: "كلية الطب",
    events_count: 6,
    created_at: "2024-09-10T00:00:00Z",
    updated_at: "2024-09-10T00:00:00Z",
    submitted_at: "2024-09-10T00:00:00Z",
    status: "مكتملة",
    students_count: 320,
    academic_year: "2024-2025",
    plan_status: "محدثة",
  },
  {
    plan_id: 6,
    name: "خطة كلية الحقوق",
    term: 1,
    faculty: 6,
    faculty_name: "كلية الحقوق",
    events_count: 4,
    created_at: "2024-09-02T00:00:00Z",
    updated_at: "2024-09-02T00:00:00Z",
    submitted_at: "2024-09-02T00:00:00Z",
    status: "مكتملة",
    students_count: 290,
    academic_year: "2024-2025",
    plan_status: "محدثة",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
  if (!ps) return `${styles.metaBadge} ${styles.green}`;
  if (ps.includes("غير")) return `${styles.metaBadge} ${styles.orange}`;
  return `${styles.metaBadge} ${styles.green}`;
}

// ─── Faculty Card ─────────────────────────────────────────────────────────────

function FacultyCard({ plan, onDownload, downloading, isDummy }: {
  plan: Plan;
  onDownload: (plan: Plan) => void;
  downloading: boolean;
  isDummy: boolean;
}) {
  const isMissing = plan.status?.includes("مفقود") || plan.status === "missing";
  const badgeCls  = statusBadgeClass(plan.status);
  const label     = statusLabel(plan.status);

  return (
    <div className={styles.facultyCard}>

      {/* Top: name + status */}
      <div className={styles.cardTop}>
        <h3 className={styles.facultyName}>{plan.faculty_name || plan.name}</h3>
        <span className={`${styles.badge} ${badgeCls}`}>{label}</span>
      </div>

      {/* Counts */}
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

      {/* Meta rows */}
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
        {plan.term !== undefined && !plan.academic_year && (
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>الفصل الدراسي</span>
            <span className={styles.metaValue}>الفصل {plan.term}</span>
          </div>
        )}
      </div>

      {/* Details box */}
      <div className={`${styles.cardDetailsBox} ${isMissing ? styles.missing : ""}`}>
        {isMissing ? (
          "لم يتم إرسال خطة لهذا الفصل الدراسي"
        ) : (
          <>
            <strong>تفاصيل الخطة</strong>
            <br />
            {plan.submitted_at
              ? <>تم الإرسال والموافقة عليها<br />آخر تحديث: {fmt(plan.submitted_at)}</>
              : plan.created_at
                ? <>تم الإرسال والموافقة عليها<br />آخر تحديث: {fmt(plan.updated_at ?? plan.created_at)}</>
                : null
            }
          </>
        )}
      </div>

      {/* Actions */}
      <div className={styles.cardActions}>
        <button className={styles.btnView} disabled={!!isMissing}>
          <Eye size={14} /> عرض الخطة
        </button>

        <button
          className={styles.btnDownload}
          onClick={() => onDownload(plan)}
          disabled={downloading || !!isMissing || isDummy}
          title={isDummy ? "غير متاح في وضع البيانات التجريبية" : "تحميل PDF"}
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PlanView() {
  const [activeTab, setActiveTab]         = useState<"plans" | "reports">("plans");
  const [plans, setPlans]                 = useState<Plan[]>([]);
  const [loading, setLoading]             = useState(true);
  const [usingDummy, setUsingDummy]       = useState(false);
  const [yearFilter, setYearFilter]       = useState("all");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [toastMsg, setToastMsg]           = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // ── Fetch plans ──
  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setUsingDummy(false);

      const res = await fetch(`${BASE}/api/events/plans/list/`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results ?? [];

      if (list.length === 0) {
        // API returned empty — show dummy so UI isn't blank
        setPlans(DUMMY_PLANS);
        setUsingDummy(true);
      } else {
        setPlans(list);
      }
    } catch {
      // API unreachable — fall back to dummy data silently
      setPlans(DUMMY_PLANS);
      setUsingDummy(true);
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

    if (usingDummy) {
      showToast("⚠️ التحميل غير متاح في وضع البيانات التجريبية");
      return;
    }

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

  // ── Derived stats ──
  const totalPlans    = plans.length;
  const completePlans = plans.filter(p => !p.status?.includes("مفقود") && p.status !== "missing").length;
  const missingPlans  = plans.filter(p =>  p.status?.includes("مفقود") || p.status === "missing").length;
  const years         = Array.from(new Set(plans.map(p => p.academic_year).filter(Boolean))) as string[];
  const currentYear   = years[0] ?? "2024-2025";

  const filtered = plans.filter(p =>
    yearFilter === "all" || p.academic_year === yearFilter
  );

  return (
    <div className={styles.root}>

      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "plans" ? styles.active : ""}`}
          onClick={() => setActiveTab("plans")}
        >
          <FileText size={16} />
          خطة الكليات
        </button>
        <button
          className={`${styles.tab} ${activeTab === "reports" ? styles.active : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          <BarChart3 size={16} />
          التقارير الفصلية
        </button>
      </div>

      {/* ── Plans Tab ── */}
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

          {/* Dummy data notice banner */}
          {usingDummy && (
            <div
              className={styles.errorBanner}
              style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E", marginBottom: 14 }}
            >
              <AlertCircle size={16} />
              <span>يتم عرض بيانات تجريبية — الخادم غير متاح حالياً.</span>
              <button
                onClick={fetchPlans}
                style={{
                  marginRight: "auto", background: "none", border: "none",
                  cursor: "pointer", fontSize: 12, fontWeight: 700,
                  color: "#92400E", textDecoration: "underline", fontFamily: "inherit",
                }}
              >
                إعادة المحاولة
              </button>
            </div>
          )}

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
              <button className={styles.filterBtn} onClick={fetchPlans}>
                <Filter size={13} /> تصفية
              </button>
            </div>
          </div>

          {/* Cards */}
          {loading ? (
            <div className={styles.stateBox}>
              <RefreshCw size={36} className={styles.spinner} />
              <p>جاري تحميل البيانات…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.stateBox}>
              <Building2 size={44} style={{ opacity: 0.3, display: "block", margin: "0 auto" }} />
              <p>لا توجد خطط متاحة</p>
            </div>
          ) : (
            <div className={styles.cardsGrid}>
              {filtered.map(plan => (
                <FacultyCard
                  key={plan.plan_id}
                  plan={plan}
                  onDownload={handleDownload}
                  downloading={downloadingId === plan.plan_id}
                  isDummy={usingDummy}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Reports Tab ── */}
      {activeTab === "reports" && (
        <div className={styles.reportsWrapper}>
          {/* <SemesterReports /> */}
        </div>
      )}

      {/* ── Toast ── */}
      {toastMsg && <div className={styles.toast}>{toastMsg}</div>}
    </div>
  );
}