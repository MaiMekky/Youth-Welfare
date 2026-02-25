// Events/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./Eventdetails.module.css";

/* ══════════════════════════════════════════
   API TYPE  (matches /api/event/get-events/{id}/)
══════════════════════════════════════════ */
interface ApiEventDetail {
  event_id: number;
  created_by_name: string;
  faculty_name: string | null;
  dept_name: string | null;
  family_name: string | null;
  title: string;
  description: string;
  updated_at: string;
  cost: string;
  location: string;
  restrictions: string | null;
  reward: string | null;
  status: string;
  imgs: string | null;
  st_date: string;
  end_date: string;
  s_limit: number;
  created_at: string;
  type: string;
}

/* ══════════════════════════════════════════
   ICONS
══════════════════════════════════════════ */
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function SectionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3h7l5 5v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 3v4a1 1 0 0 0 1 1h4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8ZM17 12a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2.5 22v-1a6.5 6.5 0 0 1 13 0v1" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14.2 22v-1a5 5 0 0 1 9.8 0v1" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function PinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 22s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 12.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
function formatDate(iso: string | null) {
  if (!iso) return "—";
  return iso.slice(0, 10);
}

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("ar-EG", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function statusBadgeClass(status: string) {
  if (status === "مقبول"  || status === "active")    return styles.badgeActive;
  if (status === "مرفوض"  || status === "completed") return styles.badgeCompleted;
  if (status === "منتظر"  || status === "pending")   return styles.badgePending;
  return styles.badgeDefault;
}

/* ── Field component ── */
function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <div className={styles.fieldLabel}>{label}</div>
      <div className={styles.fieldValue}>{value}</div>
    </div>
  );
}

/* ══════════════════════════════════════════
   SKELETON
══════════════════════════════════════════ */
function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardIcon} style={{ background: "#f0f0f0" }} />
        <div style={{ height: 18, width: 120, borderRadius: 6, background: "#efefef" }} />
      </div>
      <div className={styles.grid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.field}>
            <div style={{ height: 12, width: 70, borderRadius: 4, background: "#efefef", marginBottom: 6 }} />
            <div style={{ height: 16, width: "80%", borderRadius: 4, background: "#f5f5f5" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function EventDetailsPage() {
  const router  = useRouter();
  const params  = useParams();
  const eventId = params?.id;

  const [event,   setEvent]   = useState<ApiEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;

        const res = await fetch(
          `http://127.0.0.1:8000/api/event/get-events/${eventId}/`,
          {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.detail || body.message || `HTTP ${res.status}`);
        }

        const data: ApiEventDetail = await res.json();
        setEvent(data);
      } catch (e: any) {
        setError(e.message ?? "حدث خطأ أثناء تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [eventId]);

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div className={styles.page} dir="rtl" lang="ar">
      <div className={styles.overlay}>
        <div className={styles.modal} role="dialog" aria-modal="true">

          {/* ── Header ── */}
          <div className={styles.modalHeader}>
            <div>
              <h1 className={styles.title}>تفاصيل الفعالية</h1>
              <p className={styles.subtitle}>معلومات شاملة عن الفعالية بما في ذلك المتطلبات والمواصفات.</p>
            </div>
            <button className={styles.closeBtn} type="button" onClick={() => router.back()} aria-label="إغلاق">
              <XIcon className={styles.closeIcon} />
            </button>
          </div>

          {/* ── Loading ── */}
          {loading && (
            <div className={styles.body}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {/* ── Error ── */}
          {!loading && error && (
            <div className={styles.empty}>
              <div className={styles.emptyTitle}>⚠️ حدث خطأ</div>
              <div className={styles.emptyText}>{error}</div>
              <button
                onClick={() => window.location.reload()}
                style={{ marginTop: 12, padding: "8px 20px", borderRadius: 8, border: "none", background: "#bfa032", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {/* ── Not found ── */}
          {!loading && !error && !event && (
            <div className={styles.empty}>
              <div className={styles.emptyTitle}>لم يتم العثور على الفعالية</div>
              <div className={styles.emptyText}>تأكد من رقم الفعالية في الرابط.</div>
            </div>
          )}

          {/* ── Content ── */}
          {!loading && !error && event && (
            <div className={styles.body}>

              {/* 1) Basic Information */}
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}><SectionIcon className={styles.sectionIcon} /></span>
                  <h2 className={styles.cardTitle}>المعلومات الأساسية</h2>
                </div>

                <div className={styles.grid}>
                  
                  <Field label="اسم الفعالية" value={event.title} />
                  <Field label="النوع" value={<span className={`${styles.badge} ${styles.badgeType}`}>{event.type}</span>} />
                  <Field
                    label="الحالة"
                    value={<span className={`${styles.badge} ${statusBadgeClass(event.status)}`}>{event.status}</span>}
                  />
                </div>

                <div className={styles.longField}>
                  <div className={styles.fieldLabel}>الوصف</div>
                  <div className={styles.longValue}>{event.description}</div>
                </div>
              </section>

              {/* 2) Organizational Information */}
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}><UsersIcon className={styles.sectionIcon} /></span>
                  <h2 className={styles.cardTitle}>معلومات تنظيمية</h2>
                </div>

                <div className={styles.grid}>
                  <Field label="الكلية"             value={event.faculty_name ?? "—"} />
                  <Field label="القسم"              value={event.dept_name    ?? "—"} />
                  <Field label="تم الإنشاء بواسطة" value={event.created_by_name} />
                  <Field label="تاريخ الإنشاء"     value={formatDateTime(event.created_at)} />
                  <Field label="آخر تحديث"         value={formatDateTime(event.updated_at)} />
                </div>
              </section>

              {/* 3) Event Details */}
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}><PinIcon className={styles.sectionIcon} /></span>
                  <h2 className={styles.cardTitle}>تفاصيل الفعالية</h2>
                </div>

                <div className={styles.grid}>
                  <Field label="تاريخ البدء"   value={formatDate(event.st_date)} />
                  <Field label="تاريخ الانتهاء" value={formatDate(event.end_date)} />
                  <Field label="المكان"         value={event.location} />
                  <Field label="حد الطلاب"     value={`${event.s_limit} طالب`} />
                  <Field
                    label="التكلفة"
                    value={
                      parseFloat(event.cost) > 0
                        ? `${parseFloat(event.cost).toLocaleString("ar-EG")} ج`
                        : "مجاني"
                    }
                  />
             
                </div>
              </section>

              {/* 4) Additional Information */}
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardIcon}><PlusIcon className={styles.sectionIcon} /></span>
                  <h2 className={styles.cardTitle}>معلومات إضافية</h2>
                </div>

                <div className={styles.gridTwo}>
                  <div className={styles.longField}>
                    <div className={styles.fieldLabel}>القيود</div>
                    <div className={styles.longValue}>{event.restrictions ?? "لا يوجد"}</div>
                  </div>
                  <div className={styles.longField}>
                    <div className={styles.fieldLabel}>المكافآت</div>
                    <div className={styles.longValue}>{event.reward ?? "لا يوجد"}</div>
                  </div>
                </div>
              </section>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}