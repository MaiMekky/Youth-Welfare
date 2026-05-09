"use client";
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import {
  Eye, Check, X, Clock, Calendar, Users,
  CheckCircle, XCircle, RefreshCw, AlertCircle, Layers, MapPin,
  User, BookOpen, DollarSign, Award, ShieldAlert, Package, Activity,
  MessageSquare, AlertTriangle,
} from "lucide-react";
import styles from "../../FacultyHead/Styles/Activitiesmanagement.module.css";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";

interface ActivityItem {
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
  dept_name?: string;
}

interface ActivityDetail {
  created_by_name: string;
  faculty_name: string;
  dept_name: string;
  family_name: string;
  participants: string | number;
  images: string | string[];
  title: string;
  description: string;
  updated_at: string;
  cost: string | number;
  location: string;
  restrictions: string | Record<string, unknown>;
  reward: string | Record<string, unknown>;
  status: string;
  st_date: string;
  end_date: string;
  s_limit: number;
  created_at: string;
  type: string;
  resource: string | Record<string, unknown>;
  selected_facs: number[];
  rejection_reason?: string; 
}

type StatusFilter = "pending" | "accepted" | "rejected";

const BASE = getBaseUrl();

function isPending(raw: string) {
  const k = raw?.trim();
  return k === "موافقة مبدئية" || k?.toLowerCase() === "pending";
}
function isAccepted(raw: string) {
  const k = raw?.trim();
  return k === "مقبول" || k?.toLowerCase() === "approved" || k?.toLowerCase() === "accepted";
}
function isRejected(raw: string) {
  const k = raw?.trim();
  return k === "مرفوض" || k?.toLowerCase() === "rejected";
}

function fmt(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ar-EG");
}
function fmtLong(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleString("ar-EG", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}
function safeStr(val: unknown): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (Array.isArray(val)) return val.map(safeStr).filter(Boolean).join(" | ");
  if (typeof val === "object" && val !== null) {
    const pick = (val as Record<string, unknown>).reward ?? (val as Record<string, unknown>).name ?? (val as Record<string, unknown>).title ?? (val as Record<string, unknown>).label ?? (val as Record<string, unknown>).value;
    if (pick !== undefined) return safeStr(pick);
    return Object.entries(val as Record<string, unknown>)
      .filter(([, v]) => v !== null && v !== undefined && typeof v !== "object")
      .map(([k, v]) => `${k}: ${v}`).join(" | ");
  }
  return String(val);
}

const deptCache = new Map<number, string>();

async function fetchDeptName(deptId: number): Promise<string> {
  if (deptCache.has(deptId)) return deptCache.get(deptId)!;
  try {
    const res = await authFetch(`${BASE}/api/family/departments/${deptId}/`);
    if (!res.ok) return `قسم ${deptId}`;
    const data = await res.json();
    const name = data.name || data.dept_name || data.department_name || `قسم ${deptId}`;
    deptCache.set(deptId, name);
    return name;
  } catch {
    return `قسم ${deptId}`;
  }
}

