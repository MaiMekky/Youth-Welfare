"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Eye, Check, X, Clock, Calendar, Users, Building2,
  CheckCircle, XCircle, RefreshCw, AlertCircle, Layers, MapPin
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Activity {
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("access") : null;

const BASE = "http://127.0.0.1:8000";

function isPending(raw: string) {
  const k = raw?.trim();
  return k === "منتظر" || k?.toLowerCase() === "pending";
}

function fmt(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ar-EG");
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({
  action, eventTitle, onConfirm, onCancel, loading,
}: {
  action: "approve" | "reject";
  eventTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const isApprove = action === "approve";
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, backdropFilter: "blur(4px)",
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "2rem",
        width: "min(90vw, 400px)", textAlign: "center",
        boxShadow: "0 25px 60px rgba(15,23,42,0.18)",
        animation: "fadeUp 0.2s ease",
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: isApprove ? "#ECFDF5" : "#FEF2F2",
          color: isApprove ? "#10B981" : "#EF4444",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 1rem",
        }}>
          {isApprove ? <CheckCircle size={32} /> : <XCircle size={32} />}
        </div>
        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#111827", marginBottom: 8 }}>
          {isApprove ? "تأكيد الموافقة" : "تأكيد الرفض"}
        </h3>
        <p style={{ color: "#6B7280", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
          هل أنت متأكد من {isApprove ? "الموافقة على" : "رفض"} فعالية{" "}
          <strong style={{ color: "#111827" }}>"{eventTitle}"</strong>؟
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            onClick={onCancel} disabled={loading}
            style={{
              padding: "9px 24px", borderRadius: 10, border: "1.5px solid #E5E7EB",
              background: "#fff", color: "#374151", fontWeight: 600,
              cursor: "pointer", fontSize: "0.88rem", fontFamily: "inherit",
            }}
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm} disabled={loading}
            style={{
              padding: "9px 24px", borderRadius: 10, border: "none",
              background: isApprove ? "#10B981" : "#EF4444", color: "#fff",
              fontWeight: 600, cursor: "pointer", fontSize: "0.88rem",
              fontFamily: "inherit", opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "جاري التنفيذ…" : isApprove ? "موافقة" : "رفض"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ───────────────────────────────────────────────────────────────────

function Toast({ msg }: { msg: string }) {
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      background: "#1e2a5a", color: "#fff", padding: "12px 24px",
      borderRadius: 12, fontWeight: 600, fontSize: "0.88rem",
      boxShadow: "0 8px 30px rgba(30,42,90,0.25)", zIndex: 2000,
      animation: "fadeUp 0.3s ease",
    }}>
      {msg}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [confirm, setConfirm]       = useState<{ id: number; action: "approve" | "reject"; title: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg]     = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE}/api/event/get-events/`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error();
      const data: Activity[] = await res.json();
      // Show only pending activities in this view
      setActivities(data.filter(e => isPending(e.status)));
      setError("");
    } catch {
      setError("فشل في جلب البيانات. تحقق من الاتصال.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

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
      showToast(confirm.action === "approve" ? "✅ تم قبول الفعالية بنجاح" : "❌ تم رفض الفعالية");
      setConfirm(null);
      fetchActivities();
    } catch {
      showToast("⚠️ حدث خطأ أثناء تنفيذ الإجراء");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }

        .act-page {
          direction: rtl;
          font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
          padding: clamp(1rem, 3vw, 1.75rem);
          background: #f3f5fd;
          min-height: 100%;
          box-sizing: border-box;
        }

        /* ── Header ── */
        .act-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        .act-header-left { display: flex; flex-direction: column; gap: 4px; }
        .act-title {
          font-size: clamp(1.1rem, 2.5vw, 1.35rem);
          font-weight: 800;
          color: #1e2a5a;
          margin: 0;
        }
        .act-subtitle {
          font-size: clamp(0.78rem, 1.5vw, 0.875rem);
          color: #6b7fc4;
          margin: 0;
        }
        .act-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        /* Pending badge */
        .pending-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #fff8e6;
          border: 1.5px solid #f0d080;
          color: #a07b10;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 7px 14px;
          border-radius: 20px;
          white-space: nowrap;
        }

        /* Refresh button */
        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #fff;
          border: 1.5px solid #e2e6f3;
          color: #3b5fc0;
          font-size: 0.82rem;
          font-weight: 700;
          padding: 7px 14px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          white-space: nowrap;
        }
        .refresh-btn:hover {
          background: #edf3ff;
          border-color: #3b5fc0;
          transform: translateY(-1px);
        }
        .refresh-btn svg { flex-shrink: 0; }
        .spinning { animation: spin 1s linear infinite; }

        /* ── Error Banner ── */
        .error-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #FEF2F2;
          border: 1.5px solid #FECACA;
          color: #DC2626;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.88rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        /* ── State Box ── */
        .state-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 4rem 2rem;
          color: #9CA3AF;
          text-align: center;
        }
        .state-box p { font-size: 0.95rem; font-weight: 600; margin: 0; }

        /* ── Cards List ── */
        .act-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        /* ── Single Card ── */
        .act-card {
          background: #ffffff;
          border-radius: 16px;
          padding: clamp(1rem, 2.5vw, 1.25rem) clamp(1rem, 3vw, 1.5rem);
          box-shadow: 0 2px 12px rgba(30, 42, 90, 0.07);
          border: 1.5px solid #eaedf6;
          transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s;
          animation: fadeUp 0.3s ease both;
        }
        .act-card:hover {
          box-shadow: 0 8px 28px rgba(30, 42, 90, 0.12);
          transform: translateY(-2px);
          border-color: #d0d9f5;
        }

        /* Card top row */
        .card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        .card-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          flex: 1;
          min-width: 0;
        }
        .card-title {
          font-size: clamp(1rem, 2vw, 1.1rem);
          font-weight: 800;
          color: #1e2a5a;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Type badge */
        .type-badge {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          white-space: nowrap;
          flex-shrink: 0;
          background: #f0f4ff;
          color: #2c4ea8;
          border: 1px solid #d0daf7;
        }

        /* Action buttons */
        .card-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          flex-wrap: wrap;
        }
        .card-actions button {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 7px 14px;
          border-radius: 9px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          border: 1.5px solid transparent;
          transition: all 0.2s ease;
          white-space: nowrap;
          font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
        }
        .btn-reject {
          background: #fff;
          color: #c0392b;
          border-color: #e8c8c5 !important;
        }
        .btn-reject:hover {
          background: #fff5f5;
          border-color: #c0392b !important;
          transform: translateY(-1px);
        }
        .btn-approve {
          background: linear-gradient(135deg, #c49b3a 0%, #a67f2c 100%);
          color: #fff;
          box-shadow: 0 3px 10px rgba(196,155,58,0.28);
        }
        .btn-approve:hover {
          background: linear-gradient(135deg, #a67f2c 0%, #8a6820 100%);
          transform: translateY(-1px);
          box-shadow: 0 5px 16px rgba(196,155,58,0.38);
        }
        .btn-view {
          background: #fff;
          color: #3b5fc0;
          border-color: #c8d4f0 !important;
        }
        .btn-view:hover {
          background: #edf3ff;
          border-color: #3b5fc0 !important;
          transform: translateY(-1px);
        }

        /* Card meta grid */
        .card-meta {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px 16px;
          padding-top: 0.85rem;
          border-top: 1.5px solid #f0f2f8;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
        }
        .meta-icon { color: #8fa3cc; flex-shrink: 0; }
        .meta-label {
          font-size: 0.76rem;
          color: #8fa3cc;
          white-space: nowrap;
          flex-shrink: 0;
          font-weight: 600;
        }
        .meta-value {
          font-size: 0.82rem;
          color: #2c3a5f;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .meta-value.participants { color: #6b7fc4; }
        .meta-value.cost-free { color: #10B981; }

        /* Responsive */
        @media (max-width: 1024px) {
          .card-meta { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .card-top { flex-direction: column; align-items: flex-start; }
          .card-actions { width: 100%; justify-content: flex-start; }
          .card-meta { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .card-title { white-space: normal; }
        }
        @media (max-width: 480px) {
          .act-page { padding: 0.75rem; }
          .card-meta { grid-template-columns: 1fr; gap: 8px; }
          .card-actions { flex-wrap: wrap; gap: 6px; }
          .card-actions button { flex: 1; justify-content: center; min-width: 90px; }
          .act-header { flex-direction: column; align-items: flex-start; }
          .act-header-right { flex-wrap: wrap; }
        }
      `}</style>

      <div className="act-page">
        {/* ── Header ── */}
        <div className="act-header">
          <div className="act-header-left">
            <h2 className="act-title">طلبات الفعاليات العامة</h2>
            <p className="act-subtitle">الفعاليات المقترحة من مدراء الأقسام في انتظار الموافقة</p>
          </div>
          <div className="act-header-right">
            <div className="pending-badge">
              <Clock size={14} />
              <span>{activities.length} طلب في الانتظار</span>
            </div>
            <button className="refresh-btn" onClick={fetchActivities}>
              <RefreshCw size={13} className={loading ? "spinning" : ""} />
              تحديث
            </button>
          </div>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="error-banner">
            <AlertCircle size={17} /> {error}
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="state-box">
            <RefreshCw size={36} className="spinning" style={{ color: "#6b7fc4" }} />
            <p>جاري تحميل البيانات…</p>
          </div>
        ) : activities.length === 0 && !error ? (
          <div className="state-box">
            <Layers size={48} style={{ color: "#d0d9f5" }} />
            <p>لا توجد فعاليات في الانتظار حالياً</p>
          </div>
        ) : (
          <div className="act-list">
            {activities.map((activity, i) => {
              const isFree = !activity.cost || activity.cost === "0" || activity.cost === "0.00";
              return (
                <div
                  key={activity.event_id}
                  className="act-card"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* Card Top */}
                  <div className="card-top">
                    <div className="card-title-row">
                      <h3 className="card-title">{activity.title}</h3>
                      {activity.type && (
                        <span className="type-badge">{activity.type}</span>
                      )}
                    </div>
                    <div className="card-actions">
                      <button
                        className="btn-reject"
                        onClick={() => setConfirm({ id: activity.event_id, action: "reject", title: activity.title })}
                      >
                        <X size={14} />
                        <span>رفض</span>
                      </button>
                      <button
                        className="btn-approve"
                        onClick={() => setConfirm({ id: activity.event_id, action: "approve", title: activity.title })}
                      >
                        <Check size={14} />
                        <span>موافقة</span>
                      </button>
                      <button className="btn-view">
                        <Eye size={14} />
                        <span>عرض التفاصيل</span>
                      </button>
                    </div>
                  </div>

                  {/* Card Meta */}
                  <div className="card-meta">
                    <div className="meta-item">
                      <Calendar size={13} className="meta-icon" />
                      <span className="meta-label">تاريخ البداية:</span>
                      <span className="meta-value">{fmt(activity.st_date)}</span>
                    </div>
                    <div className="meta-item">
                      <Calendar size={13} className="meta-icon" />
                      <span className="meta-label">تاريخ النهاية:</span>
                      <span className="meta-value">{fmt(activity.end_date)}</span>
                    </div>
                    <div className="meta-item">
                      <Users size={13} className="meta-icon" />
                      <span className="meta-label">المشاركون:</span>
                      <span className="meta-value participants">
                        {activity.s_limit >= 2147483647 ? "غير محدود" : activity.s_limit.toLocaleString("ar-EG")}
                      </span>
                    </div>
                    <div className="meta-item">
                      <MapPin size={13} className="meta-icon" />
                      <span className="meta-label">الموقع:</span>
                      <span className="meta-value">{activity.location || "—"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Confirm Dialog ── */}
      {confirm && (
        <ConfirmDialog
          action={confirm.action}
          eventTitle={confirm.title}
          onConfirm={handleAction}
          onCancel={() => setConfirm(null)}
          loading={actionLoading}
        />
      )}

      {/* ── Toast ── */}
      {toastMsg && <Toast msg={toastMsg} />}
    </>
  );
}