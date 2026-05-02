import React, { useState } from "react";
import styles from "../styles/Modal.module.css";
import { UserPlus, X } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { apiFetch } from "../page";

type Props = {
  onClose: () => void;
  onDone: () => void;
};

export default function AddMemberModal({ onClose, onDone }: Props) {
  const { showToast } = useToast();
  const [nid, setNid] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!nid.trim()) {
      e.nid = "يرجى إدخال الرقم القومي";
    } else if (!/^\d{10,14}$/.test(nid.trim())) {
      e.nid = "الرقم القومي غير صحيح (يجب أن يتكون من 10 إلى 14 رقمًا)";
    }
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    const res = await apiFetch(
      `/api/faculty/add_by_nid/?nid=${nid.trim()}`,
      { method: "POST" }
    );
    setLoading(false);

    if (!res.ok) { showToast((res as any).message || "حدث خطأ، يرجى المحاولة مجدداً", "error"); return; }
    showToast("تم إضافة العضو بنجاح", "success");
    onDone();
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} style={{ maxWidth: 440 }}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleWrap}>
            <div className={`${styles.modalIcon} ${styles.iconGold}`}><UserPlus size={20} /></div>
            <h2 className={styles.modalTitle}>إضافة عضو جديد</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        <hr className={styles.divider} />

        <div className={styles.fieldGroup}>
          <label className={styles.label}>الرقم القومي للطالب *</label>
          <input
            className={`${styles.input} ${errors.nid ? styles.inputError : ""}`}
            type="text"
            inputMode="numeric"
            placeholder="أدخل الرقم القومي..."
            value={nid}
            maxLength={14}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "");
              setNid(v);
              setErrors({});
            }}
            style={{ direction: "ltr", textAlign: "right" }}
          />
          {errors.nid && <p className={styles.errorMsg}>{errors.nid}</p>}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnGold} onClick={handleSubmit} disabled={loading}>
            {loading ? "جاري الإضافة..." : "إضافة"}
          </button>
          <button className={styles.btnGhost} onClick={onClose}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}