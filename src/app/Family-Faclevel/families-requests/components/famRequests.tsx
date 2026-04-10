"use client";

import React, { useState } from "react";
import styles from "../styles/famRequests.module.css";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";

type Status = "منتظر" | "موافقة مبدئية" | "مرفوض";

const FamRequests = ({ request }: { request: Record<string, unknown> }) => {
  const [minMembers, setMinMembers] = useState(
    request.min_limit?.toString() || ""
  );
  const [closeDate, setCloseDate] = useState("");
  const [loading, setLoading] = useState(false);

  
  const [status, setStatus] = useState<Status>(
    (request.status as Status) || "منتظر"
  );

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2500);
  };

  // ====== Approve ======
  const handleApprove = async () => {
    if (!minMembers || Number(minMembers) <= 0) {
      showNotification("❌ يجب إدخال الحد الأدنى للأعضاء", "error");
      return;
    }

    if (!closeDate) {
      showNotification("❌ يجب إدخال تاريخ إغلاق التسجيل", "error");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("access");

      const res = await authFetch(
        `${getBaseUrl()}/api/family/faculty/${request.family_id}/pre-approve/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            min_limit: Number(minMembers),
            closing_date: closeDate,
          }),
        }
      );

      if (!res.ok) throw new Error("Approve failed");

      setStatus("موافقة مبدئية"); 
      showNotification("✅ تم اعتماد طلب إنشاء الأسرة بنجاح", "success");
    } catch (error) {
      console.error(error);
      showNotification("❌ فشل اعتماد الطلب", "error");
    } finally {
      setLoading(false);
    }
  };

  // ====== Reject ======
  const handleReject = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access");

      const res = await authFetch(
        `${getBaseUrl()}/api/family/faculty/${request.family_id}/reject/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Reject failed");

      setStatus("مرفوض"); 
      showNotification("❌ تم رفض طلب إنشاء الأسرة", "error");
    } catch (error) {
      console.error(error);
      showNotification("❌ فشل رفض الطلب", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.requestCard}>
      {/* ===== Notification ===== */}
      {notification && (
        <div
          className={`${styles.notification} ${
            notification.type === "success"
              ? styles.success
              : styles.error
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* ===== Header ===== */}
      <div className={styles.cardHeader}>
        <div className={styles.titleRow}>
          <h2 className={styles.familyName}>{request.name as string}</h2>

          <span className={styles.creationBadge}>طلب إنشاء</span>

          {status === "منتظر" && (
            <span className={styles.waitingBadge}>في الانتظار</span>
          )}

          {status === "موافقة مبدئية" && (
            <span className={styles.approvedBadge}>✔ تمت الموافقة</span>
          )}

          {status === "مرفوض" && (
            <span className={styles.rejectedBadge}>✖ مرفوض</span>
          )}
        </div>
      </div>

      {/* ===== Info ===== */}
      <div className={styles.infoGrid}>
        <div>
          <span className={styles.label}>الفئة:</span>
          <span>{request.type as string}</span>
        </div>

        <div>
          <span className={styles.label}>الكلية:</span>
          <span>{request.faculty_name as string}</span>
        </div>

        <div>
          <span className={styles.label}>رئيس الأسرة:</span>
          <span>{request.president_name as string}</span>
        </div>

        <div>
          <span className={styles.label}>نائب الرئيس:</span>
          <span>{request.vice_president_name as string}</span>
        </div>

        <div>
          <span className={styles.label}>عدد الأعضاء الحالي:</span>
          <span>{request.member_count as string}</span>
        </div>

        <div>
          <span className={styles.label}>تاريخ التقديم:</span>
          <span>
            {new Date(request.created_at as string).toLocaleDateString("ar-EG")}
          </span>
        </div>

        <div>
          <span className={styles.label}>وصف الأسرة:</span>
          <span className={styles.description}>
            {request.description as string}
          </span>
        </div>
      </div>

      {/* ===== Inputs (تظهر فقط في pending) ===== */}
      {status === "منتظر" && (
        <>
          <div className={styles.inputBox}>
            <label>تعيين عدد الأعضاء الأدنى</label>
            <input
              type="number"
              placeholder="مثال: 10"
              value={minMembers}
              onChange={(e) => setMinMembers(e.target.value)}
            />
          </div>

          <div className={styles.inputBox}>
            <label>تعيين تاريخ إغلاق التسجيل</label>
            <input
              type="date"
              value={closeDate}
              onChange={(e) => setCloseDate(e.target.value)}
            />
          </div>
        </>
      )}

      {/* ===== Actions (تختفي بعد القرار) ===== */}
      {status === "منتظر" && (
        <div className={styles.cardActions}>
          <button
            className={styles.rejectBtn}
            onClick={handleReject}
            disabled={loading}
          >
            ✕ رفض الطلب
          </button>

          <button
            className={styles.approveBtn}
            onClick={handleApprove}
            disabled={loading}
          >
            ✓ موافقة على الإنشاء
          </button>
        </div>
      )}
    </div>
  );
};

export default FamRequests;

