"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import styles from "../styles/PlansPage.module.css";
import { X, Save } from "lucide-react";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";

const API_URL = `${getBaseUrl()}/api`;

type InitialPlan = { id: number; name: string; term: number; dept?: number } | null;

type FormState = { name: string; term: number; dept: number };
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
  const isEdit = !!initialPlan;
  const { showToast } = useToast();

  const [form, setForm] = useState<FormState>({ name: "", term: 1, dept: 0 });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const [departments, setDepartments] = useState<Record<string, unknown>[]>([]);
  const originalForm = useRef<FormState | null>(null);
  function getFacultyIdFromToken() {
  try {
    const token = localStorage.getItem("access");
    if (!token) return null;

    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.faculty_id ?? null;
  } catch {
    return null;
  }
}

const closeAndReset = useCallback(() => {
  setForm({ name: "", term: 1, dept: 0 });
  setErrors({});
  setSaving(false);
  originalForm.current = null;  // ← add this
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
      dept: initialPlan.dept ?? 0,
    };
    setForm(loaded);
    originalForm.current = loaded;  // ← add this
  } else {
    setForm({ name: "", term: 1, dept: 0 });
    originalForm.current = null;    // ← reset for create mode
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
    if (!form.dept) next.dept = "اختار القسم";
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
     
    // ── No-change guard (edit mode only) ──────────────────────────
    if (isEdit && originalForm.current) {
      const keys = Object.keys(form) as (keyof FormState)[];
      const hasChanged = keys.some(
        (k) => String(form[k]).trim() !== String(originalForm.current![k]).trim()
      );
      if (!hasChanged) {
        showToast("برجاء التعديل أو إلغاء التعديل ⚠️", "warning");
        return;
      }
    }
    try {
      setSaving(true);

      // if (!token) {
      //   showToast("❌ مفيش access token. برجاء تسجيل الدخول مرة اخري.", "error");
      //   return;
      // }
   const facultyId = getFacultyIdFromToken();
      const payload = {
        name: form.name.trim(),
        term: Number(form.term),
        dept_id: Number(form.dept),
        faculty_id: facultyId,
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
                  className={`${styles.select} ${errors.dept ? styles.inputError : ""}`}
                  value={String(form.dept)}
                  onChange={(e) => setField("dept", Number(e.target.value))}
                >
                  <option value="0" hidden>اختار القسم</option>
                  {departments.map((d) => (
                    <option key={d.dept_id as number} value={d.dept_id as number}>
                      {d.dept_name as string}
                    </option>
                  ))}
                </select>
                {errors.dept && <div className={styles.errorText}>{errors.dept}</div>}
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
