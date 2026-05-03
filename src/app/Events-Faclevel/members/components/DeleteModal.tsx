import React, { useState } from "react";
import styles from "../styles/Modal.module.css";
import { Trash2, X } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import type { Member } from "../page";
import { apiFetch } from "../page";

type Props = {
  member: Member;
  onClose: () => void;
  onDone: () => void;
};

export default function DeleteModal({ member, onClose, onDone }: Props) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const res = await apiFetch(
      `/api/faculty/remove_member/?member_id=${member.scout_member_id}`,
      { method: "DELETE" }
    );
    setLoading(false);
    if (!res.ok) { showToast((res as any).message || "حدث خطأ، يرجى المحاولة مجدداً", "error"); return; }
    showToast("تم حذف العضو بنجاح", "success");
    onDone();
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} style={{ maxWidth: 420 }}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleWrap}>
            <div className={`${styles.modalIcon} ${styles.iconRed}`}><Trash2 size={20} /></div>
            <h2 className={styles.modalTitle}>حذف العضو</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ marginBottom: 22, textAlign: "right" }}>
          <p style={{ margin: "0 0 8px", fontSize: 15, color: "#334155", fontWeight: 600 }}>
            هل أنت متأكد من حذف العضو:
          </p>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 900, color: "#DC2626" }}>
            {member.student_name}
          </p>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "#9CA3AF" }}>
            لا يمكن التراجع عن هذا الإجراء.
          </p>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnDanger} onClick={handleDelete} disabled={loading}>
            {loading ? "جاري الحذف..." : "حذف"}
          </button>
          <button className={styles.btnGhost} onClick={onClose}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}