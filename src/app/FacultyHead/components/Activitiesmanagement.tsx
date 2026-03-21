
"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Eye, CheckCircle, XCircle, Clock, Calendar, MapPin,
  Users, DollarSign, Building2, Tag, X,
  Layers, AlertCircle, RefreshCw, FileDown,
} from "lucide-react";
import styles from "../Styles/Activitiesmanagement.module.css";
import { authFetch } from "@/utils/globalFetch";

interface EventRow {
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
  faculty_id: number;
  dept_id: number;
}

interface EventDetail {
  event_id: number;
  created_by_name: string;
  faculty_name: string;
  dept_name: string;
  family_name: string;
  title: string;
  description: string;
  updated_at: string;
  cost: string;
  location: string;
  restrictions: string;
  reward: string;
  status: string;
  imgs: string;
  st_date: string;
  end_date: string;
  s_limit: number;
  created_at: string;
  type: string;
  resource: string;
  selected_facs: number[];
}

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("access") : null;

const BASE = "http://127.0.0.1:8000";

type TabKey = "pending" | "approved" | "rejected";

const STATUS_MAP: Record<string, { label: string; cls: string; accent: string }> = {
  "موافقة مبدئية": { label: "قيد الانتظار", cls: "sPending",  accent: "accentPending"  },
  "مقبول":         { label: "مقبول",         cls: "sApproved", accent: "accentApproved" },
  "مرفوض":         { label: "مرفوض",         cls: "sRejected", accent: "accentRejected" },
  "pending":       { label: "منتظر",          cls: "sPending",  accent: "accentPending"  },
  "approved":      { label: "مقبول",          cls: "sApproved", accent: "accentApproved" },
  "rejected":      { label: "مرفوض",          cls: "sRejected", accent: "accentRejected" },
};

function statusInfo(raw: string) {
  const key = raw?.trim();
  return (
    STATUS_MAP[key] ??
    STATUS_MAP[key?.toLowerCase()] ?? { label: raw, cls: "sPending", accent: "accentPending" }
  );
}
function isPending(raw: string)        { const k=raw?.trim(); return k==="موافقة مبدئية"||k?.toLowerCase()==="pending"; }
function isApprovedStatus(raw: string) { const k=raw?.trim(); return k==="مقبول"||k?.toLowerCase()==="approved"; }
function isRejectedStatus(raw: string) { const k=raw?.trim(); return k==="مرفوض"||k?.toLowerCase()==="rejected"; }

function fmt(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ar-EG");
}
function limitLabel(n: number) {
  return n >= 2147483647 ? "غير محدود" : n.toLocaleString("ar-EG");
}
function extractTypes(events: EventRow[]): string[] {
  const set = new Set<string>();
  events.forEach(e => { if (e.type?.trim()) set.add(e.type.trim()); });
  return Array.from(set).sort();
}

