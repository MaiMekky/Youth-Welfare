"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  FileText, Download, Calendar, Building2,
  RefreshCw, AlertCircle, ChevronLeft, ChevronRight,
  Layers, Hash, BookOpen, Eye, X, MapPin, Users,
  Tag, DollarSign, Star, User, Briefcase,
  ChevronDown, ChevronUp, CheckCircle, XCircle, AlertTriangle
} from "lucide-react";
import SemesterReports from "./SemesterReports";
import styles from "../Styles/PlanView.module.css";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";

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

interface EventDetail {
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
}

interface PlanDetail {
  name: string;
  term: number;
  faculty: number;
  faculty_name: string;
  dept: number;
  dept_name: string;
  created_by: number;
  created_by_name: string;
  events: EventDetail[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("access") : null;

const BASE = getBaseUrl();

function fmt(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ar-EG", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function statusConfig(status: string) {
  switch (status?.toLowerCase()) {
    case "approved": case "مقبول": return { label: "مقبول", cls: "approved" };
    case "pending":  case "معلق":  return { label: "معلق",  cls: "pending"  };
    case "rejected": case "مرفوض": return { label: "مرفوض", cls: "rejected" };
    default: return { label: status || "—", cls: "default" };
  }
}

// ─── Plan Details Modal ───────────────────────────────────────────────────────

function PlanDetailsModal({ planId, planName, onClose }: {
  planId: number;
  planName: string;
  onClose: () => void;
}) {
  const [detail, setDetail]       = useState<PlanDetail | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await authFetch(`${BASE}/api/events/plans/${planId}/details/`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setDetail(data);
        setError("");
      } catch {
        setError("فشل في جلب تفاصيل الخطة. تحقق من الاتصال.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [planId]);

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdrop}>
      <div className={styles.modal}>

        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <div className={styles.modalIcon}><FileText size={20} /></div>
            <div>
              <h2 className={styles.modalTitle}>{planName}</h2>
              {detail && (
                <p className={styles.modalSubtitle}>
                  {detail.faculty_name} · {detail.dept_name} · الفصل {detail.term}
                </p>
              )}
            </div>
          </div>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.modalBody}>
          {loading ? (
            <div className={styles.modalLoading}>
              <RefreshCw size={32} className={styles.spinner} />
              <p>جاري تحميل التفاصيل…</p>
            </div>
          ) : error ? (
            <div className={styles.modalError}>
              <AlertCircle size={18} /> {error}
            </div>
          ) : detail ? (
            <>
              {/* Plan Info Strip */}
              <div className={styles.planInfoStrip}>
                <div className={styles.planInfoItem}>
                  <Building2 size={14} />
                  <span className={styles.planInfoLabel}>الكلية</span>
                  <span className={styles.planInfoVal}>{detail.faculty_name || "—"}</span>
                </div>
                <div className={styles.planInfoDivider} />
                <div className={styles.planInfoItem}>
                  <Briefcase size={14} />
                  <span className={styles.planInfoLabel}>القسم</span>
                  <span className={styles.planInfoVal}>{detail.dept_name || "—"}</span>
                </div>
                <div className={styles.planInfoDivider} />
                <div className={styles.planInfoItem}>
                  <User size={14} />
                  <span className={styles.planInfoLabel}>أنشئت بواسطة</span>
                  <span className={styles.planInfoVal}>{detail.created_by_name || "—"}</span>
                </div>
                <div className={styles.planInfoDivider} />
                <div className={styles.planInfoItem}>
                  <Hash size={14} />
                  <span className={styles.planInfoLabel}>الفصل</span>
                  <span className={styles.termPill}>الفصل {detail.term}</span>
                </div>
              </div>

              {/* Events Section */}
              <div className={styles.eventsSection}>
                <div className={styles.eventsSectionHeader}>
                  <h3 className={styles.eventsSectionTitle}>
                    الفعاليات
                    <span className={styles.eventsCount}>{detail.events.length}</span>
                  </h3>
                </div>

                {detail.events.length === 0 ? (
                  <div className={styles.noEvents}>
                    <BookOpen size={36} />
                    <p>لا توجد فعاليات في هذه الخطة</p>
                  </div>
                ) : (
                  <div className={styles.eventsList}>
                    {detail.events.map((ev) => {
                      const sc = statusConfig(ev.status);
                      const isExpanded = expandedId === ev.event_id;
                      return (
                        <div
                          key={ev.event_id}
                          className={`${styles.eventCard} ${isExpanded ? styles.eventCardExpanded : ""}`}
                        >
                          {/* Event Header */}
                          <div
                            className={styles.eventCardHeader}
                            onClick={() => setExpandedId(isExpanded ? null : ev.event_id)}
                          >
                            <div className={styles.eventCardLeft}>
                              <div className={`${styles.eventStatusDot} ${styles[sc.cls]}`} />
                              <div>
                                <div className={styles.eventTitle}>{ev.title || "—"}</div>
                                <div className={styles.eventMeta}>
                                  <span><MapPin size={11} /> {ev.location || "—"}</span>
                                  <span><Calendar size={11} /> {fmt(ev.st_date)} – {fmt(ev.end_date)}</span>
                                  <span><Tag size={11} /> {ev.family_name || "—"}</span>
                                </div>
                              </div>
                            </div>
                            <div className={styles.eventCardRight}>
                              <span className={`${styles.statusBadge} ${styles[sc.cls]}`}>{sc.label}</span>
                              <span className={`${styles.activeBadge} ${ev.active ? styles.activeOn : styles.activeOff}`}>
                                {ev.active ? <><CheckCircle size={11} /> نشط</> : <><XCircle size={11} /> غير نشط</>}
                              </span>
                              <button className={styles.expandBtn}>
                                {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                              </button>
                            </div>
                          </div>

                          {/* Event Expanded Details */}
                          {isExpanded && (
                            <div className={styles.eventDetails}>
                              {ev.description && (
                                <div className={styles.eventDesc}>{ev.description}</div>
                              )}
                              <div className={styles.eventGrid}>
                                <div className={styles.eventGridItem}>
                                  <span className={styles.gridLabel}><Building2 size={12} /> الكلية</span>
                                  <span className={styles.gridVal}>{ev.faculty_name || "—"}</span>
                                </div>
                                <div className={styles.eventGridItem}>
                                  <span className={styles.gridLabel}><Briefcase size={12} /> القسم</span>
                                  <span className={styles.gridVal}>{ev.dept_name || "—"}</span>
                                </div>
                                <div className={styles.eventGridItem}>
                                  <span className={styles.gridLabel}><User size={12} /> المنشئ</span>
                                  <span className={styles.gridVal}>{ev.created_by_name || "—"}</span>
                                </div>
                                <div className={styles.eventGridItem}>
                                  <span className={styles.gridLabel}><Tag size={12} /> النوع</span>
                                  <span className={styles.gridVal}>{ev.type || "—"}</span>
                                </div>
                                <div className={styles.eventGridItem}>
                                  <span className={styles.gridLabel}><DollarSign size={12} /> التكلفة</span>
                                  <span className={styles.gridVal}>{ev.cost ? `${ev.cost} ج.م` : "—"}</span>
                                </div>
                                <div className={styles.eventGridItem}>
                                  <span className={styles.gridLabel}><Users size={12} /> حد المقاعد</span>
                                  <span className={styles.gridVal}>{ev.s_limit || "—"}</span>
                                </div>
                                {ev.reward && (
                                  <div className={styles.eventGridItem}>
                                    <span className={styles.gridLabel}><Star size={12} /> المكافأة</span>
                                    <span className={styles.gridVal}>{ev.reward}</span>
                                  </div>
                                )}
                                {ev.restrictions && (
                                  <div className={styles.eventGridItem}>
                                    <span className={styles.gridLabel}><AlertTriangle size={12} /> القيود</span>
                                    <span className={styles.gridVal}>{ev.restrictions}</span>
                                  </div>
                                )}
                                {ev.resource && (
                                  <div className={styles.eventGridItem}>
                                    <span className={styles.gridLabel}><BookOpen size={12} /> المورد</span>
                                    <span className={styles.gridVal}>{ev.resource}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
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

  // ── Detail Modal state ──
  const [detailPlan, setDetailPlan] = useState<{ id: number; name: string } | null>(null);

  const rowsPerPage = 8;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // ── Fetch plans ──
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

  // ── Download PDF ──
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

  // ── Filter (name + term only) ──
  const filtered = plans.filter(p => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      p.name?.toLowerCase().includes(term) ||
      p.term?.toString().includes(term)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated  = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className={styles.root}>

      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        {/* <h1>خطة الكلية والتقارير</h1> */}
      </div>

      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "plans" ? styles.active : ""}`}
          onClick={() => setActiveTab("plans")}
        >
          <FileText size={17} />
          خطط الكلية
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
                placeholder=" ابحث بالاسم أو الفصل…"
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

          {/* Cards */}
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
            <div className={styles.cardsGrid}>
              {paginated.map(plan => (
                <div key={plan.plan_id} className={styles.facultyCard}>
                  <div className={styles.cardTop}>
                    <h3 className={styles.facultyName}>{plan.name || "—"}</h3>
                    <span className={styles.termBadge}>الفصل {plan.term ?? "—"}</span>
                  </div>

                  <div className={styles.cardCounts}>
                    <div className={styles.countItem}>
                      <div className={styles.countValue}>{plan.events_count ?? 0}</div>
                      <div className={styles.countLabel}>الفعاليات المخططة</div>
                    </div>
                  </div>

                  <div className={styles.cardMeta}>
                    <div className={styles.metaRow}>
                      <span className={styles.metaLabel}>تاريخ الإنشاء</span>
                      <span className={styles.metaValue}>{fmt(plan.created_at)}</span>
                    </div>
                  </div>

                  <div className={styles.cardDetailsBox}>
                    <strong>تفاصيل الخطة</strong>
                    <br />
                    {plan.updated_at && <>آخر تحديث: {fmt(plan.updated_at)}</>}
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      className={styles.btnView}
                      onClick={() => setDetailPlan({ id: plan.plan_id, name: plan.name })}
                    >
                      <Eye size={16} /> عرض التفاصيل
                    </button>
                    <button
                      className={styles.btnDownload}
                      onClick={() => handleDownload(plan)}
                      disabled={downloadingId === plan.plan_id}
                    >
                      {downloadingId === plan.plan_id ? (
                        <><RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} /> جاري…</>
                      ) : (
                        <><Download size={15} /> تحميل PDF</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {/* {!loading && filtered.length > 0 && (
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
          )} */}
        </div>
      )}

      {/* ── Reports Tab ── */}
      {activeTab === "reports" && (
        <div className={styles.reportsWrapper}>
          <SemesterReports />
        </div>
      )}

      {/* ── Detail Modal ── */}
      {detailPlan && (
        <PlanDetailsModal
          planId={detailPlan.id}
          planName={detailPlan.name}
          onClose={() => setDetailPlan(null)}
        />
      )}

      {/* ── Toast ── */}
      {toastMsg && <div className={styles.toast}>{toastMsg}</div>}
    </div>
  );
}
