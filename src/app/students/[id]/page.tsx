"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./studentDetails.module.css";
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
    "مقبول": {
      background: "#d1fae5", color: "#065f46",
      border: "1px solid #6ee7b7",
    },
    "مرفوض": {
      background: "#fee2e2", color: "#991b1b",
      border: "1px solid #fca5a5",
    },
    "منتظر": {
      background: "#fef3c7", color: "#92400e",
      border: "1px solid #fcd34d",
    },
    "موافقة مبدئية": {
      background: "#e0e7ff", color: "#3730a3",
      border: "1px solid #a5b4fc",
    },
  };

  const baseStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "3px 14px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "0.3px",
    verticalAlign: "middle",
    ...(styleMap[status] ?? {
      background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db",
    }),
  };

  return <span style={baseStyle}>{status}</span>;
}

export default function StudentDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [docs, setDocs] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<number | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const baseUrl = getBaseUrl();
        const response = await authFetch(
          `${baseUrl}/api/solidarity/super_dept/${id}/applications/`
        );
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error(error);
      }
    };
    if (id) fetchDetails();
  }, [id]);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await authFetch(
          `${getBaseUrl()}/api/solidarity/super_dept/${id}/documents/`
        );
        if (!response.ok) { setDocs([]); setLoading(false); return; }
        const files = await response.json();
        setDocs(files);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching documents:", error);
        setLoading(false);
      }
    };
    if (id) fetchDocs();
  }, [id]);

  const openDocument = async (docId: number) => {
    try {
      const res = await authFetch(
        `${getBaseUrl()}/api/files/solidarity/${docId}/download/`
      );
      if (!res.ok) throw new Error("FILE_ERROR");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error opening document:", error);
    }
  };

  const handleApprove = async () => {
    try {
      const response = await authFetch(
        `${getBaseUrl()}/api/solidarity/super_dept/${id}/change_to_approve/`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );
      if (!response.ok) throw new Error("حدث خطأ أثناء قبول الطالب");
      await response.json();
      setData((prev) => ({ ...prev, req_status: "مقبول" }));
      showToast("✅ تم قبول الطالب بنجاح", "success");
    } catch (error) {
      console.error(error);
      showToast("❌ فشل قبول الطالب", "error");
    }
  };

  const openRejectModal = () => {
    setSelectedReason(null);
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    try {
      if (!selectedReason) { showToast("يرجى اختيار سبب الرفض", "error"); return; }
      const response = await authFetch(
        `${getBaseUrl()}/api/solidarity/super_dept/${id}/change_to_reject/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rejection_reason: selectedReason })
        }
      );
      if (!response.ok) throw new Error("حدث خطأ أثناء رفض الطالب");
      await response.json();
      setData((prev) => ({ ...prev, req_status: "مرفوض" }));
      setShowRejectModal(false);
      setSelectedReason(null);
      showToast("❌ تم رفض الطالب بنجاح", "error");
    } catch (error) {
      console.error(error);
      showToast("❌ فشل رفض الطالب", "error");
    }
  };

  if (loading || !data) return <p className={styles.loading}>جاري التحميل...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.contentCard}>
        <button className={styles.backBtn} onClick={() => router.push('/SuperAdmin')}>
          ← العودة
        </button>

        <h2 className={styles.pageTitle}>تفاصيل الطالب</h2>

        {/* المعلومات الأساسية */}
        <section className={styles.section}>
          <h3>المعلومات الأساسية</h3>
          <div className={styles.infoGrid}>
            <p><strong>رقم التضامن:</strong> {String(data.solidarity_id ?? '')}</p>
            <p><strong>اسم الطالب:</strong> {String(data.student_name ?? '')}</p>
            <p><strong>الرقم الجامعي:</strong> {String(data.student_uid ?? '')}</p>
            <p><strong>الكلية:</strong> {String(data.faculty_name ?? '')}</p>
            <p><strong>الحالة الأكاديمية:</strong> {String(data.acd_status ?? '')}</p>
            <p><strong>التقدير:</strong> {String(data.grade ?? '')}</p>
            <p><strong>تاريخ الإنشاء:</strong> {String(data.created_at ?? '').slice(0, 10)}</p>
          </div>
        </section>

        {/* معلومات الطلب */}
        <section className={styles.section}>
          <h3>معلومات الطلب</h3>
          <div className={styles.infoGrid}>
            <p>
              <strong>حالة الطلب:</strong>{" "}
              <StatusBadge status={String(data.req_status ?? '')} />
            </p>
            <p><strong>المراجع:</strong> {String(data.approved_by ?? "—")}</p>
            <p><strong>آخر تحديث:</strong> {String(data.updated_at ?? '').slice(0, 10)}</p>
          </div>
        </section>

        {/* الأسرة */}
        <section className={styles.section}>
          <h3>معلومات الأسرة</h3>
          <div className={styles.infoGrid}>
            <p><strong>عدد أفراد الأسرة:</strong> {String(data.family_numbers ?? '')}</p>
            <p><strong>ترتيب الطالب:</strong> {String(data.arrange_of_brothers ?? '')}</p>
            <p><strong>حالة الأب:</strong> {String(data.father_status ?? '')}</p>
            <p><strong>حالة الأم:</strong> {String(data.mother_status ?? '')}</p>
          </div>
        </section>

        {/* الدخل */}
        <section className={styles.section}>
          <h3>المعلومات المالية</h3>
          <div className={styles.infoGrid}>
            <p><strong>دخل الأب:</strong> {String(data.father_income ?? '')}</p>
            <p><strong>دخل الأم:</strong> {String(data.mother_income ?? '')}</p>
            <p><strong>إجمالي الدخل:</strong> {String(data.total_income ?? '')}</p>
          </div>
        </section>

        {/* السكن والاتصال */}
        <section className={styles.section}>
          <h3>معلومات الاتصال والسكن</h3>
          <div className={styles.infoGrid}>
            <p><strong>هاتف الأم:</strong> {String(data.m_phone_num ?? '')}</p>
            <p><strong>هاتف الأب:</strong> {String(data.f_phone_num ?? '')}</p>
            <p><strong>السكن:</strong> {String(data.housing_status ?? '')}</p>
            <p><strong>العنوان:</strong> {String(data.address ?? '')}</p>
          </div>
        </section>

        {/* إضافي */}
        <section className={styles.section}>
          <h3>معلومات إضافية</h3>
          <div className={styles.infoGrid}>
            <p><strong>ذوي الهمم:</strong> {String(data.disabilities ?? '')}</p>
            <p><strong>السبب:</strong> {String(data.reason ?? '')}</p>
          </div>
        </section>

        {/* المستندات */}
        <section className={styles.section}>
          <h3>المستندات المرفوعة</h3>
          {docs.length === 0 ? (
            <p>لا توجد مستندات.</p>
          ) : (
            <div className={styles.docsContainer}>
              {docs.map((doc) => (
                <div key={String(doc.doc_id)} className={styles.docCard}>
                  <p><strong>{String(doc.doc_type ?? '')}</strong></p>
                  <button
                    onClick={() => openDocument(Number(doc.doc_id))}
                    className={styles.docLinkButton}
                  >
                    افتح الملف
                  </button>
                  <p className={styles.uploadDate}>
                    تم الرفع: {String(doc.uploaded_at ?? '').slice(0, 10)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        
          {/* Rejection reason — highlighted */}
          {data?.req_status === "مرفوض" && (
            <section className={styles.section}>
            <div style={{
              marginTop: "14px",
              background: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
              border: "1.5px solid #fca5a5",
              borderRight: "5px solid #ef4444",
              borderRadius: "10px",
              padding: "14px 18px",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
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

        {/* الأزرار */}
        <div className={styles.actions}>
          {data.req_status === "مقبول" && (
            <button className={styles.rejectBtn} onClick={openRejectModal}>رفض الطالب</button>
          )}
          {data.req_status === "مرفوض" && (
            <button className={styles.approveBtn} onClick={handleApprove}>قبول الطالب</button>
          )}
          {data.req_status !== "مقبول" && data.req_status !== "مرفوض" && (
            <>
              <button className={styles.approveBtn} onClick={handleApprove}>قبول الطالب</button>
              <button className={styles.rejectBtn} onClick={openRejectModal}>رفض الطالب</button>
            </>
          )}
        </div>
      </div>

      {showRejectModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3 className={styles.modalTitle}>اختر سبب رفض الطلب</h3>
            <div className={styles.reasonList}>
              {rejectionReasons.map((reason) => (
                <label key={reason.id} className={styles.reasonItem}>
                  <input
                    type="radio"
                    name="rejectReason"
                    value={reason.id}
                    checked={selectedReason === reason.id}
                    onChange={() => setSelectedReason(reason.id)}
                  />
                  {reason.text}
                </label>
              ))}
            </div>
            <div className={styles.modalActions}>
              <button className={styles.rejectBtn} onClick={handleReject}>تأكيد الرفض</button>
              <button className={styles.cancelBtn} onClick={() => { setShowRejectModal(false); setSelectedReason(null); }}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}