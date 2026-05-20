
"use client";
import React, { useEffect, useState, useCallback ,useRef } from "react";
import {
  Eye, CheckCircle, XCircle, Clock, Calendar, MapPin,
  Users, DollarSign, Building2, Tag, X,
  Layers, AlertCircle, RefreshCw, FileDown,AlertTriangle,MessageSquare
} from "lucide-react";
import styles from "../Styles/Activitiesmanagement.module.css";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";

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
  rejection_reason?: string;
}

const BASE = getBaseUrl();

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
        const res = await authFetch(`${BASE}/api/event/get-events/${id}/`);
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
                  { icon:<AlertCircle size={15}/>, label:"الشروط",        val:detail.restrictions||"لا يوجد" },
                  { icon:<Layers size={15}/>,      label:"الموارد",       val:detail.resource||"—" },
                  ...(detail.status && isRejectedStatus(detail.status) && detail.rejection_reason
                  ? [{ icon: <MessageSquare size={15}/>, label: "سبب الرفض", val: detail.rejection_reason }]
                  : []),
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
/* ─── Rejection Reason Dialog ─── */
function RejectionReasonDialog({
  eventTitle,
  onConfirm,
  onCancel,
  loading,
}: {
  eventTitle: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasError = touched && !reason.trim();

  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, []);

  const handleSubmit = () => {
    setTouched(true);
    if (!reason.trim()) return;
    onConfirm(reason.trim());
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
        animation: "fadeInOverlay 0.2s ease",
      }}
      onClick={onCancel}
    >
      <style>{`
        @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUpCard {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .rejection-textarea:focus {
          outline: none;
          border-color: #EF4444 !important;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.15) !important;
        }
        .rejection-cancel-btn:hover { background: #F1F5F9 !important; }
        .rejection-submit-btn:hover:not(:disabled) {
          background: #DC2626 !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(239,68,68,0.35) !important;
        }
        .rejection-submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }
      `}</style>

      <div
        style={{
          background: "#FFFFFF", borderRadius: "20px",
          width: "100%", maxWidth: "480px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.2), 0 8px 24px rgba(239,68,68,0.08)",
          animation: "slideUpCard 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          overflow: "hidden", direction: "rtl",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Red top stripe */}
        <div style={{ height: "5px", background: "linear-gradient(90deg, #EF4444, #F97316)" }} />

        {/* Header */}
        <div style={{ padding: "28px 28px 0", display: "flex", alignItems: "flex-start", gap: "16px" }}>
          <div style={{
            width: "52px", height: "52px", borderRadius: "14px",
            background: "linear-gradient(135deg, #FEE2E2, #FECACA)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, boxShadow: "0 4px 12px rgba(239,68,68,0.2)",
          }}>
            <XCircle size={26} color="#EF4444" />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>
              رفض الفعالية
            </h2>
            <p style={{ margin: "6px 0 0", fontSize: "0.875rem", color: "#6B7280", lineHeight: 1.5 }}>
              سيتم إرسال سبب الرفض إلى منشئ الفعالية
            </p>
          </div>
          <button
            onClick={onCancel} disabled={loading}
            style={{
              width: "36px", height: "36px", borderRadius: "10px",
              border: "none", background: "#F3F4F6", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#6B7280", flexShrink: 0, transition: "background 0.15s",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Event name pill */}
        <div style={{ padding: "18px 28px 0" }}>
          <div style={{
            background: "#FFF7ED", border: "1px solid #FED7AA",
            borderRadius: "10px", padding: "10px 14px",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <AlertTriangle size={15} color="#F97316" />
            <span style={{
              fontSize: "0.875rem", color: "#9A3412", fontWeight: 600,
              flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {eventTitle}
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 28px" }}>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
            سبب الرفض
            <span style={{ color: "#EF4444", marginRight: "3px" }}>*</span>
          </label>
          <textarea
            ref={textareaRef}
            className="rejection-textarea"
            value={reason}
            onChange={e => { setReason(e.target.value); setTouched(false); }}
            onBlur={() => setTouched(true)}
            placeholder="اكتب سبب الرفض بوضوح ليتمكن المسؤول من التعديل والإعادة..."
            rows={4}
            maxLength={500}
            style={{
              width: "100%", resize: "none", borderRadius: "12px",
              border: `1.5px solid ${hasError ? "#EF4444" : "#E5E7EB"}`,
              padding: "12px 14px", fontSize: "0.9rem", color: "#111827",
              background: hasError ? "#FFF5F5" : "#F9FAFB",
              boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.6,
              transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s", display: "block",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
            {hasError ? (
              <span style={{ fontSize: "0.8rem", color: "#EF4444", display: "flex", alignItems: "center", gap: "4px" }}>
                <AlertCircle size={13} /> سبب الرفض مطلوب
              </span>
            ) : <span />}
            <span style={{ fontSize: "0.78rem", color: reason.length > 450 ? "#EF4444" : "#9CA3AF" }}>
              {reason.length}/500
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "0 28px 28px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            className="rejection-cancel-btn"
            onClick={onCancel} disabled={loading}
            style={{
              padding: "10px 22px", borderRadius: "10px",
              border: "1.5px solid #E5E7EB", background: "#FFFFFF",
              color: "#374151", fontSize: "0.9rem", fontWeight: 600,
              cursor: "pointer", transition: "background 0.15s", fontFamily: "inherit",
            }}
          >
            إلغاء
          </button>
          <button
            className="rejection-submit-btn"
            onClick={handleSubmit} disabled={loading}
            style={{
              padding: "10px 24px", borderRadius: "10px", border: "none",
              background: "linear-gradient(135deg, #EF4444, #DC2626)",
              color: "#FFFFFF", fontSize: "0.9rem", fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
              transition: "all 0.2s", boxShadow: "0 4px 14px rgba(239,68,68,0.3)",
              fontFamily: "inherit",
            }}
          >
            {loading
              ? <><RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} /> جاري الرفض…</>
              : <><XCircle size={15} /> تأكيد الرفض</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
/* ─── Confirm Dialog ─── */
function ConfirmDialog({ action, eventTitle, onConfirm, onCancel, loading }: {
  action: "approve"; eventTitle: string;
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
        <p>هل أنت متأكد من {isApprove?"اعتماد":"رفض"} فعالية<br/><strong style={{color:"#111827"}}>&quot;{eventTitle}&quot;</strong>؟</p>
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
  const { showToast } = useToast();
  const [events, setEvents]               = useState<EventRow[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [viewId, setViewId]               = useState<number|null>(null);
  const [confirm, setConfirm] = useState<{id:number;action:"approve"|"reject";title:string}|null>(null);
  const [rejectTarget, setRejectTarget] = useState<{id:number;title:string}|null>(null);  // ← add
  const [actionLoading, setActionLoading] = useState(false);
  const [exportingId, setExportingId]     = useState<number|null>(null);
  const [pdfErrors, setPdfErrors]         = useState<Record<number,string>>({});  const [search, setSearch]               = useState("");
  const [filterType, setFilterType]       = useState("all");
  const [activeTab, setActiveTab]         = useState<TabKey>("pending");
  const [toastMsg, setToastMsg]           = useState("");

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${BASE}/api/event/get-events/`);
      if (!res.ok) throw new Error();
      setEvents(await res.json());
      setError("");
    } catch { setError("فشل في جلب البيانات. تحقق من الاتصال."); }
    finally   { setLoading(false); }
  }, []);

  useEffect(()=>{ fetchEvents(); },[fetchEvents]);

// Keep this for approve only
const handleApprove = async () => {
  if (!confirm) return;
  setActionLoading(true);
  try {
    const res = await authFetch(
      `${BASE}/api/event/approve-events/${confirm.id}/approve/`,
      { method: "PATCH" }
    );
    if (!res.ok) throw new Error();
    showToast("✅ تم اعتماد الفعالية بنجاح", "success");
    setConfirm(null);
    fetchEvents();
  } catch { showToast("⚠️ حدث خطأ أثناء تنفيذ الإجراء", "error"); }
  finally   { setActionLoading(false); }
};

// New handler for reject with reason
const handleReject = async (reason: string) => {
  if (!rejectTarget) return;
  setActionLoading(true);
  try {
    const res = await authFetch(
      `${BASE}/api/event/approve-events/${rejectTarget.id}/reject/`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejection_reason: reason }),
      }
    );
    if (!res.ok) throw new Error();
    showToast("❌ تم رفض الفعالية", "error");
    setRejectTarget(null);
    fetchEvents();
  } catch { showToast("⚠️ حدث خطأ أثناء تنفيذ الإجراء", "error"); }
  finally   { setActionLoading(false); }
};

  const handleExportPDF = async (eventId: number, eventTitle: string) => {
    setExportingId(eventId);
    setPdfErrors(prev => { const n={...prev}; delete n[eventId]; return n; });
    try {
      const res = await authFetch(
        `${BASE}/api/event/summary-reports/${eventId}/summary-pdf/`,
        { method:"GET", headers:{ Accept:"application/pdf" } }
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
        showToast(`⚠️ فشل تصدير PDF — ${serverMsg}`, "error");
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `تقرير-${eventTitle}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
      showToast("📄 تم تصدير التقرير بنجاح", "success");
    } catch {
      setPdfErrors(prev => ({...prev, [eventId]: "خطأ في الشبكة"}));
      showToast("⚠️ خطأ في الشبكة أثناء تصدير PDF", "error");
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
     onApprove={() => setConfirm({id:ev.event_id, action:"approve", title:ev.title})}
     onReject={()  => setRejectTarget({id:ev.event_id, title:ev.title})}  // ← change this
       /> ));

  return (
    <div className={styles.root}>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1>مراجعة واعتماد الفعاليات</h1>
          <p>إدارة ومتابعة طلبات الفعاليات المقدمة من إدارات الكليات</p>
        </div>
      
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
              placeholder=" ابحث عن فعالية"
              value={search}
              onChange={e=>setSearch(e.target.value)}
            />
           
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
      {/* Approve confirm dialog */}
      {confirm && (
        <ConfirmDialog
          action="approve"
          eventTitle={confirm.title}
          onConfirm={handleApprove}
          onCancel={() => setConfirm(null)}
          loading={actionLoading}
        />
      )}

      {/* Rejection reason dialog — same as doc 4 */}
      {rejectTarget && (
        <RejectionReasonDialog
          eventTitle={rejectTarget.title}
          onConfirm={handleReject}
          onCancel={() => setRejectTarget(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
