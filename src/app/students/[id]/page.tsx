"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./studentDetails.module.css";

export default function StudentDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [notification, setNotification] = useState<{ message: string; type: string } | null>(null);

  const showNotification = (message: string, type: string) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2500);
  };

  // ====== جلب بيانات الطلب ======
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem("access");

        const response = await fetch(
          `http://127.0.0.1:8000/api/solidarity/super_dept/${id}/applications/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error(error);
      }
    };

    if (id) fetchDetails();
  }, [id]);

  // ====== جلب الملفات الخاصة بالطلب ======
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const token = localStorage.getItem("access");

        const response = await fetch(
          `http://127.0.0.1:8000/api/solidarity/super_dept/${id}/documents/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

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

  // ====== قبول / رفض ======
// ====== قبول الطالب ======
const handleApprove = async () => {
  try {
    const token = localStorage.getItem("access");
    if (!token) throw new Error("User not authenticated");

    const response = await fetch(
      `http://127.0.0.1:8000/api/solidarity/super_dept/${id}/change_to_approve/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("حدث خطأ أثناء قبول الطالب");

    const result = await response.json();

    // تحديث الحالة في الواجهة بعد نجاح الطلب
    setData((prev: any) => ({ ...prev, req_status: "مقبول" }));
    showNotification("✅ تم قبول الطالب بنجاح", "success");
  } catch (error) {
    console.error(error);
    showNotification("❌ فشل قبول الطالب", "error");
  }
};


 // ====== رفض الطالب ======
const handleReject = async () => {
  try {
    const token = localStorage.getItem("access");
    if (!token) throw new Error("User not authenticated");

    const response = await fetch(
      `http://127.0.0.1:8000/api/solidarity/super_dept/${id}/change_to_reject/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("حدث خطأ أثناء رفض الطالب");

    const result = await response.json();

    // تحديث الحالة في الواجهة بعد نجاح الطلب
    setData((prev: any) => ({ ...prev, req_status: "مرفوض" }));
    showNotification("❌ تم رفض الطالب بنجاح", "error");
  } catch (error) {
    console.error(error);
    showNotification("❌ فشل رفض الطالب", "error");
  }
};


  if (loading || !data) return <p className={styles.loading}>جاري التحميل...</p>;

  return (
    <div className={styles.container}>
      {/* الإشعار */}
      {notification && (
        <div
          className={`${styles.notification} ${
            notification.type === "success" ? styles.success : styles.error
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className={styles.contentCard}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          ← العودة
        </button>

        <h2 className={styles.pageTitle}>تفاصيل الطالب</h2>

        {/* ====== البيانات الأساسية ====== */}
        <section className={styles.section}>
          <h3>المعلومات الأساسية</h3>
          <div className={styles.infoGrid}>
            <p><strong>رقم التضامن:</strong> {data.solidarity_id}</p>
            <p><strong>اسم الطالب:</strong> {data.student_name}</p>
            <p><strong>الرقم الجامعي:</strong> {data.student_uid}</p>
            <p><strong>الكلية:</strong> {data.faculty_name}</p>
            <p><strong>الحالة الأكاديمية:</strong> {data.acd_status}</p>
            <p><strong>التقدير:</strong> {data.grade}</p>
            <p><strong>تاريخ الإنشاء:</strong> {data.created_at?.slice(0, 10)}</p>
          </div>
        </section>

        {/* ====== معلومات الطلب ====== */}
        <section className={styles.section}>
          <h3>معلومات الطلب</h3>
          <div className={styles.infoGrid}>
            <p><strong>حالة الطلب:</strong> {data.req_status}</p>
            <p><strong>المراجع:</strong> {data.approved_by ?? "—"}</p>
            <p><strong>آخر تحديث:</strong> {data.updated_at?.slice(0, 10)}</p>
          </div>
        </section>

        {/* ====== الأسرة ====== */}
        <section className={styles.section}>
          <h3>معلومات الأسرة</h3>
          <div className={styles.infoGrid}>
            <p><strong>عدد أفراد الأسرة:</strong> {data.family_numbers}</p>
            <p><strong>ترتيب الطالب:</strong> {data.arrange_of_brothers}</p>
            <p><strong>حالة الأب:</strong> {data.father_status}</p>
            <p><strong>حالة الأم:</strong> {data.mother_status}</p>
          </div>
        </section>

        {/* ====== الدخل ====== */}
        <section className={styles.section}>
          <h3>المعلومات المالية</h3>
          <div className={styles.infoGrid}>
            <p><strong>دخل الأب:</strong> {data.father_income}</p>
            <p><strong>دخل الأم:</strong> {data.mother_income}</p>
            <p><strong>إجمالي الدخل:</strong> {data.total_income}</p>
          </div>
        </section>

        {/* ====== السكن والاتصال ====== */}
        <section className={styles.section}>
          <h3>معلومات الاتصال والسكن</h3>
          <div className={styles.infoGrid}>
            <p><strong>هاتف الأم:</strong> {data.m_phone_num}</p>
            <p><strong>هاتف الأب:</strong> {data.f_phone_num}</p>
            <p><strong>السكن:</strong> {data.housing_status}</p>
            <p><strong>العنوان:</strong> {data.address}</p>
          </div>
        </section>

        {/* ====== إضافي ====== */}
        <section className={styles.section}>
          <h3>معلومات إضافية</h3>
          <div className={styles.infoGrid}>
            <p><strong>ذوي الهمم:</strong> {data.disabilities}</p>
            <p><strong>السبب:</strong> {data.reason}</p>
          </div>
        </section>

  {/* ====== المستندات ====== */}
<section className={styles.section}>
  <h3>المستندات المرفوعة</h3>

  {docs.length === 0 ? (
    <p>لا توجد مستندات.</p>
  ) : (
    <div className={styles.docsContainer}>
      {docs.map((doc) => (
        <div key={doc.doc_id} className={styles.docCard}>
          <p><strong>{doc.doc_type}</strong></p>

         
          <a href={doc.file_url} rel="noopener noreferrer">
            افتح الملف
          </a>

          <p className={styles.uploadDate}>
            تم الرفع: {doc.uploaded_at.slice(0, 10)}
          </p>
        </div>
      ))}
    </div>
  )}
</section>


        {/* ====== الأزرار ====== */}
        <div className={styles.actions}>
          {data.req_status === "مقبول" ? (
            <button className={styles.rejectBtn} onClick={handleReject}>
              رفض الطالب
            </button>
          ) : (
            <>
              <button className={styles.approveBtn} onClick={handleApprove}>
                قبول الطالب
              </button>
              <button className={styles.rejectBtn} onClick={handleReject}>
                رفض الطالب
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
