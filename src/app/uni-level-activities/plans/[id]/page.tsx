"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./PlanDetails.module.css";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  Lightbulb,
  Eye,
  Plus,
  Building2,
  Layers,
} from "lucide-react";

const API_URL = "http://localhost:8000/api";

/* ================= Types ================= */

type ApiPlanEvent = {
  event_id: number;
  title: string;
  description: string;
  dept: number | null;
  dept_name: string | null;
  faculty: number | null;
  faculty_name: string | null;
  created_by: number | null;
  created_by_name: string | null;
  family: number | null;
  family_name: string | null;
  cost: string | null;
  location: string | null;
  restrictions: string | null;
  reward: string | null;
  status: string;
  type: string;
  imgs: any;
  st_date: string;
  end_date: string;
  s_limit: number | null;
  resource: any;
  selected_facs: any;
  active: boolean;
  created_at: string;
  updated_at: string;
};

type ApiPlanDetails = {
  plan_id: number;
  name: string;
  term: number;
  faculty: number | null;
  faculty_name: string | null;
  events: ApiPlanEvent[];
  created_at: string;
  updated_at: string;
};

/* ================= Helpers (UI mapping) ================= */

function statusLabel(ar: string) {
  const s = (ar || "").trim();
  if (["مقبول", "موافق", "تمت الموافقة", "معتمد"].includes(s)) return "مقبول";
  if (["منتظر", "في الانتظار", "قيد المراجعة"].includes(s)) return "منتظر";
  if (["مرفوض", "مرفوضة", "تم الرفض"].includes(s)) return "مرفوض";
  if (["مكتمل", "منتهي"].includes(s)) return "مكتمل";
  if (["نشط", "فعال"].includes(s)) return "نشط";
  if (["قريباً", "قريبا", "قادمة"].includes(s)) return "قريباً";
  return s || "—";
}

function statusClass(stylesObj: any, s: string) {
  const x = statusLabel(s);
  if (x === "مقبول") return stylesObj.statusOk;
  if (x === "منتظر") return stylesObj.statusAmber;
  if (x === "مرفوض") return stylesObj.statusDanger;
  if (x === "مكتمل") return stylesObj.statusBlue;
  if (x === "نشط") return stylesObj.statusBlue;
  if (x === "قريباً") return stylesObj.statusAmber;
  return stylesObj.statusNeutral;
}

function typeClass(stylesObj: any, t: string) {
  const x = (t || "").trim();
  if (x.includes("ثقافي")) return stylesObj.typePurple;
  if (x.includes("رياضي")) return stylesObj.typeRed;
  if (x.includes("تقني") || x.includes("تكنولوج")) return stylesObj.typeBlue;
  if (x.includes("فني")) return stylesObj.typeIndigo;
  return stylesObj.typeNeutral;
}

function safeMoney(v: string | null) {
  const s = (v ?? "").trim();
  if (!s) return "—";
  if (s === "0" || s === "0.00") return "مجاني";
  return `${s} جنيه`;
}

/* ================= Component ================= */

