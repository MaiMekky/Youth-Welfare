"use client";
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  Eye, Check, X, Clock, Calendar, Users,
  CheckCircle, XCircle, RefreshCw, AlertCircle, Layers, MapPin,
  User, Building2, BookOpen, DollarSign, Award, ShieldAlert, Package,
  ChevronDown, TrendingUp, Activity,
} from "lucide-react";
import "../Styles/Activities.css";

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
  restrictions: string | any;
  reward: string | any;
  status: string;
  st_date: string;
  end_date: string;
  s_limit: number;
  created_at: string;
  type: string;
  resource: string | any;
  selected_facs: number[];
}

type StatusFilter = "pending" | "accepted" | "rejected";

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("access") : null;

const BASE = "http://127.0.0.1:8000";

function isPending(raw: string) {
  const k = raw?.trim();
  return k === "منتظر" || k?.toLowerCase() === "pending";
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
  return new Date(d).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
}
function fmtDateTime(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleString("ar-EG", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}
function safeStr(val: any): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (Array.isArray(val)) return val.map(safeStr).filter(Boolean).join(" | ");
  if (typeof val === "object") {
    const pick = val.reward ?? val.name ?? val.title ?? val.label ?? val.value;
    if (pick !== undefined) return safeStr(pick);
    return Object.entries(val)
      .filter(([, v]) => v !== null && v !== undefined && typeof v !== "object")
      .map(([k, v]) => `${k}: ${v}`).join(" | ");
  }
  return String(val);
}

const deptCache = new Map<number, string>();

async function fetchDeptName(deptId: number): Promise<string> {
  if (deptCache.has(deptId)) return deptCache.get(deptId)!;
  try {
    const res = await fetch(`${BASE}/api/family/departments/${deptId}/`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) return `قسم ${deptId}`;
    const data = await res.json();
    const name = data.name || data.dept_name || data.department_name || `قسم ${deptId}`;
    deptCache.set(deptId, name);
    return name;
  } catch {
    return `قسم ${deptId}`;
  }
}

