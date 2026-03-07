"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Eye, CheckCircle, XCircle, Clock, Calendar, MapPin,
  Users, DollarSign, Building2, Tag, X, ChevronLeft,
  ChevronRight, Layers, AlertCircle, RefreshCw,
} from "lucide-react";
import styles from "../Styles/Activitiesmanagement.module.css";

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("access") : null;

const BASE = "http://127.0.0.1:8000";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  "منتظر":   { label: "قيد الانتظار",  cls: "sPending"  },
  "مقبول":   { label: "مقبول",  cls: "sApproved" },
  "مرفوض":   { label: "مرفوض",  cls: "sRejected" },
  "pending":  { label: "منتظر",  cls: "sPending"  },
  "approved": { label: "مقبول",  cls: "sApproved" },
  "rejected": { label: "مرفوض",  cls: "sRejected" },
};

function statusInfo(raw: string) {
  const key = raw?.trim();
  return STATUS_MAP[key] ?? STATUS_MAP[key?.toLowerCase()] ?? { label: raw, cls: "sPending" };
}

function isPending(raw: string) {
  const k = raw?.trim();
  return k === "منتظر" || k?.toLowerCase() === "pending";
}

function isApprovedStatus(raw: string) {
  const k = raw?.trim();
  return k === "مقبول" || k?.toLowerCase() === "approved";
}

function isRejectedStatus(raw: string) {
  const k = raw?.trim();
  return k === "مرفوض" || k?.toLowerCase() === "rejected";
}

function fmt(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ar-EG");
}

function limitLabel(n: number) {
  return n >= 2147483647 ? "غير محدود" : n.toLocaleString("ar-EG");
}

