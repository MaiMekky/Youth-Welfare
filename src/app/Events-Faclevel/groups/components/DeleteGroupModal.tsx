import React, { useState } from "react";
import modalStyles from "../../members/styles/Modal.module.css";
import { Trash2, X } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { apiFetch } from "../page";
import type { Group } from "../page";

type Props = {
  group: Group;
  onClose: () => void;
  onDone: () => void;
};

export default function DeleteGroupModal({ group, onClose, onDone }: Props) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const res = await apiFetch(
      `/api/faculty/delete_group/?group_id=${group.group_id}`,
      { method: "DELETE" }
    );
    setLoading(false);

    if (!res.ok) {
      showToast((res as any).message || "حدث خطأ، يرجى المحاولة مجدداً", "error");
      return;
    }
    showToast("تم حذف الرهط بنجاح", "success");
    onDone();
  };

  return (
    <div
      className={modalStyles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={modalStyles.modal} style={{ maxWidth: 420 }}>
        <div className={modalStyles.modalHeader}>
          <div className={modalStyles.modalTitleWrap}>
            <div className={`${modalStyles.modalIcon} ${modalStyles.iconRed}`}>
              <Trash2 size={20} />
            </div>
            <h2 className={modalStyles.modalTitle}>حذف الرهط</h2>
          </div>
          <button className={modalStyles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ marginBottom: 22, textAlign: "right" }}>
          <p style={{ margin: "0 0 8px", fontSize: 15, color: "#334155", fontWeight: 600 }}>
            هل أنت متأكد من حذف الرهط:
          </p>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#DC2626" }}>
            {group.name}
          </p>
          {(group.member_count ?? 0) > 0 && (
            <div className={modalStyles.alert} style={{ marginTop: 14 }}>
              <span>⚠️</span>
              <span>
                يحتوي هذا الرهط على {group.member_count} عضو. سيتم إلغاء توزيعهم عند الحذف.
              </span>
            </div>
          )}
          <p style={{ margin: "10px 0 0", fontSize: 13, color: "#9CA3AF" }}>
            لا يمكن التراجع عن هذا الإجراء.
          </p>
        </div>

        <div className={modalStyles.modalFooter}>
          <button
            className={modalStyles.btnDanger}
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "جاري الحذف..." : "حذف"}
          </button>
          <button className={modalStyles.btnGhost} onClick={onClose}>
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
