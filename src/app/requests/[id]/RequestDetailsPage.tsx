"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./RequestDetails.module.css";

export default function RequestDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [status, setStatus] = useState("pending");

  const handleApprove = () => {
    if (status === "pending") setStatus("partial");
    else if (status === "partial") setStatus("final");
  };

  const handleReject = () => setStatus("rejected");

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>تفاصيل طلب الطالب</h2>

      <div className={styles.infoBox}>
        <p><strong>رقم الطلب:</strong> {id}</p>
        <p><strong>اسم الطالب:</strong> أحمد محمد</p>
        <p><strong>الكلية:</strong> كلية الهندسة</p>
        <p><strong>الرقم الجامعي:</strong> 123456</p>
        <p><strong>تاريخ التقديم:</strong> 2025-10-20</p>
        <p><strong>المبلغ المطلوب:</strong> 2000 جنيه</p>
        <p>
          <strong>الحالة الحالية:</strong>{" "}
          {status === "pending" && "قيد المراجعة"}
          {status === "partial" && "موافقة مبدئية"}
          {status === "final" && "موافقة نهائية"}
          {status === "rejected" && "مرفوض"}
        </p>
      </div>

      <div className={styles.actions}>
        {status !== "rejected" && status !== "final" && (
          <button onClick={handleApprove} className={styles.btnApprove}>
            {status === "pending" ? "موافقة مبدئية" : "موافقة نهائية"}
          </button>
        )}
        {status !== "final" && (
          <button onClick={handleReject} className={styles.btnReject}>
            رفض
          </button>
        )}
      </div>

      {status === "final" && (
        <div className={styles.btnReceived}>✅ تم الاستلام</div>
      )}

      <button onClick={() => router.back()} className={styles.btnBack}>
         رجوع
      </button>
    </div>
  );
}