export default function PlanDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id ?? "");

  const [plan, setPlan] = useState<ApiPlanDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  function getAccessToken(): string | null {
    return (
      localStorage.getItem("access") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      null
    );
  }

  async function apiCall(
    path: string,
    opts: RequestInit = {}
  ): Promise<{ ok: true; data: any } | { ok: false; message: string }> {
    const token = getAccessToken();
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(opts.headers as any),
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
      const res = await fetch(`http://localhost:8000${path}`, { ...opts, headers });
      const text = await res.text();
      const json = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;

      if (!res.ok) {
        const msg =
          (typeof json === "object" && json && (json.detail || json.message)) ||
          (typeof json === "string" ? json : "") ||
          `طلب غير ناجح (${res.status})`;
        return { ok: false, message: String(msg) };
      }

      return { ok: true, data: json };
    } catch (e: any) {
      return { ok: false, message: e?.message || "مشكلة في الاتصال" };
    }
  }
    const onRemoveEvent = async (eventId: number) => {
    if (!confirm("هل تريد إلغاء هذه الفعالية من الخطة؟")) return;

    setRemovingId(eventId);

    const res = await apiCall(`/api/events/plans/${id}/remove-event/${eventId}/`, {
      method: "DELETE", 
    });

    setRemovingId(null);

    if (!res.ok) {
      window.alert(res.message);
      return;
    }

    setPlan((prev) => {
      if (!prev) return prev;
      return { ...prev, events: prev.events.filter((e) => e.event_id !== eventId) };
    });
  };
  async function fetchPlanDetails() {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("access");
      if (!token) {
        setPlan(null);
        setError("مفيش access token. اعملي تسجيل دخول تاني.");
        return;
      }

      const res = await fetch(`${API_URL}/events/plans/${id}/details/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const text = await res.text();
      console.log("GET plan details status:", res.status);
      console.log("GET plan details raw body:", text);

      if (!res.ok) {
        setPlan(null);
        setError(`فشل تحميل تفاصيل الخطة (Status ${res.status})`);
        return;
      }

      const parsed = text ? JSON.parse(text) : null;
      if (!parsed || typeof parsed !== "object") {
        setPlan(null);
        setError("الـ API رجّع بيانات غير متوقعة.");
        return;
      }

      setPlan(parsed as ApiPlanDetails);
    } catch (e) {
      console.error(e);
      setPlan(null);
      setError("حصل خطأ أثناء تحميل تفاصيل الخطة");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    fetchPlanDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Derived stats (Optional)
  const derived = useMemo(() => {
    const events = plan?.events ?? [];
    const totalEvents = events.length;
    const completedEvents = events.filter((e) => statusLabel(e.status) === "مكتمل").length;
    const pendingEvents = events.filter((e) => statusLabel(e.status) === "منتظر").length;

    return { totalEvents, completedEvents, pendingEvents };
  }, [plan]);

  const onAddProposed = () => {
    router.push(`/uni-level-activities/plans/${id}/propsed/create`);
  };


  const onConvertToEvent = (eventId: number) => {
    const ev = plan?.events?.find((x) => x.event_id === eventId);
    if (!ev) return;

    sessionStorage.setItem(
      "convert_proposed_payload",
      JSON.stringify({
        planId: id,
        event: ev,
      })
    );

    router.push(`/uni-level-activities/plans/${id}/propsed/create?mode=convert`);
  };

  const onViewLinkedEvent = (eventId: number) => {
    router.push(`/uni-level-activities/${eventId}`);
  };

  // UI safe fallbacks
  const planTitle = plan?.name ?? "—";
  const planSubtitle = "معلومات شاملة عن الخطة والفعاليات المرتبطة بها";
  const facultyName = plan?.faculty_name ?? "خطة عامة على مستوى الجامعة";
  const termLabel = plan?.term ? `الترم: ${plan.term}` : "—";

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <div className={styles.headText}>
            <h1 className={styles.pageTitle}>تفاصيل الخطة</h1>
            <p className={styles.pageSubtitle}>{planSubtitle}</p>
          </div>

          <button className={styles.backBtn} onClick={() => router.push("/uni-level-activities/plans")}>
            <ArrowRight size={18} />
            العودة للخطط
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: 14, fontWeight: 900 }}>
            جاري تحميل تفاصيل الخطة...
          </div>
        )}

        {error && (
          <div style={{ textAlign: "center", padding: 14, color: "crimson", fontWeight: 900 }}>
            {error}
          </div>
        )}

        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.heroTitle}>{planTitle}</div>

          <div className={styles.heroBadges}>
            <span className={styles.badgeSoft}>
              <Building2 size={14} /> {facultyName}
            </span>
            <span className={styles.badgeSoft}>
              <Layers size={14} /> {termLabel}
            </span>
          </div>
        </div>

        {/* Stats (اختياري) */}
        <div className={styles.statsRow}>
          <div className={`${styles.statCard} ${styles.statAmber}`}>
            <div className={styles.statIcon}>
              <Lightbulb size={20} />
            </div>
            <div className={styles.statText}>
              <div className={styles.statLabel}>منتظر</div>
              <div className={styles.statValue}>{derived.pendingEvents}</div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statGreen}`}>
            <div className={styles.statIcon}>
              <CheckCircle2 size={20} />
            </div>
            <div className={styles.statText}>
              <div className={styles.statLabel}>مكتمل</div>
              <div className={styles.statValue}>{derived.completedEvents}</div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statIndigo}`}>
            <div className={styles.statIcon}>
              <FileText size={20} />
            </div>
            <div className={styles.statText}>
              <div className={styles.statLabel}>إجمالي</div>
              <div className={styles.statValue}>{derived.totalEvents}</div>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <section className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>
              <FileText size={16} /> عنوان الخطة
            </div>
            <div className={styles.infoValue}>{planTitle}</div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>
              <CalendarDays size={16} /> الترم
            </div>
            <div className={styles.infoValue} dir="ltr">
              {plan?.term ?? "—"}
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>
              <Building2 size={16} /> الكلية
            </div>
            <div className={styles.infoValue}>{facultyName}</div>
          </div>

          <div className={`${styles.infoCard}`}>
            <div className={styles.infoLabel}>
              <FileText size={16} /> ملاحظات
            </div>
            <div className={styles.infoValue}>
              {plan?.faculty_name ? "هذه خطة خاصة بكلية محددة." : "هذه خطة عامة على مستوى الجامعة."}
            </div>
          </div>
        </section>

        {/* ✅ One table for all events */}
        <section className={styles.tableBlock}>
          <div className={styles.tableHead}>
            <div className={styles.tableTitle}>
              فعاليات الخطة <span className={styles.count}>({plan?.events?.length ?? 0})</span>
            </div>

            <button className={styles.miniChipBtn} type="button" onClick={onAddProposed}>
              <Plus size={14} />
              إضافة فعالية مقترحة
            </button>
          </div>

          <div className={styles.hintInfo}>
            <div className={styles.hintIcon}>
              <Lightbulb size={18} />
            </div>
            <p className={styles.hintText}>
              
 الفعاليات المقترحة هي تفاصيل مبدئية للتخطيط ولا تظهر للطلاب، يمكن تحويلها لفعالية لاحقاً.
           <br />
 الفعاليات الفعلية هي الفعاليات المنفذة والمنشورة للطلاب للتسجيل فيها.
            </p>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>اسم الفعالية</th>
                  <th>القسم</th>
                  <th>النوع</th>
                  <th>الحالة</th>
                  <th>تاريخ البداية</th>
                  <th>تاريخ النهاية</th>
                  <th>المكان</th>
                  <th>الحد</th>
                  <th>التكلفة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {(plan?.events ?? []).map((e) => {
                 const converted =
                  typeof window !== "undefined" &&
                  sessionStorage.getItem(`converted_${id}_${e.event_id}`) === "1";  
                  return (
                    <tr key={e.event_id}>
                      <td className={styles.cellTitle}>{e.title}</td>
                      <td>{e.dept_name ?? "—"}</td>

                      <td>
                        <span className={`${styles.typePill} ${typeClass(styles, e.type)}`}>
                          {e.type || "—"}
                        </span>
                      </td>

                      <td>
                        <span className={statusClass(styles, e.status)}>{statusLabel(e.status)}</span>
                      </td>

                      <td dir="ltr">{e.st_date}</td>
                      <td dir="ltr">{e.end_date}</td>
                      <td>{e.location ?? "—"}</td>
                      <td className={styles.cellValue}>{e.s_limit != null ? e.s_limit : "—"}</td>
                      <td className={styles.cellValue}>{safeMoney(e.cost)}</td>

                      <td>
                        <div className={styles.rowActions}>
                            <button
                              className={styles.actionBtn}
                              type="button"
                              onClick={() => onViewLinkedEvent(e.event_id)}
                            >
                              <Eye size={16} />
                              عرض التفاصيل
                            </button>
                
                          {!converted && (
                              <button
                                className={styles.actionBtn}
                                type="button"
                                onClick={() => onConvertToEvent(e.event_id)}
                              >
                                <Plus size={16} />
                                إنشاء للفعالية
                              </button>
                            )}
                             <button
                              className={styles.actionBtnDanger}
                              type="button"
                              disabled={removingId === e.event_id}
                              onClick={() => onRemoveEvent(e.event_id)}
                              title="إلغاء الفعالية من الخطة"
                              style={{ opacity: removingId === e.event_id ? 0.7 : 1 }}
                            >
                              الغاء
                            </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {!loading && !error && (plan?.events?.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", padding: 16, color: "#64748b", fontWeight: 800 }}>
                      لا توجد فعاليات مرتبطة بهذه الخطة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}