"use client";

import React, { useState } from "react";
import styles from "../styles/famRequests.module.css";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";

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

  const { showToast } = useToast();

  // ====== Approve ======
  const handleApprove = async () => {
   if (!minMembers || Number(minMembers) <= 0) {
    showToast("❌ يجب إدخال الحد الأدنى للأعضاء", "error");
    return;
  }

  // ← add this
  if (Number(minMembers) < 0) {
    showToast("❌ الحد الأدنى للأعضاء لا يمكن أن يكون رقماً سالباً", "error");
    return;
  }

  if (!closeDate) {
    showToast("❌ يجب إدخال تاريخ إغلاق التسجيل", "error");
    return;
  }

  // ← add this
  const today = new Date().toISOString().split("T")[0];
  if (closeDate < today) {
    showToast("❌ تاريخ إغلاق التسجيل لا يمكن أن يكون في الماضي", "error");
    return;
  }

    try {
      setLoading(true);

      const res = await authFetch(
        `${getBaseUrl()}/api/family/faculty/${request.family_id}/pre-approve/`,
        {
          method: "POST",
          headers: {
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
      showToast("✅ تم اعتماد طلب إنشاء الأسرة بنجاح", "success");
    } catch (error) {
      console.error(error);
      showToast("❌ فشل اعتماد الطلب", "error");
    } finally {
      setLoading(false);
    }
  };

  // ====== Reject ======
  const handleReject = async () => {
    try {
      setLoading(true);

      const res = await authFetch(
        `${getBaseUrl()}/api/family/faculty/${request.family_id}/reject/`,
        {
          method: "POST",
        }
      );

      if (!res.ok) throw new Error("Reject failed");

      setStatus("مرفوض"); 
      showToast("❌ تم رفض طلب إنشاء الأسرة", "error");
    } catch (error) {
      console.error(error);
      showToast("❌ فشل رفض الطلب", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.requestCard}>
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
              min={1}   
              value={minMembers}
              onChange={(e) => setMinMembers(e.target.value)}
            />
          </div>

          <div className={styles.inputBox}>
            <label>تعيين تاريخ إغلاق التسجيل</label>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]} 
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