function extractTypes(events: EventRow[]): string[] {
  const set = new Set<string>();
  events.forEach(e => {
    if (e.type && e.type.trim()) set.add(e.type.trim());
  });
  return Array.from(set).sort();
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({ id, onClose }: { id: number; onClose: () => void }) {
  const [detail, setDetail] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE}/api/event/get-events/${id}/`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) throw new Error();
        setDetail(await res.json());
      } catch {
        setErr("فشل في تحميل تفاصيل الفعالية");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const si = detail ? statusInfo(detail.status) : null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{loading ? "جاري التحميل…" : detail?.title ?? "تفاصيل الفعالية"}</h2>
          <button className={styles.modalCloseBtn} onClick={onClose}>
            <X size={17} />
          </button>
        </div>
        <div className={styles.modalBody}>
          {loading && (
            <div className={styles.stateBox}>
              <RefreshCw size={34} className={styles.spinner} />
              <p>جاري التحميل…</p>
            </div>
          )}
          {err && <p style={{ color: "#EF4444", textAlign: "center" }}>{err}</p>}
          {detail && !loading && (
            <>
              <div className={styles.modalTopRow}>
                <span className={`${styles.badge} ${styles[si!.cls]}`}>{si!.label}</span>
                {detail.type && <span className={styles.typeTag}>{detail.type}</span>}
              </div>
              {detail.description && (
                <div className={styles.descBox}>{detail.description}</div>
              )}
              <div className={styles.detailGrid}>
                {[
                  { icon: <Building2 size={14} />,  label: "الجهة",           val: `${detail.faculty_name ?? "—"} / ${detail.dept_name ?? "—"}` },
                  { icon: <Users size={14} />,       label: "منشئ الفعالية",   val: detail.created_by_name },
                  { icon: <MapPin size={14} />,      label: "الموقع",          val: detail.location },
                  { icon: <Calendar size={14} />,    label: "تاريخ البداية",   val: fmt(detail.st_date) },
                  { icon: <Calendar size={14} />,    label: "تاريخ النهاية",   val: fmt(detail.end_date) },
                  { icon: <Users size={14} />,       label: "الحد الأقصى",     val: limitLabel(detail.s_limit) },
                  { icon: <DollarSign size={14} />,  label: "التكلفة",         val: detail.cost || "مجاني" },
                  { icon: <Tag size={14} />,         label: "المكافأة",        val: detail.reward || "—" },
                  { icon: <AlertCircle size={14} />, label: "القيود",          val: detail.restrictions || "لا يوجد" },
                  { icon: <Layers size={14} />,      label: "الموارد",         val: detail.resource || "—" },
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

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({ action, eventTitle, onConfirm, onCancel, loading }: {
  action: "approve" | "reject";
  eventTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const isApprove = action === "approve";
  return (
    <div className={styles.confirmOverlay}>
      <div className={styles.confirmBox}>
        <div
          className={styles.confirmIcon}
          style={{ background: isApprove ? "#ECFDF5" : "#FEF2F2", color: isApprove ? "#10B981" : "#EF4444" }}
        >
          {isApprove ? <CheckCircle size={28} /> : <XCircle size={28} />}
        </div>
        <h3>{isApprove ? "تأكيد الاعتماد" : "تأكيد الرفض"}</h3>
        <p>
          هل أنت متأكد من {isApprove ? "اعتماد" : "رفض"} فعالية<br />
          <strong style={{ color: "#111827" }}>"{eventTitle}"</strong>؟
        </p>
        <div className={styles.confirmBtns}>
          <button className={styles.cancelBtn} onClick={onCancel} disabled={loading}>إلغاء</button>
          <button
            className={styles.confirmActionBtn}
            style={{ background: isApprove ? "#10B981" : "#EF4444" }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "جاري التنفيذ…" : isApprove ? "اعتماد" : "رفض"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ActivitiesManagement() {
  const [events, setEvents]               = useState<EventRow[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [viewId, setViewId]               = useState<number | null>(null);
  const [confirm, setConfirm]             = useState<{ id: number; action: "approve" | "reject"; title: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch]               = useState("");
  const [filterStatus, setFilterStatus]   = useState("all");
  const [filterType, setFilterType]       = useState("all");
  const [currentPage, setCurrentPage]     = useState(1);
  const [toastMsg, setToastMsg]           = useState("");
  const rowsPerPage = 8;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE}/api/event/get-events/`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error();
      setEvents(await res.json());
      setError("");
    } catch {
      setError("فشل في جلب البيانات. تحقق من الاتصال.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

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
      showToast(confirm.action === "approve" ? "✅ تم اعتماد الفعالية بنجاح" : "❌ تم رفض الفعالية");
      setConfirm(null);
      fetchEvents();
    } catch {
      showToast("⚠️ حدث خطأ أثناء تنفيذ الإجراء");
    } finally {
      setActionLoading(false);
    }
  };

  const countPending  = events.filter(e => isPending(e.status)).length;
  const countApproved = events.filter(e => isApprovedStatus(e.status)).length;
  const countRejected = events.filter(e => isRejectedStatus(e.status)).length;
  const availableTypes = extractTypes(events);

  const filtered = events.filter(e => {
    const term = search.toLowerCase();
    const matchSearch = !search ||
      e.title?.toLowerCase().includes(term) ||
      e.location?.toLowerCase().includes(term) ||
      e.type?.toLowerCase().includes(term);
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "pending"  && isPending(e.status)) ||
      (filterStatus === "approved" && isApprovedStatus(e.status)) ||
      (filterStatus === "rejected" && isRejectedStatus(e.status));
    const matchType =
      filterType === "all" ||
      (e.type?.trim() === filterType);
    return matchSearch && matchStatus && matchType;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated  = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className={styles.root}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1>مراجعة واعتماد الفعاليات</h1>
          <p>إدارة ومتابعة طلبات الفعاليات المقدمة من إدارات الكليات</p>
        </div>
        <button className={styles.refreshBtn} onClick={fetchEvents}>
          <RefreshCw size={14} /> تحديث
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.total}`}>
          <div className={styles.statIcon}><Layers size={22} /></div>
          <div className={styles.statBody}>
            <div className={styles.statNum}>{events.length}</div>
            <div className={styles.statLabel}>إجمالي الطلبات</div>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.pending}`}>
          <div className={styles.statIcon}><Clock size={22} /></div>
          <div className={styles.statBody}>
            <div className={styles.statNum}>{countPending}</div>
            <div className={styles.statLabel}>قيد المراجعة</div>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.approved}`}>
          <div className={styles.statIcon}><CheckCircle size={22} /></div>
          <div className={styles.statBody}>
            <div className={styles.statNum}>{countApproved}</div>
            <div className={styles.statLabel}>معتمدة</div>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.rejected}`}>
          <div className={styles.statIcon}><XCircle size={22} /></div>
          <div className={styles.statBody}>
            <div className={styles.statNum}>{countRejected}</div>
            <div className={styles.statLabel}>مرفوضة</div>
          </div>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className={styles.tableCard}>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <h2 className={styles.toolbarTitle}>قائمة الفعاليات المقدمة</h2>
          <div className={styles.toolbarControls}>
            <input
              className={styles.searchInput}
              placeholder="🔍 ابحث بالعنوان، الموقع، النوع…"
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            />
            <select
              className={styles.filterSelect}
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">كل الحالات</option>
              <option value="pending">قيد المراجعة</option>
              <option value="approved">معتمدة</option>
              <option value="rejected">مرفوضة</option>
            </select>
            <select
              className={styles.filterSelect}
              value={filterType}
              onChange={e => { setFilterType(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">كل الأنشطة</option>
              {availableTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <AlertCircle size={17} /> {error}
          </div>
        )}

        {/* Table */}
        <div className={styles.tableWrap}>
          {loading ? (
            <div className={styles.stateBox}>
              <RefreshCw size={36} className={styles.spinner} />
              <p>جاري تحميل البيانات…</p>
            </div>
          ) : paginated.length === 0 ? (
            <div className={styles.stateBox}>
              <Layers size={44} />
              <p>لا توجد فعاليات مطابقة</p>
            </div>
          ) : (
            <table className={styles.table}>
              {/* ── colgroup locks each column to a fixed percentage ── */}
              <colgroup>
                <col style={{ width: "22%" }} /> {/* عنوان الفعالية */}
                <col style={{ width: "9%"  }} /> {/* النوع */}
                <col style={{ width: "12%" }} /> {/* الموقع */}
                <col style={{ width: "10%" }} /> {/* تاريخ البداية */}
                <col style={{ width: "10%" }} /> {/* تاريخ النهاية */}
                <col style={{ width: "9%"  }} /> {/* المشاركون */}
                <col style={{ width: "9%"  }} /> {/* التكلفة */}
                <col style={{ width: "8%"  }} /> {/* الحالة */}
                <col style={{ width: "11%" }} /> {/* الإجراءات */}
              </colgroup>

              <thead>
                <tr>
                  <th>عنوان الفعالية</th>
                  <th>النوع</th>
                  <th>الموقع</th>
                  <th>تاريخ البداية</th>
                  <th>تاريخ النهاية</th>
                  <th>المشاركون</th>
                  <th>التكلفة</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map(ev => {
                  const si = statusInfo(ev.status);
                  const pending = isPending(ev.status);
                  return (
                    <tr key={ev.event_id}>
                      <td>
                        <div className={styles.titleCell}>
                          <div className={styles.titleMain}>{ev.title}</div>
                          {ev.description && (
                            <div className={styles.titleSub}>{ev.description}</div>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className={styles.typeBadge}>{ev.type || "—"}</span>
                      </td>

                      <td>
                        <div className={styles.locationCell}>
                          <MapPin size={12} />
                          {ev.location || "—"}
                        </div>
                      </td>

                      <td>
                        <div className={styles.dateCell}>
                          <Calendar size={12} />
                          {fmt(ev.st_date)}
                        </div>
                      </td>

                      <td>
                        <div className={styles.dateCell}>
                          <Calendar size={12} />
                          {fmt(ev.end_date)}
                        </div>
                      </td>

                      <td>
                        <div className={styles.participantsCell}>
                          <Users size={12} style={{ color: "#9CA3AF" }} />
                          {limitLabel(ev.s_limit)}
                        </div>
                      </td>

                      <td className={styles.costCell}>
                        {ev.cost && ev.cost !== "0" && ev.cost !== "0.00"
                          ? `${ev.cost} جنيه`
                          : "مجاني"}
                      </td>

                      <td>
                        <span className={`${styles.badge} ${styles[si.cls]}`}>{si.label}</span>
                      </td>

                      <td>
                        <div className={styles.actions}>
                          <button
                            className={`${styles.iconBtn} ${styles.btnView}`}
                            title="عرض التفاصيل"
                            onClick={() => setViewId(ev.event_id)}
                          >
                            <Eye size={15} />
                          </button>
                          {pending && (
                            <>
                              <button
                                className={`${styles.iconBtn} ${styles.btnApprove}`}
                                title="اعتماد"
                                onClick={() => setConfirm({ id: ev.event_id, action: "approve", title: ev.title })}
                              >
                                <CheckCircle size={15} />
                              </button>
                              <button
                                className={`${styles.iconBtn} ${styles.btnReject}`}
                                title="رفض"
                                onClick={() => setConfirm({ id: ev.event_id, action: "reject", title: ev.title })}
                              >
                                <XCircle size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              من <strong>{filtered.length}</strong> فعالية
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

      {viewId !== null && <DetailModal id={viewId} onClose={() => setViewId(null)} />}

      {confirm && (
        <ConfirmDialog
          action={confirm.action}
          eventTitle={confirm.title}
          onConfirm={handleAction}
          onCancel={() => setConfirm(null)}
          loading={actionLoading}
        />
      )}

      {toastMsg && <div className={styles.toast}>{toastMsg}</div>}
    </div>
  );
}