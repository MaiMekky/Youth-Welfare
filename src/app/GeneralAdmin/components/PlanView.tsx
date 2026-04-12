"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  FileText, Download, Calendar, Building2,
  RefreshCw, AlertCircle, Eye, Filter, CheckCircle,
  XCircle, Clock, Layers, X, MapPin, Users, Tag,
  DollarSign, BookOpen, ChevronRight, Info,
} from "lucide-react";
import styles from "../Styles/Planview.module.css";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";

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

interface PlanEvent {
  event_id: number;
  title: string;
  description: string;
  dept: number;
  dept_name: string;
  faculty: number;
  faculty_name: string;
  created_by: number;
  created_by_name: string;
  family: number;
  family_name: string;
  cost: string;
  location: string;
  restrictions: string;
  reward: string;
  status: string;
  type: string;
  st_date: string;
  end_date: string;
  s_limit: number;
  resource: string;
  selected_facs: number[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface PlanDetails {
  name: string;
  term: number;
  faculty: number;
  faculty_name: string;
  dept: number;
  dept_name: string;
  created_by: number;
  created_by_name: string;
  events: PlanEvent[];
  created_at: string;
  updated_at: string;
}

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("access") : null;

const BASE = getBaseUrl();

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

function eventStatusClass(status?: string) {
  const s = status?.trim() ?? "";
  if (s === "مكتمل" || s === "complete" || s === "approved") return styles.eventBadgeComplete;
  if (s === "ملغي" || s === "cancelled") return styles.eventBadgeCancelled;
  return styles.eventBadgePending;
}

/* ── Plan Details Modal ── */
function PlanDetailsModal({
  plan,
  onClose,
}: {
  plan: Plan;
  onClose: () => void;
}) {
  const [details, setDetails]     = useState<PlanDetails | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [activeEvent, setActiveEvent] = useState<PlanEvent | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await authFetch(`${BASE}/api/events/plans/${plan.plan_id}/details/`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setDetails(data);
        setError("");
      } catch {
        setError("فشل في جلب تفاصيل الخطة.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [plan.plan_id]);

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdrop}>
      <div className={styles.modalSheet}>

        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <button className={styles.modalCloseBtn} onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <div className={styles.modalHeaderRight}>
            <h2 className={styles.modalTitle}>{plan.faculty_name || plan.name}</h2>
            <p className={styles.modalSubtitle}>
              تفاصيل الخطة السنوية · الفصل الدراسي {plan.term}
            </p>
          </div>
        </div>

        {loading ? (
          <div className={styles.modalState}>
            <RefreshCw size={38} className={styles.spinner} />
            <p>جاري تحميل التفاصيل…</p>
          </div>
        ) : error ? (
          <div className={styles.modalState}>
            <AlertCircle size={38} style={{ color: "#DC2626" }} />
            <p style={{ color: "#DC2626" }}>{error}</p>
          </div>
        ) : details ? (
          <div className={styles.modalBody}>

            {/* Plan Meta Info — الكلية removed */}
            <div className={styles.planMetaGrid}>
              <div className={styles.planMetaItem}>
                <span className={styles.planMetaLabel}>القسم</span>
                <span className={styles.planMetaValue}>{details.dept_name || "—"}</span>
              </div>
              <div className={styles.planMetaItem}>
                <span className={styles.planMetaLabel}>منشئ الخطة</span>
                <span className={styles.planMetaValue}>{details.created_by_name}</span>
              </div>
              <div className={styles.planMetaItem}>
                <span className={styles.planMetaLabel}>تاريخ الإنشاء</span>
                <span className={styles.planMetaValue}>{fmt(details.created_at)}</span>
              </div>
              <div className={styles.planMetaItem}>
                <span className={styles.planMetaLabel}>آخر تحديث</span>
                <span className={styles.planMetaValue}>{fmt(details.updated_at)}</span>
              </div>
              <div className={styles.planMetaItem}>
                <span className={styles.planMetaLabel}>عدد الفعاليات</span>
                <span className={`${styles.planMetaValue} ${styles.planMetaCount}`}>
                  {details.events.length}
                </span>
              </div>
            </div>

            {/* Events Section */}
            <div className={styles.eventsSection}>
              <div className={styles.eventsSectionHeader}>
                <BookOpen size={17} />
                <h3>الفعاليات المخططة</h3>
                <span className={styles.eventsCountBadge}>{details.events.length}</span>
              </div>

              {details.events.length === 0 ? (
                <div className={styles.noEvents}>
                  <Info size={32} style={{ opacity: 0.3 }} />
                  <p>لا توجد فعاليات مسجلة في هذه الخطة</p>
                </div>
              ) : (
                <div className={styles.eventsTable}>
                  {/* Table Header */}
                  <div className={styles.eventsTableHead}>
                    <span className={styles.colTitle}>الفعالية</span>
                    <span className={styles.colDept}>القسم</span>
                    <span className={styles.colDates}>التواريخ</span>
                    <span className={styles.colCost}>التكلفة</span>
                    <span className={styles.colLimit}>الحد الأقصى</span>
                    <span className={styles.colStatus}>الحالة</span>
                    <span className={styles.colAction}></span>
                  </div>

                  {/* Table Rows */}
                  {details.events.map((ev, idx) => (
                    <div
                      key={ev.event_id}
                      className={`${styles.eventsTableRow} ${activeEvent?.event_id === ev.event_id ? styles.rowActive : ""}`}
                    >
                      <span className={styles.colTitle}>
                        <span className={styles.eventIndex}>{idx + 1}</span>
                        <span className={styles.eventTitle}>{ev.title}</span>
                      </span>
                      <span className={styles.colDept}>{ev.dept_name || "—"}</span>
                      <span className={styles.colDates}>
                        <span className={styles.dateRange}>
                          {fmt(ev.st_date)}
                          {ev.end_date && ev.end_date !== ev.st_date && (
                            <> — {fmt(ev.end_date)}</>
                          )}
                        </span>
                      </span>
                      <span className={styles.colCost}>
                        {ev.cost && ev.cost !== "0" ? `${ev.cost} ج.م` : "مجاني"}
                      </span>
                      <span className={styles.colLimit}>
                        {ev.s_limit > 0 ? ev.s_limit.toLocaleString("ar-EG") : "—"}
                      </span>
                      <span className={styles.colStatus}>
                        <span className={`${styles.eventBadge} ${eventStatusClass(ev.status)}`}>
                          {ev.status || "قيد المراجعة"}
                        </span>
                      </span>
                      <span className={styles.colAction}>
                        <button
                          className={styles.eventExpandBtn}
                          onClick={() => setActiveEvent(activeEvent?.event_id === ev.event_id ? null : ev)}
                          title="تفاصيل"
                        >
                          <ChevronRight
                            size={15}
                            style={{
                              transform: activeEvent?.event_id === ev.event_id ? "rotate(90deg)" : "rotate(0deg)",
                              transition: "transform 0.2s",
                            }}
                          />
                        </button>
                      </span>

                      {/* Expanded Details */}
                      {activeEvent?.event_id === ev.event_id && (
                        <div className={styles.eventExpandedDetails}>
                          <div className={styles.eventDetailGrid}>
                            {ev.description && (
                              <div className={styles.eventDetailFull}>
                                <span className={styles.eventDetailLabel}>الوصف</span>
                                <span className={styles.eventDetailValue}>{ev.description}</span>
                              </div>
                            )}
                            {ev.location && (
                              <div className={styles.eventDetailItem}>
                                <MapPin size={13} />
                                <span className={styles.eventDetailLabel}>الموقع</span>
                                <span className={styles.eventDetailValue}>{ev.location}</span>
                              </div>
                            )}
                            {ev.type && (
                              <div className={styles.eventDetailItem}>
                                <Tag size={13} />
                                <span className={styles.eventDetailLabel}>النوع</span>
                                <span className={styles.eventDetailValue}>{ev.type}</span>
                              </div>
                            )}
                            {ev.family_name && (
                              <div className={styles.eventDetailItem}>
                                <Users size={13} />
                                <span className={styles.eventDetailLabel}>الفئة</span>
                                <span className={styles.eventDetailValue}>{ev.family_name}</span>
                              </div>
                            )}
                            {ev.reward && (
                              <div className={styles.eventDetailItem}>
                                <DollarSign size={13} />
                                <span className={styles.eventDetailLabel}>المكافأة</span>
                                <span className={styles.eventDetailValue}>{ev.reward}</span>
                              </div>
                            )}
                            {ev.restrictions && (
                              <div className={styles.eventDetailItem}>
                                <Info size={13} />
                                <span className={styles.eventDetailLabel}>القيود</span>
                                <span className={styles.eventDetailValue}>{ev.restrictions}</span>
                              </div>
                            )}
                            {ev.resource && (
                              <div className={styles.eventDetailItem}>
                                <BookOpen size={13} />
                                <span className={styles.eventDetailLabel}>الموارد</span>
                                <span className={styles.eventDetailValue}>{ev.resource}</span>
                              </div>
                            )}
                            {ev.created_by_name && (
                              <div className={styles.eventDetailItem}>
                                <Users size={13} />
                                <span className={styles.eventDetailLabel}>منشئ الفعالية</span>
                                <span className={styles.eventDetailValue}>{ev.created_by_name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FacultyCard({ plan, onDownload, downloading, onView }: {
  plan: Plan;
  onDownload: (plan: Plan) => void;
  downloading: boolean;
  onView: (plan: Plan) => void;
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
            <Eye size={16} /> عرض الخطة
          </button>
        ) : (
          <button className={styles.btnView} onClick={() => onView(plan)}>
            <Eye size={16} /> عرض الخطة
          </button>
        )}
        <button
          className={styles.btnDownload}
          onClick={() => onDownload(plan)}
          disabled={downloading || isMissing}
          title="تحميل PDF"
        >
          {downloading
            ? <RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} />
            : <Download size={15} />}
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
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const { showToast } = useToast();
  const [viewingPlan, setViewingPlan]     = useState<Plan | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${BASE}/api/events/plans/list/`, {
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
      const res = await authFetch(`${BASE}/api/event/export-plan-pdf/${plan.plan_id}/`, {
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
      showToast("✅ تم تحميل الخطة بنجاح", "success");
    } catch {
      showToast("⚠️ فشل تحميل الملف، حاول مجدداً", "error");
    } finally {
      setDownloadingId(null);
    }
  };

  const totalPlans    = plans.length;
  const completePlans = plans.filter(p => !p.status?.includes("مفقود") && p.status !== "missing").length;
  const missingPlans  = plans.filter(p => p.status?.includes("مفقود") || p.status === "missing").length;

  const years = Array.from(new Set(plans.map(p => p.academic_year).filter(Boolean))) as string[];

  const filtered = plans.filter(p => {
    const matchYear    = yearFilter === "all" || p.academic_year === yearFilter;
    const matchFaculty = facultyFilter === "all" || p.faculty_name === facultyFilter;
    return matchYear && matchFaculty;
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
          <FileText size={18} /> خطط الاقسام
        </button>
      </div>

      {activeTab === "plans" && (
        <>
          {/* Info banner */}
          <div className={styles.infoBanner}>
            <CheckCircle size={22} />
            <div className={styles.infoBannerText}>
              <h3>خطط الاقسام السنوية</h3>
              <p>عرض ومراجعة الخطط السنوية المرسلة من كل قسم للأنشطة الطلابية والفعاليات. يتم تحديث هذه الخطط في بداية كل عام دراسي.</p>
            </div>
          </div>

          {/* Stats row */}
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <div className={`${styles.statIconBox} ${styles.navy}`}>
                <Layers size={22} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{totalPlans}</div>
                <div className={styles.statTitle}>إجمالي الأقسام</div>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={`${styles.statIconBox} ${styles.green}`}>
                <CheckCircle size={22} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{completePlans}</div>
                <div className={styles.statTitle}>خطط مكتملة</div>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={`${styles.statIconBox} ${styles.amber}`}>
                <Clock size={22} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{missingPlans}</div>
                <div className={styles.statTitle}>خطط مفقودة</div>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={`${styles.statIconBox} ${styles.blue}`}>
                <Calendar size={22} />
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
              <h2>خطط الاقسام</h2>
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

              {(facultyFilter !== "all" || yearFilter !== "all") && (
                <button
                  className={styles.resetBtn}
                  onClick={() => {
                    setFacultyFilter("all");
                    setYearFilter("all");
                  }}
                >
                  <XCircle size={14} /> مسح
                </button>
              )}

              <button className={styles.filterBtn} onClick={fetchPlans}>
                <Filter size={14} /> تحديث
              </button>
            </div>
          </div>

          {(facultyFilter !== "all" || yearFilter !== "all") && (
            <p className={styles.resultsCount}>
              {filtered.length} نتيجة من أصل {plans.length}
            </p>
          )}

          {error && (
            <div className={styles.errorBanner}>
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {loading ? (
            <div className={styles.stateBox}>
              <RefreshCw size={42} className={styles.spinner} />
              <p>جاري تحميل البيانات…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.stateBox}>
              <Building2 size={52} style={{ opacity: 0.3, display: "block", margin: "0 auto" }} />
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
                  onView={setViewingPlan}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "reports" && (
        <div className={styles.reportsWrapper} />
      )}

      {viewingPlan && (
        <PlanDetailsModal
          plan={viewingPlan}
          onClose={() => setViewingPlan(null)}
        />
      )}

    </div>
  );
}
