"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./studentDetails.module.css";

export default function StudentDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [status, setStatus] = useState("موافقة مبدئية");

  // ✅ إضافة حالة الإشعار
  const [notification, setNotification] = useState<{ message: string; type: string } | null>(null);

  const showNotification = (message: string, type: string) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2500); // يختفي بعد 2.5 ثانية
  };

  const handleApprove = () => {
    setStatus("موافقة نهائية");
    showNotification("✅ تمت الموافقة النهائية على الطالب", "success");
  };

  const handleReject = () => {
    setStatus("مرفوض");
    showNotification("❌ تم رفض الطالب", "error");
  };

  const showDualButtons =
    status === "موافقة مبدئية" || status === "مرفوض" || status === "تم الاستلام";

  return (
    <div className={styles.container}>
      {/* ✅ الإشعار */}
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
        {/* 🔹 زر العودة فوق شمال الكارت */}
        <button className={styles.backBtn} onClick={() => router.back()}>
          ← العودة إلى قائمة الطلاب
        </button>

        {/* 🔹 العنوان في النص */}
        <h2 className={styles.pageTitle}>تفاصيل الطالب</h2>

        {/* ===== المعلومات ===== */}
        <section className={styles.section}>
          <h3>المعلومات الأساسية</h3>
          <div className={styles.infoGrid}>
            <p><strong>رقم التضامن:</strong> SOL001</p>
            <p><strong>اسم الطالب:</strong> أحمد محمد علي</p>
            <p><strong>الرقم الجامعي:</strong> STU2024001</p>
            <p><strong>الرقم القومي:</strong> 29812151201234</p>
            <p><strong>الكلية:</strong> كلية الهندسة</p>
            <p><strong>التقدير:</strong> امتياز</p>
            <p><strong>الحالة الأكاديمية:</strong> مقيد</p>
            <p><strong>تاريخ الإنشاء:</strong> 2024-01-15</p>
          </div>
        </section>

        <section className={styles.section}>
          <h3>معلومات الموافقة</h3>
          <div className={styles.infoGrid}>
            <p><strong>رقم الطلب:</strong> SOL001</p>
            <p><strong>حالة الطلب:</strong> {status}</p>
            <p><strong>تمت المراجعة بواسطة:</strong> المشرف/ سارة أحمد</p>
            <p><strong>تاريخ الموافقة:</strong> 2024-01-20</p>
          </div>
        </section>

        <section className={styles.section}>
          <h3>معلومات الأسرة</h3>
          <div className={styles.infoGrid}>
            <p><strong>عدد أفراد الأسرة:</strong> 6 أفراد</p>
            <p><strong>ترتيب الطالب بين إخوته:</strong> الثالث</p>
            <p><strong>حالة الأب:</strong> على قيد الحياة</p>
            <p><strong>حالة الأم:</strong> متوفاة</p>
          </div>
        </section>

        <section className={styles.section}>
          <h3>المعلومات المالية</h3>
          <div className={styles.infoGrid}>
            <p><strong>دخل الأب:</strong> 2500 ج</p>
            <p><strong>دخل الأم:</strong> 0 ج</p>
            <p><strong>إجمالي الدخل:</strong> 2500 ج</p>
          </div>
        </section>

        <section className={styles.section}>
          <h3>معلومات الاتصال والسكن</h3>
          <div className={styles.infoGrid}>
            <p><strong>هاتف الأم:</strong> +201234567890</p>
            <p><strong>هاتف الأب:</strong> +201234567891</p>
            <p><strong>حالة السكن:</strong> إيجار</p>
            <p><strong>العنوان:</strong> 123 شارع الرئيسي - القاهرة</p>
          </div>
        </section>

        <section className={styles.section}>
          <h3>معلومات إضافية</h3>
          <div className={styles.infoGrid}>
            <p><strong>سبب الدعم:</strong> ضعف الدخل الأسري ووفاة الأم</p>
            <p><strong>ذوي الهمم:</strong> لا يوجد</p>
          </div>
        </section>

        <section className={styles.section}>
          <h3>المستندات</h3>
          <ul className={styles.docsList}>
            <li><a href="#">شهادة الدخل.pdf</a></li>
            <li><a href="#">شهادة الوفاة.pdf</a></li>
          </ul>
        </section>

        {/* ===== الأزرار ===== */}
        <div className={styles.actions}>
          {status === "موافقة نهائية" ? (
            <button className={styles.rejectBtn} onClick={handleReject}>
              رفض الطالب
            </button>
          ) : showDualButtons ? (
            <>
              <button className={styles.approveBtn} onClick={handleApprove}>
                موافقة نهائية
              </button>
              <button className={styles.rejectBtn} onClick={handleReject}>
                رفض الطالب
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