/* ── Rejection Reason Dialog ── */
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
    // Focus textarea on mount
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
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        animation: "fadeInOverlay 0.2s ease",
      }}
      onClick={onCancel}
    >
      <style>{`
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUpCard {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        .rejection-textarea:focus {
          outline: none;
          border-color: #EF4444 !important;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.15) !important;
        }
        .rejection-cancel-btn:hover {
          background: #F1F5F9 !important;
        }
        .rejection-submit-btn:hover:not(:disabled) {
          background: #DC2626 !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(239,68,68,0.35) !important;
        }
        .rejection-submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
      `}</style>

      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "480px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.2), 0 8px 24px rgba(239,68,68,0.08)",
          animation: "slideUpCard 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          overflow: "hidden",
          direction: "rtl",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Red top stripe */}
        <div style={{
          height: "5px",
          background: "linear-gradient(90deg, #EF4444, #F97316)",
        }} />

        {/* Header */}
        <div style={{
          padding: "28px 28px 0",
          display: "flex",
          alignItems: "flex-start",
          gap: "16px",
        }}>
          <div style={{
            width: "52px",
            height: "52px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #FEE2E2, #FECACA)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(239,68,68,0.2)",
          }}>
            <XCircle size={26} color="#EF4444" />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{
              margin: 0,
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#111827",
              lineHeight: 1.3,
            }}>
              رفض الفعالية
            </h2>
            <p style={{
              margin: "6px 0 0",
              fontSize: "0.875rem",
              color: "#6B7280",
              lineHeight: 1.5,
            }}>
              سيتم إرسال سبب الرفض إلى منشئ الفعالية
            </p>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              border: "none",
              background: "#F3F4F6",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6B7280",
              flexShrink: 0,
              transition: "background 0.15s",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Event name pill */}
        <div style={{ padding: "18px 28px 0" }}>
          <div style={{
            background: "#FFF7ED",
            border: "1px solid #FED7AA",
            borderRadius: "10px",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <AlertTriangle size={15} color="#F97316" />
            <span style={{
              fontSize: "0.875rem",
              color: "#9A3412",
              fontWeight: 600,
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {eventTitle}
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 28px" }}>
          <label style={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "#374151",
            marginBottom: "8px",
          }}>
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
              width: "100%",
              resize: "none",
              borderRadius: "12px",
              border: `1.5px solid ${hasError ? "#EF4444" : "#E5E7EB"}`,
              padding: "12px 14px",
              fontSize: "0.9rem",
              color: "#111827",
              background: hasError ? "#FFF5F5" : "#F9FAFB",
              boxSizing: "border-box",
              fontFamily: "inherit",
              lineHeight: 1.6,
              transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
              display: "block",
            }}
          />

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "6px",
          }}>
            {hasError ? (
              <span style={{
                fontSize: "0.8rem",
                color: "#EF4444",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}>
                <AlertCircle size={13} />
                سبب الرفض مطلوب
              </span>
            ) : (
              <span />
            )}
            <span style={{
              fontSize: "0.78rem",
              color: reason.length > 450 ? "#EF4444" : "#9CA3AF",
            }}>
              {reason.length}/500
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "0 28px 28px",
          display: "flex",
          gap: "12px",
          justifyContent: "flex-end",
        }}>
          <button
            className="rejection-cancel-btn"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: "10px 22px",
              borderRadius: "10px",
              border: "1.5px solid #E5E7EB",
              background: "#FFFFFF",
              color: "#374151",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s",
              fontFamily: "inherit",
            }}
          >
            إلغاء
          </button>
          <button
            className="rejection-submit-btn"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: "10px 24px",
              borderRadius: "10px",
              border: "none",
              background: "linear-gradient(135deg, #EF4444, #DC2626)",
              color: "#FFFFFF",
              fontSize: "0.9rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s",
              boxShadow: "0 4px 14px rgba(239,68,68,0.3)",
              fontFamily: "inherit",
            }}
          >
            {loading ? (
              <><RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} /> جاري الرفض…</>
            ) : (
              <><XCircle size={15} /> تأكيد الرفض</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Confirm Dialog (approve only now) ── */
function ConfirmDialog({ action, eventTitle, onConfirm, onCancel, loading }: {
  action: "approve";
  eventTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className={styles.confirmOverlay}>
      <div className={styles.confirmBox}>
        <div className={styles.confirmIcon} style={{ background: "#ECFDF5", color: "#10B981" }}>
          <CheckCircle size={32} />
        </div>
        <h3>تأكيد الموافقة</h3>
        <p>هل أنت متأكد من الموافقة على فعالية<br /><strong style={{ color: "#111827" }}>&quot;{eventTitle}&quot;</strong>؟</p>
        <div className={styles.confirmBtns}>
          <button className={styles.cancelBtn} onClick={onCancel} disabled={loading}>إلغاء</button>
          <button
            className={styles.confirmActionBtn}
            style={{ background: "#10B981" }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "جاري التنفيذ…" : "موافقة"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Details Modal ── */
function DetailsModal({ detail, onClose }: { detail: ActivityDetail; onClose: () => void }) {
  const costVal = safeStr(detail.cost);
  const isFree = !costVal || costVal === "0" || costVal === "0.00";
  const statusAccepted = isAccepted(detail.status);
  const statusRejected = isRejected(detail.status);
  const statusLabel = statusAccepted ? "مقبول" : statusRejected ? "مرفوض" : "منتظر";
  const statusCls = statusAccepted ? styles.sApproved : statusRejected ? styles.sRejected : styles.sPending;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{detail.title}</h2>
          <button className={styles.modalCloseBtn} onClick={onClose}><X size={18} /></button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.modalTopRow}>
            <span className={`${styles.badge} ${statusCls}`}>{statusLabel}</span>
            {detail.type && <span className={styles.typeTag}>{detail.type}</span>}
          </div>
          {detail.description && <div className={styles.descBox}>{detail.description}</div>}
          <div className={styles.detailGrid}>
            {[
              { icon: <User size={15} />,        label: "أُنشئ بواسطة",  val: detail.created_by_name },
              { icon: <BookOpen size={15} />,    label: "الكلية",         val: detail.faculty_name },
              { icon: <BookOpen size={15} />,    label: "القسم",          val: detail.dept_name },
              { icon: <Users size={15} />,       label: "المجموعة",       val: detail.family_name },
              { icon: <MapPin size={15} />,      label: "الموقع",         val: detail.location },
              { icon: <Calendar size={15} />,    label: "تاريخ البداية",  val: fmt(detail.st_date) },
              { icon: <Calendar size={15} />,    label: "تاريخ النهاية",  val: fmt(detail.end_date) },
              { icon: <Users size={15} />,       label: "المقاعد",        val: !detail.s_limit || detail.s_limit >= 2147483647 ? "غير محدود" : String(detail.s_limit) },
              { icon: <DollarSign size={15} />,  label: "التكلفة",        val: isFree ? "مجاني" : `${costVal} ج.م` },
              { icon: <Award size={15} />,       label: "المكافأة",       val: safeStr(detail.reward) || "—" },
              { icon: <ShieldAlert size={15} />, label: "القيود",         val: safeStr(detail.restrictions) || "لا يوجد" },
              { icon: <Package size={15} />,     label: "الموارد",        val: safeStr(detail.resource) || "—" },
              ...(isRejected(detail.status) && detail.rejection_reason
                  ? [{ icon: <MessageSquare size={15} />, label: "سبب الرفض", val: detail.rejection_reason }]
                  : []),
              ].map(({ icon, label, val }) => (
              <div key={label} className={styles.detailItem}>
                <div className={styles.detailIcon}>{icon}</div>
                <div>
                  <div className={styles.detailLabel}>{label}</div>
                  <div className={styles.detailVal}>{val || "—"}</div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.modalFooter}>
            <span>تاريخ الإنشاء: {fmtLong(detail.created_at)}</span>
            <span>آخر تحديث: {fmtLong(detail.updated_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Activity Card ── */
function ActivityCard({
  activity, showActions, detailLoading,
  onApprove, onReject, onView,
}: {
  activity: ActivityItem;
  showActions: boolean;
  detailLoading: boolean;
  onApprove: () => void;
  onReject: () => void;
  onView: () => void;
}) {
  const accepted = isAccepted(activity.status);
  const rejected = isRejected(activity.status);
  const isFree = !activity.cost || activity.cost === "0" || activity.cost === "0.00";
  const accentCls = accepted ? styles.accentApproved : rejected ? styles.accentRejected : styles.accentPending;

  return (
    <div className={styles.eventCard}>
      <div className={`${styles.cardAccent} ${accentCls}`} />
      <div className={styles.cardBody}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleBlock}>
            <div className={styles.cardTitle}>{activity.title}</div>
            {activity.description && <div className={styles.cardDesc}>{activity.description}</div>}
          </div>
          <div className={styles.cardBadges}>
            {activity.type && <span className={styles.typeBadge}>{activity.type}</span>}
            {accepted && <span className={`${styles.badge} ${styles.sApproved}`}>مقبول</span>}
            {rejected && <span className={`${styles.badge} ${styles.sRejected}`}>مرفوض</span>}
            {!accepted && !rejected && <span className={`${styles.badge} ${styles.sPending}`}>منتظر</span>}
          </div>
        </div>

        <div className={styles.cardMeta}>
          <div className={styles.metaItem}>
            <span className={styles.metaIcon}><MapPin size={16} /></span>
            <div className={styles.metaContent}>
              <div className={styles.metaLabel}>الموقع</div>
              <div className={styles.metaValue}>{activity.location || "—"}</div>
            </div>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaIcon}><Users size={16} /></span>
            <div className={styles.metaContent}>
              <div className={styles.metaLabel}>المقاعد</div>
              <div className={styles.metaValue}>
                {!activity.s_limit || activity.s_limit >= 2147483647 ? "غير محدود" : activity.s_limit.toLocaleString("ar-EG")}
              </div>
            </div>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaIcon}><Calendar size={16} /></span>
            <div className={styles.metaContent}>
              <div className={styles.metaLabel}>البداية</div>
              <div className={styles.metaValue}>{fmt(activity.st_date)}</div>
            </div>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaIcon}><Calendar size={16} /></span>
            <div className={styles.metaContent}>
              <div className={styles.metaLabel}>النهاية</div>
              <div className={styles.metaValue}>{fmt(activity.end_date)}</div>
            </div>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaIcon}><DollarSign size={16} /></span>
            <div className={styles.metaContent}>
              <div className={styles.metaLabel}>التكلفة</div>
              {isFree
                ? <div className={styles.metaValueFree}>مجاني</div>
                : <div className={styles.metaValue}>{activity.cost} ج.م</div>
              }
            </div>
          </div>
          {activity.dept_name && (
            <div className={styles.metaItem}>
              <span className={styles.metaIcon}><BookOpen size={16} /></span>
              <div className={styles.metaContent}>
                <div className={styles.metaLabel}>القسم</div>
                <div className={styles.metaValue}>{activity.dept_name}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.cardFooter}>
        <button className={`${styles.iconBtn} ${styles.btnView}`} onClick={onView} disabled={detailLoading}>
          {detailLoading ? <RefreshCw size={15} className={styles.spinnerSm} /> : <Eye size={15} />}
          <span className={styles.btnLabel}>تفاصيل</span>
        </button>
        {showActions && (
          <>
            <button className={`${styles.iconBtn} ${styles.btnReject}`} onClick={onReject}>
              <X size={15} /><span className={styles.btnLabel}>رفض</span>
            </button>
            <button className={`${styles.iconBtn} ${styles.btnApprove}`} onClick={onApprove}>
              <Check size={15} /><span className={styles.btnLabel}>موافقة</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Main ── */
export default function Activities() {
  const { showToast } = useToast();
  const [allActivities, setAllActivities]     = useState<ActivityItem[]>([]);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState("");
  const [confirm, setConfirm]                 = useState<{ id: number; action: "approve"; title: string } | null>(null);
  const [rejectTarget, setRejectTarget]       = useState<{ id: number; title: string } | null>(null);
  const [actionLoading, setActionLoading]     = useState(false);
  const [detailData, setDetailData]           = useState<ActivityDetail | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter]       = useState<StatusFilter>("pending");
  const [deptFilter, setDeptFilter]           = useState<string>("all");
  const [search, setSearch]                   = useState("");
  const [departments, setDepartments]         = useState<{ dept_id: number; name: string }[]>([]);

  const enrichWithDeptNames = useCallback(async (activities: ActivityItem[]) => {
    const uniqueDeptIds = [...new Set(activities.map(a => a.dept_id).filter(Boolean))];
    await Promise.all(uniqueDeptIds.map(id => fetchDeptName(id)));
    return activities.map(a => ({
      ...a,
      dept_name: deptCache.get(a.dept_id) || a.dept_name || `قسم ${a.dept_id}`,
    }));
  }, []);

  const filtered = useMemo(() => {
    let list = allActivities;
    if (deptFilter !== "all") list = list.filter(a => String(a.dept_id) === deptFilter);
    const term = search.toLowerCase().trim();
    if (term) list = list.filter(a =>
      a.title?.toLowerCase().includes(term) ||
      a.location?.toLowerCase().includes(term) ||
      a.type?.toLowerCase().includes(term)
    );
    if (statusFilter === "pending")  return list.filter(a => isPending(a.status));
    if (statusFilter === "accepted") return list.filter(a => isAccepted(a.status));
    if (statusFilter === "rejected") return list.filter(a => isRejected(a.status));
    return list;
  }, [allActivities, statusFilter, deptFilter, search]);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await authFetch(`${BASE}/api/family/departments/`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDepartments(data);
    } catch {
      showToast("فشل في جلب الأقسام", "error");
    }
  }, []);

  const counts = useMemo(() => {
    const base = deptFilter === "all" ? allActivities : allActivities.filter(a => String(a.dept_id) === deptFilter);
    return {
      total:    base.length,
      pending:  base.filter(a => isPending(a.status)).length,
      accepted: base.filter(a => isAccepted(a.status)).length,
      rejected: base.filter(a => isRejected(a.status)).length,
    };
  }, [allActivities, deptFilter]);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await authFetch(`${BASE}/api/event/get-events/`);
      if (!res.ok) throw new Error("فشل في جلب البيانات");
      const data: ActivityItem[] = await res.json();
      const enriched = await enrichWithDeptNames(data);
      setAllActivities(enriched);
    } catch (err: unknown) {
      setError((err as Error)?.message || "تعذّر الاتصال بالسيرفر");
      setAllActivities([]);
    } finally {
      setLoading(false);
    }
  }, [enrichWithDeptNames]);

  useEffect(() => {
    fetchActivities();
    fetchDepartments();
  }, [fetchActivities, fetchDepartments]);

  const openDetail = async (id: number) => {
    setLoadingDetailId(id);
    try {
      const res = await authFetch(`${BASE}/api/event/get-events/${id}/`);
      if (!res.ok) throw new Error();
      const data: ActivityDetail = await res.json();
      setDetailData(data);
    } catch {
      showToast("فشل في جلب تفاصيل الفعالية", "error");
    } finally {
      setLoadingDetailId(null);
    }
  };

  // Approve handler
  const handleApprove = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      const res = await authFetch(
        `${BASE}/api/event/approve-events/${confirm.id}/approve/`,
        { method: "PATCH" }
      );
      if (!res.ok) throw new Error();
      setAllActivities(prev =>
        prev.map(a => a.event_id === confirm.id ? { ...a, status: "مقبول" } : a)
      );
      showToast("تم قبول الفعالية بنجاح", "success");
      setConfirm(null);
    } catch {
      showToast("فشل في تنفيذ العملية، يرجى المحاولة مجدداً", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Reject handler — now receives the reason
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
      setAllActivities(prev =>
        prev.map(a => a.event_id === rejectTarget.id ? { ...a, status: "مرفوض" } : a)
      );
      showToast("تم رفض الفعالية", "error");
      setRejectTarget(null);
    } catch {
      showToast("فشل في تنفيذ العملية، يرجى المحاولة مجدداً", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className={styles.root}>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1>مراجعة واعتماد الفعاليات</h1>
          <p>مراجعة وإدارة الفعاليات المقترحة من مدراء الأقسام</p>
        </div>
      
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.total}`}>
          <div className={styles.statIcon}><Layers size={24} /></div>
          <div className={styles.statBody}><div className={styles.statNum}>{counts.total}</div><div className={styles.statLabel}>إجمالي الفعاليات</div></div>
        </div>
        <div className={`${styles.statCard} ${styles.pending}`}>
          <div className={styles.statIcon}><Clock size={24} /></div>
          <div className={styles.statBody}><div className={styles.statNum}>{counts.pending}</div><div className={styles.statLabel}>في الانتظار</div></div>
        </div>
        <div className={`${styles.statCard} ${styles.approved}`}>
          <div className={styles.statIcon}><CheckCircle size={24} /></div>
          <div className={styles.statBody}><div className={styles.statNum}>{counts.accepted}</div><div className={styles.statLabel}>مقبولة</div></div>
        </div>
        <div className={`${styles.statCard} ${styles.rejected}`}>
          <div className={styles.statIcon}><XCircle size={24} /></div>
          <div className={styles.statBody}><div className={styles.statNum}>{counts.rejected}</div><div className={styles.statLabel}>مرفوضة</div></div>
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
              placeholder="ابحث عن الفعالية"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              className={styles.filterSelect}
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
            >
              <option value="all">جميع الأقسام</option>
              {departments.map(d => (
                <option key={d.dept_id} value={String(d.dept_id)}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Tabs */}
        <div className={styles.tabsRow}>
          <button
            className={`${styles.tabBtn} ${styles.tabPending} ${statusFilter === "pending" ? styles.tabActive : ""}`}
            onClick={() => setStatusFilter("pending")}
          >
            <Clock size={17} />
            في الانتظار
            <span className={styles.tabCount}>{counts.pending}</span>
          </button>
          <button
            className={`${styles.tabBtn} ${styles.tabApproved} ${statusFilter === "accepted" ? styles.tabActive : ""}`}
            onClick={() => setStatusFilter("accepted")}
          >
            <CheckCircle size={17} />
            مقبولة
            <span className={styles.tabCount}>{counts.accepted}</span>
          </button>
          <button
            className={`${styles.tabBtn} ${styles.tabRejected} ${statusFilter === "rejected" ? styles.tabActive : ""}`}
            onClick={() => setStatusFilter("rejected")}
          >
            <XCircle size={17} />
            مرفوضة
            <span className={styles.tabCount}>{counts.rejected}</span>
          </button>
        </div>

        {error && <div className={styles.errorBanner}><AlertCircle size={17} /> {error}</div>}

        {loading ? (
          <div className={styles.stateBox}>
            <RefreshCw size={40} className={styles.spinner} />
            <p>جاري تحميل البيانات…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.stateBox}>
            <Layers size={48} />
            <p>لا توجد فعاليات في هذا القسم</p>
          </div>
        ) : (
          <div className={styles.cardsGrid}>
            {filtered.map(activity => (
              <ActivityCard
                key={activity.event_id}
                activity={activity}
                showActions={isPending(activity.status)}
                detailLoading={loadingDetailId === activity.event_id}
                onApprove={() => setConfirm({ id: activity.event_id, action: "approve", title: activity.title })}
                onReject={() => setRejectTarget({ id: activity.event_id, title: activity.title })}
                onView={() => openDetail(activity.event_id)}
              />
            ))}
          </div>
        )}
      </div>

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

      {/* Rejection reason dialog */}
      {rejectTarget && (
        <RejectionReasonDialog
          eventTitle={rejectTarget.title}
          onConfirm={handleReject}
          onCancel={() => setRejectTarget(null)}
          loading={actionLoading}
        />
      )}

      {detailData && (
        <DetailsModal detail={detailData} onClose={() => setDetailData(null)} />
      )}
    </div>
  );
}