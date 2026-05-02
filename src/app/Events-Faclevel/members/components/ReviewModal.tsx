import React, { useState } from "react";
import styles from "../styles/Modal.module.css";
import { Eye, X, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import type { Member } from "../page";
import { apiFetch } from "../page";

type Props = {
  member: Member;
  onClose: () => void;
  onDone: () => void;
};

export default function ReviewModal({ member, onClose, onDone }: Props) {
  const { showToast } = useToast();
  const [action, setAction] = useState<"قبول" | "رفض" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!action) e.action = "يرجى اختيار إجراء";
    if (action === "رفض" && !rejectionReason.trim()) e.reason = "يرجى إدخال سبب الرفض";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    const params = new URLSearchParams({ action: action!, member_id: String(member.scout_member_id) });
    if (action === "رفض") params.set("rejection_reason", rejectionReason.trim());

    const res = await apiFetch(`/api/faculty/review_member/?${params.toString()}`, { method: "POST" });
    setLoading(false);

    if (!res.ok) {
      showToast((res as any).message || "حدث خطأ، يرجى المحاولة مجدداً", "error");
      return;
    }
    showToast(action === "قبول" ? "تم قبول العضو بنجاح" : "تم رفض العضو", "success");
    onDone();
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleWrap}>
            <div className={`${styles.modalIcon} ${styles.iconBlue}`}><Eye size={20} /></div>
            <h2 className={styles.modalTitle}>مراجعة طلب العضو</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        <div className={styles.studentNameBanner}>
          <div>
            <span className={styles.studentLabel}>الطالب</span>
            <span className={styles.studentName}>{member.student_name}</span>
          </div>
        </div>

        <hr className={styles.divider} />

        <p className={styles.label}>اختر الإجراء</p>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <button
            onClick={() => { setAction("قبول"); setErrors({}); }}
            style={{
              flex: 1, padding: "11px 0", borderRadius: 10, border: "2px solid",
              fontFamily: "'Cairo', sans-serif", fontSize: 14, fontWeight: 800, cursor: "pointer",
              background: action === "قبول" ? "#059669" : "#ECFDF5",
              color: action === "قبول" ? "#fff" : "#065F46",
              borderColor: action === "قبول" ? "#059669" : "#A7F3D0",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 150ms",
            }}
          >
            <CheckCircle size={16} /> قبول
          </button>
          <button
            onClick={() => { setAction("رفض"); setErrors({}); }}
            style={{
              flex: 1, padding: "11px 0", borderRadius: 10, border: "2px solid",
              fontFamily: "'Cairo', sans-serif", fontSize: 14, fontWeight: 800, cursor: "pointer",
              background: action === "رفض" ? "#DC2626" : "#FEF2F2",
              color: action === "رفض" ? "#fff" : "#991B1B",
              borderColor: action === "رفض" ? "#DC2626" : "#FECACA",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 150ms",
            }}
          >
            <XCircle size={16} /> رفض
          </button>
        </div>
        {errors.action && <p className={styles.errorMsg}>{errors.action}</p>}

        {action === "رفض" && (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>سبب الرفض *</label>
            <textarea
              className={`${styles.textarea} ${errors.reason ? styles.inputError : ""}`}
              placeholder="اكتب سبب الرفض هنا..."
              value={rejectionReason}
              onChange={(e) => { setRejectionReason(e.target.value); setErrors({}); }}
            />
            {errors.reason && <p className={styles.errorMsg}>{errors.reason}</p>}
          </div>
        )}

        <div className={styles.modalFooter}>
          <button
            className={action === "قبول" ? styles.btnSuccess : action === "رفض" ? styles.btnDanger : styles.btnPrimary}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "جاري الحفظ..." : "تأكيد"}
          </button>
          <button className={styles.btnGhost} onClick={onClose}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}