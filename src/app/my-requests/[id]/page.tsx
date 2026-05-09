"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./requestDetails.module.css";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";
const rejectionReasons = [
  { id: 1, text: "إزعاج أو تكرار التقديم بشكل غير مبرر" },
  { id: 2, text: "المستندات المرفوعة غير واضحة أو غير صحيحة" },
  { id: 3, text: "وجود بيانات غير صحيحة في الطلب" },
  { id: 4, text: "الدخل المسجل غير مطابق للمستندات" },
  { id: 5, text: "الطلب لا يستوفي شروط الدعم" },
  { id: 6, text: "المستندات لا تخص الطالب" },
  { id: 7, text: "اشتباه في تزوير المستندات" },
  { id: 8, text: "سبب آخر" }
];
const rejectionReasonMap: Record<number, string> = Object.fromEntries(
  rejectionReasons.map(r => [r.id, r.text])
);
// ====== Colored status badge helper ======
function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span>—</span>;

  const styleMap: Record<string, React.CSSProperties> = {
    "مقبول":           { background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7" },
    "مرفوض":           { background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" },
    "منتظر":           { background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" },
    "موافقة مبدئية":   { background: "#e0e7ff", color: "#3730a3", border: "1px solid #a5b4fc" },
  };

  const base: React.CSSProperties = {
    display: "inline-block", padding: "3px 14px", borderRadius: "999px",
    fontSize: "13px", fontWeight: 700, letterSpacing: "0.3px", verticalAlign: "middle",
    ...(styleMap[status] ?? { background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db" }),
  };

  return <span style={base}>{status}</span>;
}

export default function RequestDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [faculties, setFaculties] = useState<{ faculty_id: number; name: string }[]>([]);
  const [originalDocuments, setOriginalDocuments] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    const fetchFaculties = async () => {
      const res = await authFetch(`${getBaseUrl()}/api/family/faculties/`);
      const d = await res.json();
      setFaculties(Array.isArray(d) ? d : d.results ?? d.data ?? []);
    };
    fetchFaculties();
  }, []);

  const getCollegeName = (facultyId: number) => {
    const faculty = faculties.find((f) => f.faculty_id === facultyId);
    return faculty ? faculty.name : "غير محدد";
  };

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const response = await authFetch(`${getBaseUrl()}/api/solidarity/student/${id}/detail/`);
      const res = await response.json();
      setData(res);
      if (originalDocuments.length === 0 && res?.documents) setOriginalDocuments(res.documents);
    } catch (err) {
      console.error("Error loading details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleOpenDocument = async (docId: number) => {
    try {
      const response = await authFetch(`${getBaseUrl()}/api/files/solidarity/${docId}/download/`);
      if (!response.ok) { console.error("Failed to download document"); return; }
      const blob = await response.blob();
      window.open(URL.createObjectURL(blob), "_blank");
    } catch (error) {
      console.error("Error opening document:", error);
    }
  };

  if (loading || !data) return <p className={styles.loading}>جاري التحميل...</p>;

  const reqStatus = data.req_status as string | undefined;

  return (
    <div className={styles.container}>
      <div className={styles.contentCard}>
      <button className={styles.backBtn} onClick={() => router.push('/Student/takafol?tab=myRequests')}>
        ← العودة
      </button>

        <h2 className={styles.pageTitle}>تفاصيل الطلب</h2>

        <section className={styles.section}>
          <h3>بيانات الطالب</h3>
          <div className={styles.infoGrid}>
            <p><strong>الاسم:</strong> {data.student_name as string}</p>
            <p><strong>الكلية:</strong> {getCollegeName(data.faculty as number)}</p>
            <p><strong>التقدير:</strong> {data.grade as string}</p>
            <p><strong>النظام الأكاديمي:</strong> {data.acd_status as string}</p>
            <p><strong>رقم الطلب:</strong> {data.solidarity_id as string}</p>
            <p>
              <strong>حالة الطلب:</strong>{" "}
              <StatusBadge status={reqStatus} />
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h3>بيانات الأسرة والدخل</h3>
          <div className={styles.infoGrid}>
            <p><strong>حالة الأب:</strong> {data.father_status as string}</p>
            <p><strong>دخل الأب:</strong> {data.father_income as string}</p>
            <p><strong>حالة الأم:</strong> {data.mother_status as string}</p>
            <p><strong>دخل الأم:</strong> {data.mother_income as string}</p>
            <p><strong>عدد أفراد الأسرة:</strong> {data.family_numbers as string}</p>
            <p><strong>الترتيب بين الإخوة:</strong> {data.arrange_of_brothers as string}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h3>التواصل والعنوان</h3>
          <div className={styles.infoGrid}>
            <p><strong>رقم الأب:</strong> {data.f_phone_num as string}</p>
            <p><strong>رقم الأم:</strong> {data.m_phone_num as string}</p>
            <p><strong>العنوان:</strong> {data.address as string}</p>
            <p><strong>الحالة السكنية:</strong> {data.housing_status as string}</p>
            <p><strong>الإعاقة:</strong> {data.disabilities as string}</p>
            <p><strong>تكافل وكرامة:</strong> {data.sd as string}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h3>الخصم</h3>
          <div className={styles.infoGrid}>
            <p><strong>إجمالي الخصم:</strong> {(data.total_discount as number) ?? "—"}</p>
            <p>
              <strong>نوع الخصم:</strong>{" "}
              {Array.isArray(data.discount_type) && (data.discount_type as string[]).length > 0
                ? (data.discount_type as string[]).join("، ")
                : "—"}
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h3>سبب طلب الدعم</h3>
          <div className={styles.longText}>{(data.reason as string) || "—"}</div>
        </section>

        <section className={styles.section}>
          <h3>المستندات المرفوعة</h3>
          {originalDocuments && originalDocuments.length > 0 ? (
            <div className={styles.docsContainer}>
              {originalDocuments.map((doc: Record<string, unknown>) => (
                <div key={doc.doc_id as number} className={styles.docCard}>
                  <p><strong>{doc.doc_type as string}</strong></p>
                  <button
                    className={styles.openBtn}
                    onClick={() => handleOpenDocument(doc.doc_id as number)}
                  >
                    فتح الملف
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>لا توجد ملفات مرفوعة</p>
          )}
        </section>

        {/* Rejection reason — highlighted */}
        {reqStatus === "مرفوض" && (
          <section className={styles.section}>
            <div style={{
              background: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
              border: "1.5px solid #fca5a5",
              borderRight: "5px solid #ef4444",
              borderRadius: "10px",
              padding: "14px 18px",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              marginTop: "10px",
            }}>
              <span style={{ fontSize: "18px", flexShrink: 0, marginTop: "1px" }}>⚠️</span>
              <div>
                <div style={{ fontWeight: 700, color: "#991b1b", fontSize: "14px", marginBottom: "4px" }}>
                  سبب الرفض
                </div>
                <div style={{ color: "#7f1d1d", fontSize: "15px", lineHeight: 1.6 }}>
                 {rejectionReasonMap[Number(data?.rejection_reason)] ?? data?.rejection_reason ?? "لم يُحدد"}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}