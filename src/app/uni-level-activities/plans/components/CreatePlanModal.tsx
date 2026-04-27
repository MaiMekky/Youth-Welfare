"use client";

import React, { useEffect, useState, useCallback } from "react";
import styles from "../styles/PlansPage.module.css";
import { X, Save } from "lucide-react";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";
const API_URL = `${getBaseUrl()}/api`;

type InitialPlan = { id: number; name: string; term: number; dept_id?: number } | null;

type FormState = { name: string; term: number; dept_id: number };
type FormErrors = Partial<Record<keyof FormState, string>>;

export default function CreatePlanModal({
  open,
  onClose,
  initialPlan,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initialPlan: InitialPlan;
  onSaved: () => void;
}) {
  const { showToast } = useToast();
  const isEdit = !!initialPlan;

  const [form, setForm] = useState<FormState>({ name: "", term: 1, dept_id: 0 });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const [departments, setDepartments] = useState<Record<string, unknown>[]>([]);
// Add near other useState declarations
  const [originalForm, setOriginalForm] = useState<FormState | null>(null);
  const closeAndReset = useCallback(() => {
    setForm({ name: "", term: 1, dept_id: 0 });
    setErrors({});
    setSaving(false);
    onClose();
  }, [onClose]);

  /* ===================== GET DEPARTMENTS FROM TOKEN ===================== */
  useEffect(() => {
    const stored = localStorage.getItem("departments");
    if (stored) {
      try {
        setDepartments(JSON.parse(stored));
      } catch {}
    }
  }, []);

  useEffect(() => {
  if (!open) return;

  if (initialPlan) {
    const loaded: FormState = {
      name: initialPlan.name ?? "",
      term: initialPlan.term ?? 1,
      dept_id: initialPlan.dept_id ?? 0,
    };
    setForm(loaded);
    setOriginalForm(loaded);   // ← save original
  } else {
    setForm({ name: "", term: 1, dept_id: 0 });
    setOriginalForm(null);
  }
  setErrors({});
}, [open, initialPlan]);

  // ESC
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAndReset();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeAndReset]);

  // lock scroll
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "visible";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = "اسم الخطة مطلوب";
    if (!Number.isFinite(form.term) || form.term < 1) next.term = "اختار الترم";
    if (!form.dept_id) next.dept_id = "اختار القسم";
    return next;
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
    showToast("❌ برجاء استكمال الحقول المطلوبة", "error");
      return;
    }
    
      if (isEdit && originalForm) {
    const unchanged = JSON.stringify(form) === JSON.stringify(originalForm);
    if (unchanged) {
      showToast("برجاء التعديل أو إلغاء التعديل", "warning");
      return;
    }
  }
    try {
      setSaving(true);


      const payload = {
        name: form.name.trim(),
        term: Number(form.term),
        dept_id: Number(form.dept_id),
      };

      const url = isEdit
        ? `${API_URL}/events/plans/${initialPlan!.id}/update/`
        : `${API_URL}/events/plans/create/`;

      const method = isEdit ? "PATCH" : "POST";

      const res = await authFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      if (!res.ok) {
        let msg = `فشل الحفظ (Status ${res.status})`;
        try {
          const j = text ? JSON.parse(text) : null;
          msg = j?.detail || j?.error || j?.message || msg;

          if (j?.name?.[0]) setErrors((p) => ({ ...p, name: String(j.name[0]) }));
          if (j?.term?.[0]) setErrors((p) => ({ ...p, term: String(j.term[0]) }));
          if (j?.dept_id?.[0]) setErrors((p) => ({ ...p, dept_id: String(j.dept_id[0]) }));
        } catch {}
        showToast(`❌ ${String(msg)}`, "error");
        return;
      }

      showToast("✅ تم حفظ الخطة بنجاح", "success");

      onSaved();
      closeAndReset();
    } catch (err) {
      console.error(err);
      showToast("❌ حصل خطأ أثناء الحفظ", "error");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className={styles.modalOverlay} onMouseDown={closeAndReset}>
        <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <div className={styles.modalHeadText}>
              <h2 className={styles.modalTitle}>{isEdit ? "تعديل الخطة" : "إنشاء خطة جديدة"}</h2>
              <p className={styles.modalSubtitle}>
                {isEdit ? "قم بتحديث الاسم أو الترم ثم احفظي" : "قم بملء البيانات الأساسية للخطة"}
              </p>
            </div>

            <button className={styles.modalClose} type="button" onClick={closeAndReset} disabled={saving}>
              <X size={18} />
            </button>
          </div>

          <form className={styles.modalBody} onSubmit={submit} noValidate>
            <div className={styles.modalGrid2}>
              <div className={styles.field}>
                <label className={styles.label}>اسم الخطة</label>
                <input
                  className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                  placeholder="مثال: خطة الأنشطة الثقافية"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                />
                {errors.name && <div className={styles.errorText}>{errors.name}</div>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>الترم</label>
                <select
                  className={`${styles.select} ${errors.term ? styles.inputError : ""}`}
                  value={String(form.term)}
                  onChange={(e) => setField("term", Number(e.target.value))}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                </select>
                {errors.term && <div className={styles.errorText}>{errors.term}</div>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>القسم</label>
                <select
                  className={`${styles.select} ${errors.dept_id ? styles.inputError : ""}`}
                  value={String(form.dept_id)}
                  onChange={(e) => setField("dept_id", Number(e.target.value))}
                >
                  <option value="0" hidden>اختار القسم</option>
                  {departments.map((d) => (
                    <option key={String(d.dept_id)} value={String(d.dept_id)}>
                      {String(d.dept_name)}
                    </option>
                  ))}
                </select>
                {errors.dept_id && <div className={styles.errorText}>{errors.dept_id}</div>}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.cancelBtn} onClick={closeAndReset} disabled={saving}>
                إلغاء
              </button>

              <button type="submit" className={styles.saveBtn} disabled={saving}>
                <Save size={18} />
                {saving ? "جارٍ الحفظ..." : "حفظ"}
              </button>
            </div>
          </form>
        </div>
      </div>
  
  );
}