import React, { useState, useEffect } from "react";
import modalStyles from "../../members/styles/Modal.module.css";
import { FolderTree, X } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { apiFetch } from "../page";
import type { Group } from "../page";

type Props =
  | { mode: "create"; group?: undefined; onClose: () => void; onDone: () => void }
  | { mode: "edit";   group: Group;      onClose: () => void; onDone: () => void };

export default function GroupFormModal({ mode, group, onClose, onDone }: Props) {
  const { showToast } = useToast();
  const originalName = mode === "edit" ? group.name : "";
  const [name, setName] = useState(originalName);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // true only when the user has actually typed something different from the original
  const isDirty = name.trim() !== originalName.trim() || (mode === "create" && name.trim() !== "");

  useEffect(() => {
    if (mode === "edit") setName(group.name);
  }, [mode, group]);

  const handleClose = () => {
    if (isDirty) {
      showToast("برجاء الحفظ أو إلغاء التعديل", "warning");
      return;
    }
    onClose();
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) {
      e.name = "يرجى إدخال اسم الرهط";
    } else if (name.trim().length < 2) {
      e.name = "يجب أن يكون الاسم حرفين على الأقل";
    } else if (name.trim().length > 60) {
      e.name = "الاسم طويل جداً (60 حرف كحد أقصى)";
    }
    return e;
  };

  const handleSubmit = async () => {
    // In edit mode, block submit if nothing changed
    if (mode === "edit" && name.trim() === originalName.trim()) {
      showToast("لم يتم إجراء أي تعديل", "warning");
      return;
    }

    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);

    let res;
    if (mode === "create") {
      res = await apiFetch("/api/faculty/create_group/", {
        method: "POST",
        body: JSON.stringify({ name: name.trim() }),
      });
    } else {
      res = await apiFetch(
        `/api/faculty/update_group/?group_id=${group.group_id}&name=${encodeURIComponent(name.trim())}`,
        { method: "PUT" }
      );
    }

    setLoading(false);

    if (!res.ok) {
      showToast((res as any).message || "حدث خطأ، يرجى المحاولة مجدداً", "error");
      return;
    }

    showToast(
      mode === "create" ? "تم إنشاء الرهط بنجاح" : "تم تحديث الرهط بنجاح",
      "success"
    );
    onDone();
  };

  return (
    <div
      className={modalStyles.overlay}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className={modalStyles.modal} style={{ maxWidth: 440 }}>
        <div className={modalStyles.modalHeader}>
          <div className={modalStyles.modalTitleWrap}>
            <div className={`${modalStyles.modalIcon} ${modalStyles.iconBlue}`}>
              <FolderTree size={20} />
            </div>
            <h2 className={modalStyles.modalTitle}>
              {mode === "create" ? "إنشاء رهط جديد" : "تعديل الرهط"}
            </h2>
          </div>
          <button className={modalStyles.closeBtn} onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        <hr className={modalStyles.divider} />

        <div className={modalStyles.fieldGroup}>
          <label className={modalStyles.label}>اسم الرهط *</label>
          <input
            className={`${modalStyles.input} ${errors.name ? modalStyles.inputError : ""}`}
            type="text"
            placeholder="مثال: رهط الفجر"
            value={name}
            maxLength={60}
            onChange={(e) => { setName(e.target.value); setErrors({}); }}
            autoFocus
          />
          {errors.name
            ? <p className={modalStyles.errorMsg}>{errors.name}</p>
            : <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4, fontWeight: 500 }}>
                {name.trim().length} / 60 حرف
              </p>
          }
        </div>

        <div className={modalStyles.modalFooter}>
          <button
            className={modalStyles.btnPrimary}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? (mode === "create" ? "جاري الإنشاء..." : "جاري الحفظ...")
              : (mode === "create" ? "إنشاء" : "حفظ التعديلات")}
          </button>
          <button
            className={modalStyles.btnGhost}
            onClick={() => { setName(originalName); onClose(); }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}