function ConfirmDialog({ action, eventTitle, onConfirm, onCancel, loading }: {
  action: "approve" | "reject";
  eventTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const isApprove = action === "approve";
  return (
    <div className="act-overlay">
      <div className="confirm-box">
        <div className={`confirm-icon-wrap ${isApprove ? "ci-approve" : "ci-reject"}`}>
          {isApprove ? <CheckCircle size={30} /> : <XCircle size={30} />}
        </div>
        <h3 className="confirm-title">{isApprove ? "تأكيد الموافقة" : "تأكيد الرفض"}</h3>
        <p className="confirm-body">
          هل أنت متأكد من {isApprove ? "الموافقة على" : "رفض"} فعالية{" "}
          <strong>"{eventTitle}"</strong>؟
        </p>
        <div className="confirm-actions">
          <button className="cbtn cbtn-cancel" onClick={onCancel} disabled={loading}>إلغاء</button>
          <button
            className={`cbtn ${isApprove ? "cbtn-approve" : "cbtn-reject"}`}
            onClick={onConfirm} disabled={loading}
          >
            {loading ? <><RefreshCw size={13} className="spinning" /> جاري…</> : isApprove ? "✓ موافقة" : "✕ رفض"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailsModal({ detail, onClose }: { detail: ActivityDetail; onClose: () => void }) {
  const costVal = safeStr(detail.cost);
  const isFree  = !costVal || costVal === "0" || costVal === "0.00";
  const imageUrl = Array.isArray(detail.images) ? detail.images[0] : safeStr(detail.images);
  const statusAccepted = isAccepted(detail.status);
  const statusRejected = isRejected(detail.status);

  return (
    <div className="act-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={e => e.stopPropagation()}>
        <div className="dm-header">
          <div className="dm-header-bg" />
          <div className="dm-header-content">
            <div className="dm-header-top">
              {detail.type && <span className={`type-badge type-${detail.type}`}>{detail.type}</span>}
              <span className={`dm-status-pill ${statusAccepted ? "dsp-accepted" : statusRejected ? "dsp-rejected" : "dsp-pending"}`}>
                {statusAccepted ? "مقبول" : statusRejected ? "مرفوض" : "منتظر"}
              </span>
            </div>
            <h2 className="dm-title">{detail.title}</h2>
            {detail.description && <p className="dm-desc">{detail.description}</p>}
          </div>
          <button className="dm-close" onClick={onClose}><X size={16} /></button>
        </div>

        {imageUrl && (
          <div className="dm-image-wrap">
            <img src={imageUrl} alt={detail.title} className="dm-image" />
            <div className="dm-image-overlay" />
          </div>
        )}

        <div className="dm-body">
          <div className="dm-stats-row">
            <div className="dm-stat">
              <Calendar size={16} className="dm-stat-icon" />
              <div>
                <span className="dm-stat-label">تاريخ البداية</span>
                <span className="dm-stat-val">{fmt(detail.st_date)}</span>
              </div>
            </div>
            <div className="dm-stat">
              <Calendar size={16} className="dm-stat-icon" />
              <div>
                <span className="dm-stat-label">تاريخ النهاية</span>
                <span className="dm-stat-val">{fmt(detail.end_date)}</span>
              </div>
            </div>
            <div className="dm-stat">
              <Users size={16} className="dm-stat-icon" />
              <div>
                <span className="dm-stat-label">المقاعد</span>
                <span className="dm-stat-val">
                  {!detail.s_limit || detail.s_limit >= 2147483647 ? "غير محدود" : detail.s_limit.toLocaleString("ar-EG")}
                </span>
              </div>
            </div>
            <div className="dm-stat">
              <DollarSign size={16} className="dm-stat-icon" />
              <div>
                <span className="dm-stat-label">التكلفة</span>
                <span className={`dm-stat-val ${isFree ? "sv-green" : "sv-orange"}`}>
                  {isFree ? "مجاني" : `${costVal} ج.م`}
                </span>
              </div>
            </div>
            <div className="dm-stat">
              <Users size={16} className="dm-stat-icon" />
              
            </div>
            <div className="dm-stat">
              <MapPin size={16} className="dm-stat-icon" />
              <div>
                <span className="dm-stat-label">الموقع</span>
                <span className="dm-stat-val">{detail.location || "—"}</span>
              </div>
            </div>
          </div>

          <div className="dm-section">
            <h4 className="dm-section-title"><User size={13} /> معلومات المنظِّم</h4>
            <div className="dm-info-grid">
              <div className="dm-info-item">
                <span className="dii-label">أُنشئ بواسطة</span>
                <span className="dii-val">{detail.created_by_name || "—"}</span>
              </div>
              <div className="dm-info-item">
                <span className="dii-label">الكلية</span>
                <span className="dii-val">{detail.faculty_name || "—"}</span>
              </div>
              <div className="dm-info-item">
                <span className="dii-label">القسم</span>
                <span className="dii-val">{detail.dept_name || "—"}</span>
              </div>
              <div className="dm-info-item">
                <span className="dii-label">المجموعة</span>
                <span className="dii-val">{detail.family_name || "—"}</span>
              </div>
            </div>
          </div>

          {(detail.restrictions || detail.reward || detail.resource) && (
            <div className="dm-section">
              <h4 className="dm-section-title"><ShieldAlert size={13} /> معلومات إضافية</h4>
              <div className="dm-info-grid">
                {detail.restrictions && (
                  <div className="dm-info-item dm-info-full">
                    <span className="dii-label">الشروط والقيود</span>
                    <span className="dii-val">{safeStr(detail.restrictions)}</span>
                  </div>
                )}
                {detail.reward && (
                  <div className="dm-info-item">
                    <span className="dii-label"><Award size={11} /> المكافأة</span>
                    <span className="dii-val sv-gold">{safeStr(detail.reward)}</span>
                  </div>
                )}
                {detail.resource && (
                  <div className="dm-info-item">
                    <span className="dii-label"><Package size={11} /> الموارد</span>
                    <span className="dii-val">{safeStr(detail.resource)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="dm-timestamps">
            <span>تاريخ الإنشاء: {fmtDateTime(detail.created_at)}</span>
            <span>آخر تحديث: {fmtDateTime(detail.updated_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toast({ msg }: { msg: string }) {
  return <div className="act-toast">{msg}</div>;
}

function ActivityCard({
  activity, index, showActions, detailLoading,
  onApprove, onReject, onView,
}: {
  activity: ActivityItem;
  index: number;
  showActions: boolean;
  detailLoading: boolean;
  onApprove: () => void;
  onReject: () => void;
  onView: () => void;
}) {
  const accepted = isAccepted(activity.status);
  const rejected = isRejected(activity.status);
  const isFree   = !activity.cost || activity.cost === "0" || activity.cost === "0.00";

  return (
    <div
      className={`act-card ${accepted ? "act-card--accepted" : ""} ${rejected ? "act-card--rejected" : ""}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className={`card-accent ${accepted ? "ca-accepted" : rejected ? "ca-rejected" : "ca-pending"}`} />
      <div className="card-inner">
        <div className="card-top">
          <div className="card-title-group">
            <div className="card-badges-row">
              {activity.type && <span className={`type-badge type-${activity.type}`}>{activity.type}</span>}
              {accepted && <span className="status-chip chip-accepted"><CheckCircle size={11} /> مقبول</span>}
              {rejected && <span className="status-chip chip-rejected"><XCircle size={11} /> مرفوض</span>}
              {!accepted && !rejected && <span className="status-chip chip-pending"><Clock size={11} /> منتظر</span>}
            </div>
            <h3 className="card-title">{activity.title}</h3>
            {activity.dept_name && (
              <span className="card-dept"><BookOpen size={11} /> {activity.dept_name}</span>
            )}
          </div>
          <div className="card-actions">
            <button className="btn-view" onClick={onView} disabled={detailLoading}>
              {detailLoading ? <RefreshCw size={13} className="spinning" /> : <Eye size={14} />}
              <span>تفاصيل</span>
            </button>
            {showActions && (
              <>
                <button className="btn-reject" onClick={onReject}><X size={13} /><span>رفض</span></button>
                <button className="btn-approve" onClick={onApprove}><Check size={13} /><span>موافقة</span></button>
              </>
            )}
          </div>
        </div>
        <div className="card-meta">
          <div className="meta-pill">
            <Calendar size={12} />
            <span className="mp-label">البداية</span>
            <span className="mp-val">{fmt(activity.st_date)}</span>
          </div>
          <div className="meta-pill">
            <Calendar size={12} />
            <span className="mp-label">النهاية</span>
            <span className="mp-val">{fmt(activity.end_date)}</span>
          </div>
          <div className="meta-pill">
            <Users size={12} />
            <span className="mp-label">المقاعد</span>
            <span className="mp-val">
              {!activity.s_limit || activity.s_limit >= 2147483647 ? "∞ غير محدود" : activity.s_limit.toLocaleString("ar-EG")}
            </span>
          </div>
          <div className="meta-pill">
            <MapPin size={12} />
            <span className="mp-label">الموقع</span>
            <span className="mp-val">{activity.location || "—"}</span>
          </div>
          <div className="meta-pill">
            <DollarSign size={12} />
            <span className="mp-label">التكلفة</span>
            <span className={`mp-val ${isFree ? "mpv-free" : "mpv-paid"}`}>
              {isFree ? "مجاني" : `${activity.cost} ج.م`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── StatsBar — بدون progress bar ── */
function StatsBar({ total, pending, accepted, rejected }: {
  total: number; pending: number; accepted: number; rejected: number;
}) {
  const pct = (n: number) => total ? Math.round((n / total) * 100) : 0;
  return (
    <div className="stats-bar">
      <div className="stat-card sc-total">
        <div className="sc-num">{total}</div>
        <div className="sc-label">إجمالي الفعاليات</div>
      </div>
      <div className="stat-card sc-pending">
        <div className="sc-num">{pending}</div>
        <div className="sc-label">في الانتظار</div>
       
      </div>
      <div className="stat-card sc-accepted">
        <div className="sc-num">{accepted}</div>
        <div className="sc-label">مقبولة</div>
       
      </div>
      <div className="stat-card sc-rejected">
        <div className="sc-num">{rejected}</div>
        <div className="sc-label">مرفوضة</div>
       
      </div>
    </div>
  );
}

export default function Activities() {
  const [allActivities, setAllActivities]     = useState<ActivityItem[]>([]);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState("");
  const [confirm, setConfirm]                 = useState<{ id: number; action: "approve" | "reject"; title: string } | null>(null);
  const [actionLoading, setActionLoading]     = useState(false);
  const [toastMsg, setToastMsg]               = useState("");
  const [detailData, setDetailData]           = useState<ActivityDetail | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter]       = useState<StatusFilter>("pending");
  const [deptFilter, setDeptFilter]           = useState<string>("all");
  const [deptDropOpen, setDeptDropOpen]       = useState(false);
  const deptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (deptRef.current && !deptRef.current.contains(e.target as Node)) setDeptDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const enrichWithDeptNames = useCallback(async (activities: ActivityItem[]) => {
    const uniqueDeptIds = [...new Set(activities.map(a => a.dept_id).filter(Boolean))];
    await Promise.all(uniqueDeptIds.map(id => fetchDeptName(id)));
    return activities.map(a => ({
      ...a,
      dept_name: deptCache.get(a.dept_id) || a.dept_name || `قسم ${a.dept_id}`,
    }));
  }, []);

  const deptOptions = useMemo(() => {
    const map = new Map<string, string>();
    allActivities.forEach(a => {
      const key = String(a.dept_id);
      if (!map.has(key)) map.set(key, a.dept_name || `قسم ${a.dept_id}`);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [allActivities]);

  const filtered = useMemo(() => {
    let list = allActivities;
    if (deptFilter !== "all") list = list.filter(a => String(a.dept_id) === deptFilter);
    if (statusFilter === "pending")  return list.filter(a => isPending(a.status));
    if (statusFilter === "accepted") return list.filter(a => isAccepted(a.status));
    if (statusFilter === "rejected") return list.filter(a => isRejected(a.status));
    return list;
  }, [allActivities, statusFilter, deptFilter]);

  const counts = useMemo(() => {
    const base = deptFilter === "all" ? allActivities : allActivities.filter(a => String(a.dept_id) === deptFilter);
    return {
      total:    base.length,
      pending:  base.filter(a => isPending(a.status)).length,
      accepted: base.filter(a => isAccepted(a.status)).length,
      rejected: base.filter(a => isRejected(a.status)).length,
    };
  }, [allActivities, deptFilter]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${BASE}/api/event/get-events/`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("فشل في جلب البيانات");
      const data: ActivityItem[] = await res.json();
      const enriched = await enrichWithDeptNames(data);
      setAllActivities(enriched);
    } catch (err: any) {
      setError(err?.message || "تعذّر الاتصال بالخادم");
      setAllActivities([]);
    } finally {
      setLoading(false);
    }
  }, [enrichWithDeptNames]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  const openDetail = async (id: number) => {
    setLoadingDetailId(id);
    try {
      const res = await fetch(`${BASE}/api/event/get-events/${id}/`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error();
      const data: ActivityDetail = await res.json();
      setDetailData(data);
    } catch {
      showToast("⚠️ فشل في جلب تفاصيل الفعالية");
    } finally {
      setLoadingDetailId(null);
    }
  };

  const handleAction = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      const endpoint = confirm.action === "approve"
        ? `${BASE}/api/event/approve-events/${confirm.id}/approve/`
        : `${BASE}/api/event/approve-events/${confirm.id}/reject/`;
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error();
      const newStatus = confirm.action === "approve" ? "مقبول" : "مرفوض";
      setAllActivities(prev =>
        prev.map(a => a.event_id === confirm.id ? { ...a, status: newStatus } : a)
      );
      showToast(confirm.action === "approve" ? "✅ تم قبول الفعالية بنجاح" : "❌ تم رفض الفعالية");
      setConfirm(null);
    } catch {
      showToast("⚠️ فشل في تنفيذ العملية، يرجى المحاولة مجدداً");
    } finally {
      setActionLoading(false);
    }
  };

  const selectedDeptLabel = deptFilter === "all"
    ? "جميع الأقسام"
    : deptOptions.find(d => d.id === deptFilter)?.name ?? "جميع الأقسام";

  return (
    <>
      <div className="act-page">
        <div className="act-header">
          <div className="act-header-left">
            <div className="act-title-row">
              <Activity size={22} className="act-title-icon" />
              <h2 className="act-title">طلبات الفعاليات</h2>
            </div>
            <p className="act-subtitle">مراجعة وإدارة الفعاليات المقترحة من مدراء الأقسام</p>
          </div>
          <div className="act-header-right">
            {deptOptions.length > 0 && (
              <div className="dept-filter" ref={deptRef}>
                <button className="dept-filter-btn" onClick={() => setDeptDropOpen(o => !o)}>
                  <BookOpen size={13} />
                  <span>{selectedDeptLabel}</span>
                  <ChevronDown size={12} className={deptDropOpen ? "chevron-open" : ""} />
                </button>
                {deptDropOpen && (
                  <div className="dept-dropdown">
                    <button
                      className={`dept-opt ${deptFilter === "all" ? "dept-opt--active" : ""}`}
                      onClick={() => { setDeptFilter("all"); setDeptDropOpen(false); }}
                    >
                      جميع الأقسام
                    </button>
                    {deptOptions.map(d => (
                      <button
                        key={d.id}
                        className={`dept-opt ${deptFilter === d.id ? "dept-opt--active" : ""}`}
                        onClick={() => { setDeptFilter(d.id); setDeptDropOpen(false); }}
                      >
                        {d.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button className="refresh-btn" onClick={fetchActivities}>
              <RefreshCw size={13} className={loading ? "spinning" : ""} />
              تحديث
            </button>
          </div>
        </div>

        <StatsBar
          total={counts.total}
          pending={counts.pending}
          accepted={counts.accepted}
          rejected={counts.rejected}
        />

        {error && (
          <div className="error-banner">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Status Tabs — full width, bigger */}
        <div className="status-tabs">
          <button
            className={`stab ${statusFilter === "pending" ? "stab--active stab--pending" : ""}`}
            onClick={() => setStatusFilter("pending")}
          >
            <Clock size={16} />
            <span>في الانتظار</span>
            <span className="stab-count">{counts.pending}</span>
          </button>
          <button
            className={`stab ${statusFilter === "accepted" ? "stab--active stab--accepted" : ""}`}
            onClick={() => setStatusFilter("accepted")}
          >
            <CheckCircle size={16} />
            <span>مقبولة</span>
            <span className="stab-count">{counts.accepted}</span>
          </button>
          <button
            className={`stab ${statusFilter === "rejected" ? "stab--active stab--rejected" : ""}`}
            onClick={() => setStatusFilter("rejected")}
          >
            <XCircle size={16} />
            <span>مرفوضة</span>
            <span className="stab-count">{counts.rejected}</span>
          </button>
        </div>

        {loading ? (
          <div className="state-box">
            <div className="loading-spinner">
              <RefreshCw size={28} className="spinning" />
            </div>
            <p>جاري تحميل البيانات…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="state-box">
            <div className="empty-icon-wrap">
              <Layers size={36} />
            </div>
            <p className="empty-title">
              {statusFilter === "pending" ? "لا توجد فعاليات في الانتظار" :
               statusFilter === "accepted" ? "لا توجد فعاليات مقبولة" :
               "لا توجد فعاليات مرفوضة"}
              {deptFilter !== "all" ? " لهذا القسم" : ""}
            </p>
            <p className="empty-sub">جرّب تغيير الفلتر أو القسم</p>
          </div>
        ) : (
          <div className="act-list">
            {filtered.map((activity, i) => (
              <ActivityCard
                key={activity.event_id}
                activity={activity}
                index={i}
                showActions={isPending(activity.status)}
                detailLoading={loadingDetailId === activity.event_id}
                onApprove={() => setConfirm({ id: activity.event_id, action: "approve", title: activity.title })}
                onReject={() => setConfirm({ id: activity.event_id, action: "reject", title: activity.title })}
                onView={() => openDetail(activity.event_id)}
              />
            ))}
          </div>
        )}
      </div>

      {confirm && (
        <ConfirmDialog
          action={confirm.action}
          eventTitle={confirm.title}
          onConfirm={handleAction}
          onCancel={() => setConfirm(null)}
          loading={actionLoading}
        />
      )}

      {detailData && (
        <DetailsModal detail={detailData} onClose={() => setDetailData(null)} />
      )}

      {toastMsg && <Toast msg={toastMsg} />}
    </>
  );
}