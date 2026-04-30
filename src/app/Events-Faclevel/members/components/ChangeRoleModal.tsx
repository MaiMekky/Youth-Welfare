import React, { useState } from "react";
import styles from "../styles/Modal.module.css";
import { RefreshCcw, X, AlertTriangle } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import type { Member } from "../page";
import { apiFetch, ROLES } from "../page";

type Props = {
  member: Member;
  onClose: () => void;
  onDone: () => void;
};

export default function ChangeRoleModal({ member, onClose, onDone }: Props) {
  const { showToast } = useToast();
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    if (!role) { setErrors({ role: "يرجى اختيار دور" }); return; }
    setLoading(true);
    const res = await apiFetch(
      `/api/faculty/change_role/?member_id=${member.scout_member_id}&role=${encodeURIComponent(role)}`,
      { method: "POST" }
    );
    setLoading(false);
    if (!res.ok) { showToast((res as any).message || "حدث خطأ، يرجى المحاولة مجدداً", "error"); return; }
    showToast("تم تغيير دور العضو بنجاح", "success");
    onDone();
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleWrap}>
            <div className={`${styles.modalIcon} ${styles.iconPurple}`}><RefreshCcw size={20} /></div>
            <h2 className={styles.modalTitle}>تغيير دور العضو</h2>
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

        <div className={styles.alert}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>تنبيه: بعض الأدوار تتطلب توزيع العضو على رهط أولاً</span>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>اختر الدور الجديد *</label>
          <select
            className={`${styles.select} ${errors.role ? styles.inputError : ""}`}
            value={role}
            onChange={(e) => { setRole(e.target.value); setErrors({}); }}
          >
            <option value="">-- اختر الدور --</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {errors.role && <p className={styles.errorMsg}>{errors.role}</p>}
        </div>

        {member.role && (
          <p style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 600, marginBottom: 4 }}>
            الدور الحالي: <strong style={{ color: "#6D28D9" }}>{member.role}</strong>
          </p>
        )}

        <div className={styles.modalFooter}>
          <button className={styles.btnPrimary} onClick={handleSubmit} disabled={loading}>
            {loading ? "جاري الحفظ..." : "حفظ"}
          </button>
          <button className={styles.btnGhost} onClick={onClose}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}