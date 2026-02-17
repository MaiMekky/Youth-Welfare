"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "../styles/PlansPage.module.css";
import { X, Save } from "lucide-react";

type FormState = { title: string; year: string };
type FormErrors = Partial<Record<keyof FormState, string>>;

export default function CreatePlanModal({
  open,
  onClose,
  onSubmitPlan,
}: {
  open: boolean;
  onClose: () => void;
  onSubmitPlan: (payload: { title: string; year: string }) => void;
}) {
  const years = useMemo(() => {
    const y = new Date().getFullYear();
    return [String(y - 1), String(y), String(y + 1), String(y + 2)];
  }, []);

  const [form, setForm] = useState<FormState>({ title: "", year: "" });
  const [errors, setErrors] = useState<FormErrors>({});

  const reset = () => {
    setForm({ title: "", year: "" });
    setErrors({});
  };

  const closeAndReset = () => {
    reset();
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAndReset();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  // ✅ لو اتقفل المودال من برا (parent) صفّري الداتا برضو
  useEffect(() => {
    if (!open) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!form.title.trim()) next.title = "عنوان الخطة مطلوب";
    if (!form.year) next.year = "اختاري العام";
    return next;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmitPlan({ title: form.title.trim(), year: form.year });
    reset();
    onClose();
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay} onMouseDown={closeAndReset}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeadText}>
            <h2 className={styles.modalTitle}>إنشاء خطة جديدة</h2>
            <p className={styles.modalSubtitle}>قم بملء البيانات الأساسية للخطة</p>
          </div>

          <button className={styles.modalClose} type="button" onClick={closeAndReset}>
            <X size={18} />
          </button>
        </div>

        <form className={styles.modalBody} onSubmit={submit} noValidate>
          <div className={styles.modalGrid2}>
            <div className={styles.field}>
              <label className={styles.label}>عنوان الخطة</label>
              <input
                className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
                placeholder="مثال: خطة الأنشطة الثقافية"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
              />
              {errors.title && <div className={styles.errorText}>{errors.title}</div>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>العام</label>
              <select
                className={`${styles.select} ${errors.year ? styles.inputError : ""}`}
                value={form.year}
                onChange={(e) => setField("year", e.target.value)}
              >
                <option value="">اختر العام</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              {errors.year && <div className={styles.errorText}>{errors.year}</div>}
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={closeAndReset}>
              إلغاء
            </button>

            <button type="submit" className={styles.saveBtn}>
              <Save size={18} />
              حفظ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