/* ─── Detail Modal ─── */
function DetailModal({ id, onClose }: { id: number; onClose: () => void }) {
  const [detail, setDetail] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch(`${BASE}/api/event/get-events/${id}/`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) throw new Error();
        setDetail(await res.json());
      } catch { setErr("فشل في تحميل تفاصيل الفعالية"); }
      finally   { setLoading(false); }
    })();
  }, [id]);

  const si = detail ? statusInfo(detail.status) : null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{loading ? "جاري التحميل…" : detail?.title ?? "تفاصيل الفعالية"}</h2>
          <button className={styles.modalCloseBtn} onClick={onClose}><X size={18}/></button>
        </div>
        <div className={styles.modalBody}>
          {loading && <div className={styles.stateBox}><RefreshCw size={36} className={styles.spinner}/><p>جاري التحميل…</p></div>}
          {err && <p style={{color:"#EF4444",textAlign:"center",fontWeight:600}}>{err}</p>}
          {detail && !loading && (
            <>
              <div className={styles.modalTopRow}>
                <span className={`${styles.badge} ${styles[si!.cls]}`}>{si!.label}</span>
                {detail.type && <span className={styles.typeTag}>{detail.type}</span>}
              </div>
              {detail.description && <div className={styles.descBox}>{detail.description}</div>}
              <div className={styles.detailGrid}>
                {[
                  { icon:<Building2 size={15}/>,  label:"الجهة",         val:`${detail.faculty_name??"—"} / ${detail.dept_name??"—"}` },
                  { icon:<Users size={15}/>,       label:"منشئ الفعالية", val:detail.created_by_name },
                  { icon:<MapPin size={15}/>,      label:"الموقع",        val:detail.location },
                  { icon:<Calendar size={15}/>,    label:"تاريخ البداية", val:fmt(detail.st_date) },
                  { icon:<Calendar size={15}/>,    label:"تاريخ النهاية", val:fmt(detail.end_date) },
                  { icon:<Users size={15}/>,       label:"الحد الأقصى",   val:limitLabel(detail.s_limit) },
                  { icon:<DollarSign size={15}/>,  label:"التكلفة",       val:detail.cost||"مجاني" },
                  { icon:<Tag size={15}/>,         label:"المكافأة",      val:detail.reward||"—" },
                  { icon:<AlertCircle size={15}/>, label:"القيود",        val:detail.restrictions||"لا يوجد" },
                  { icon:<Layers size={15}/>,      label:"الموارد",       val:detail.resource||"—" },
                ].map(({icon,label,val}) => (
                  <div key={label} className={styles.detailItem}>
                    <div className={styles.detailIcon}>{icon}</div>
                    <div>
                      <div className={styles.detailLabel}>{label}</div>
                      <div className={styles.detailVal}>{val||"—"}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.modalFooter}>
                <span>تاريخ الإنشاء: {fmt(detail.created_at)}</span>
                <span>آخر تحديث: {fmt(detail.updated_at)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Confirm Dialog ─── */
function ConfirmDialog({ action, eventTitle, onConfirm, onCancel, loading }: {
  action: "approve"|"reject"; eventTitle: string;
  onConfirm: ()=>void; onCancel: ()=>void; loading: boolean;
}) {
  const isApprove = action === "approve";
  return (
    <div className={styles.confirmOverlay}>
      <div className={styles.confirmBox}>
        <div className={styles.confirmIcon} style={{background:isApprove?"#ECFDF5":"#FEF2F2",color:isApprove?"#10B981":"#EF4444"}}>
          {isApprove ? <CheckCircle size={32}/> : <XCircle size={32}/>}
        </div>
        <h3>{isApprove?"تأكيد الاعتماد":"تأكيد الرفض"}</h3>
        <p>هل أنت متأكد من {isApprove?"اعتماد":"رفض"} فعالية<br/><strong style={{color:"#111827"}}>"{eventTitle}"</strong>؟</p>
        <div className={styles.confirmBtns}>
          <button className={styles.cancelBtn} onClick={onCancel} disabled={loading}>إلغاء</button>
          <button
            className={styles.confirmActionBtn}
            style={{background:isApprove?"#10B981":"#EF4444"}}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading?"جاري التنفيذ…":isApprove?"اعتماد":"رفض"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Event Card – Full Width ─── */
function EventCard({ ev, onView, onExport, onApprove, onReject, isExporting, pdfError }: {
  ev: EventRow;
  onView: ()=>void;
  onExport: ()=>void;
  onApprove: ()=>void;
  onReject: ()=>void;
  isExporting: boolean;
  pdfError: string | null;
}) {
  const si = statusInfo(ev.status);
  const pending = isPending(ev.status);
  const isFree = !ev.cost || ev.cost === "0" || ev.cost === "0.00";

  return (
    <div className={styles.eventCard}>
      <div className={`${styles.cardAccent} ${styles[si.accent]}`} />
      <div className={styles.cardBody}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleBlock}>
            <div className={styles.cardTitle}>{ev.title}</div>
            {ev.description && <div className={styles.cardDesc}>{ev.description}</div>}
          </div>
          <div className={styles.cardBadges}>
            {ev.type && <span className={styles.typeBadge}>{ev.type}</span>}
          </div>
        </div>

        <div className={styles.cardMeta}>
          <div className={styles.metaItem}>
            <span className={styles.metaIcon}><MapPin size={16}/></span>
            <div className={styles.metaContent}>
              <div className={styles.metaLabel}>الموقع</div>
              <div className={styles.metaValue}>{ev.location || "—"}</div>
            </div>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaIcon}><Users size={16}/></span>
            <div className={styles.metaContent}>
              <div className={styles.metaLabel}>المشاركون</div>
              <div className={styles.metaValue}>{limitLabel(ev.s_limit)}</div>
            </div>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaIcon}><Calendar size={16}/></span>
            <div className={styles.metaContent}>
              <div className={styles.metaLabel}>البداية</div>
              <div className={styles.metaValue}>{fmt(ev.st_date)}</div>
            </div>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaIcon}><Calendar size={16}/></span>
            <div className={styles.metaContent}>
              <div className={styles.metaLabel}>النهاية</div>
              <div className={styles.metaValue}>{fmt(ev.end_date)}</div>
            </div>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaIcon}><DollarSign size={16}/></span>
            <div className={styles.metaContent}>
              <div className={styles.metaLabel}>التكلفة</div>
              {isFree
                ? <div className={styles.metaValueFree}>مجاني</div>
                : <div className={styles.metaValue}>{ev.cost} جنيه</div>
              }
            </div>
          </div>
        </div>

        {pdfError && (
          <div className={styles.pdfErrorHint}>
            <AlertCircle size={13}/> {pdfError}
          </div>
        )}
      </div>

      <div className={styles.cardFooter}>
        <button className={`${styles.iconBtn} ${styles.btnView}`} onClick={onView}>
          <Eye size={15}/> <span className={styles.btnLabel}>عرض التفاصيل</span>
        </button>
        <button
          className={`${styles.iconBtn} ${styles.btnExport} ${pdfError ? styles.btnExportError : ""}`}
          onClick={onExport}
          disabled={isExporting}
          title={pdfError ?? "تصدير PDF"}
        >
          {isExporting
            ? <><RefreshCw size={15} className={styles.spinnerSm}/> <span className={styles.btnLabel}>جاري التصدير…</span></>
            : <><FileDown size={15}/> <span className={styles.btnLabel}>تصدير PDF</span></>
          }
        </button>
        {pending && (
          <>
            <button className={`${styles.iconBtn} ${styles.btnApprove}`} onClick={onApprove}>
              <CheckCircle size={15}/> <span className={styles.btnLabel}>اعتماد</span>
            </button>
            <button className={`${styles.iconBtn} ${styles.btnReject}`} onClick={onReject}>
              <XCircle size={15}/> <span className={styles.btnLabel}>رفض</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function ActivitiesManagement() {
  const [events, setEvents]               = useState<EventRow[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [viewId, setViewId]               = useState<number|null>(null);
  const [confirm, setConfirm]             = useState<{id:number;action:"approve"|"reject";title:string}|null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [exportingId, setExportingId]     = useState<number|null>(null);
  const [pdfErrors, setPdfErrors]         = useState<Record<number,string>>({});
  const [search, setSearch]               = useState("");
  const [filterType, setFilterType]       = useState("all");
  const [activeTab, setActiveTab]         = useState<TabKey>("pending");
  const [toastMsg, setToastMsg]           = useState("");

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(()=>setToastMsg(""),4000); };

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${BASE}/api/event/get-events/`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error();
      setEvents(await res.json());
      setError("");
    } catch { setError("فشل في جلب البيانات. تحقق من الاتصال."); }
    finally   { setLoading(false); }
  }, []);

  useEffect(()=>{ fetchEvents(); },[fetchEvents]);

  const handleAction = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      const endpoint = confirm.action==="approve"
        ? `${BASE}/api/event/approve-events/${confirm.id}/approve/`
        : `${BASE}/api/event/approve-events/${confirm.id}/reject/`;
      const res = await authFetch(endpoint,{method:"PATCH",headers:{Authorization:`Bearer ${getToken()}`}});
      if (!res.ok) throw new Error();
      showToast(confirm.action==="approve"?"✅ تم اعتماد الفعالية بنجاح":"❌ تم رفض الفعالية");
      setConfirm(null); fetchEvents();
    } catch { showToast("⚠️ حدث خطأ أثناء تنفيذ الإجراء"); }
    finally   { setActionLoading(false); }
  };

  const handleExportPDF = async (eventId: number, eventTitle: string) => {
    setExportingId(eventId);
    setPdfErrors(prev => { const n={...prev}; delete n[eventId]; return n; });
    try {
      const res = await authFetch(
        `${BASE}/api/event/summary-reports/${eventId}/summary-pdf/`,
        { method:"GET", headers:{ Authorization:`Bearer ${getToken()}`, Accept:"application/pdf" } }
      );
      if (!res.ok) {
        let serverMsg = `خطأ ${res.status}`;
        try {
          const ct = res.headers.get("content-type") ?? "";
          if (ct.includes("json")) {
            const j = await res.json();
            serverMsg = j?.detail ?? j?.message ?? j?.error ?? serverMsg;
          } else {
            const t = await res.text();
            if (t && t.length < 200) serverMsg = t;
          }
        } catch { /* ignore */ }
        setPdfErrors(prev => ({...prev, [eventId]: `فشل التصدير: ${serverMsg}`}));
        showToast(`⚠️ فشل تصدير PDF — ${serverMsg}`);
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `تقرير-${eventTitle}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
      showToast("📄 تم تصدير التقرير بنجاح");
    } catch {
      setPdfErrors(prev => ({...prev, [eventId]: "خطأ في الشبكة"}));
      showToast("⚠️ خطأ في الشبكة أثناء تصدير PDF");
    } finally { setExportingId(null); }
  };

  const availableTypes = extractTypes(events);

  const applyFilters = (list: EventRow[]) => list.filter(e => {
    const term = search.toLowerCase();
    const matchSearch = !search ||
      e.title?.toLowerCase().includes(term) ||
      e.location?.toLowerCase().includes(term) ||
      e.type?.toLowerCase().includes(term);
    const matchType = filterType==="all" || e.type?.trim()===filterType;
    return matchSearch && matchType;
  });

  const allFiltered   = applyFilters(events);
  const pendingList   = allFiltered.filter(e => isPending(e.status));
  const approvedList  = allFiltered.filter(e => isApprovedStatus(e.status));
  const rejectedList  = allFiltered.filter(e => isRejectedStatus(e.status));

  // Raw counts (without search filter) for tab badges
  const countPending  = events.filter(e=>isPending(e.status)).length;
  const countApproved = events.filter(e=>isApprovedStatus(e.status)).length;
  const countRejected = events.filter(e=>isRejectedStatus(e.status)).length;

  const activeList =
    activeTab==="pending"  ? pendingList  :
    activeTab==="approved" ? approvedList : rejectedList;

  const renderCards = (list: EventRow[]) => list.map(ev => (
    <EventCard
      key={ev.event_id}
      ev={ev}
      isExporting={exportingId===ev.event_id}
      pdfError={pdfErrors[ev.event_id] ?? null}
      onView={()=>setViewId(ev.event_id)}
      onExport={()=>handleExportPDF(ev.event_id, ev.title)}
      onApprove={()=>setConfirm({id:ev.event_id,action:"approve",title:ev.title})}
      onReject={()=>setConfirm({id:ev.event_id,action:"reject",title:ev.title})}
    />
  ));

  return (
    <div className={styles.root}>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1>مراجعة واعتماد الفعاليات</h1>
          <p>إدارة ومتابعة طلبات الفعاليات المقدمة من إدارات الكليات</p>
        </div>
        <button className={styles.refreshBtn} onClick={fetchEvents}>
          <RefreshCw size={15}/> تحديث البيانات
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.total}`}>
          <div className={styles.statIcon}><Layers size={24}/></div>
          <div className={styles.statBody}><div className={styles.statNum}>{events.length}</div><div className={styles.statLabel}>إجمالي الطلبات</div></div>
        </div>
        <div className={`${styles.statCard} ${styles.pending}`}>
          <div className={styles.statIcon}><Clock size={24}/></div>
          <div className={styles.statBody}><div className={styles.statNum}>{countPending}</div><div className={styles.statLabel}>قيد المراجعة</div></div>
        </div>
        <div className={`${styles.statCard} ${styles.approved}`}>
          <div className={styles.statIcon}><CheckCircle size={24}/></div>
          <div className={styles.statBody}><div className={styles.statNum}>{countApproved}</div><div className={styles.statLabel}>معتمدة</div></div>
        </div>
        <div className={`${styles.statCard} ${styles.rejected}`}>
          <div className={styles.statIcon}><XCircle size={24}/></div>
          <div className={styles.statBody}><div className={styles.statNum}>{countRejected}</div><div className={styles.statLabel}>مرفوضة</div></div>
        </div>
      </div>

      {/* Main Card */}
      <div className={styles.tableCard}>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <h2 className={styles.toolbarTitle}>قائمة الفعاليات المقدمة</h2>
          <div className={styles.toolbarControls}>
            <input
              className={styles.searchInput}
              placeholder="🔍 ابحث بالعنوان، الموقع، النوع…"
              value={search}
              onChange={e=>setSearch(e.target.value)}
            />
            <select className={styles.filterSelect} value={filterType} onChange={e=>setFilterType(e.target.value)}>
              <option value="all">كل الأنشطة</option>
              {availableTypes.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Status Tabs */}
        <div className={styles.tabsRow}>
          <button
            className={`${styles.tabBtn} ${styles.tabPending} ${activeTab==="pending" ? styles.tabActive : ""}`}
            onClick={()=>setActiveTab("pending")}
          >
            <Clock size={17}/>
            قيد الانتظار
            <span className={styles.tabCount}>{countPending}</span>
          </button>
          <button
            className={`${styles.tabBtn} ${styles.tabApproved} ${activeTab==="approved" ? styles.tabActive : ""}`}
            onClick={()=>setActiveTab("approved")}
          >
            <CheckCircle size={17}/>
            معتمدة
            <span className={styles.tabCount}>{countApproved}</span>
          </button>
          <button
            className={`${styles.tabBtn} ${styles.tabRejected} ${activeTab==="rejected" ? styles.tabActive : ""}`}
            onClick={()=>setActiveTab("rejected")}
          >
            <XCircle size={17}/>
            مرفوضة
            <span className={styles.tabCount}>{countRejected}</span>
          </button>
        </div>

        {error && <div className={styles.errorBanner}><AlertCircle size={17}/> {error}</div>}

        {loading ? (
          <div className={styles.stateBox}>
            <RefreshCw size={40} className={styles.spinner}/>
            <p>جاري تحميل البيانات…</p>
          </div>
        ) : activeList.length === 0 ? (
          <div className={styles.stateBox}>
            <Layers size={48}/>
            <p>لا توجد فعاليات في هذا القسم</p>
          </div>
        ) : (
          <div className={styles.cardsGrid}>
            {renderCards(activeList)}
          </div>
        )}
      </div>

      {viewId!==null && <DetailModal id={viewId} onClose={()=>setViewId(null)}/>}
      {confirm && <ConfirmDialog action={confirm.action} eventTitle={confirm.title} onConfirm={handleAction} onCancel={()=>setConfirm(null)} loading={actionLoading}/>}
      {toastMsg && <div className={styles.toast}>{toastMsg}</div>}
    </div>
  );
}