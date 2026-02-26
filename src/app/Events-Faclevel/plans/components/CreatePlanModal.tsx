"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "../styles/PlansPage.module.css";
import { X, Save } from "lucide-react";

const API_URL = "http://localhost:8000/api";

type InitialPlan = { id: number; name: string; term: number } | null;

type FormState = { name: string; term: number };
type FormErrors = Partial<Record<keyof FormState, string>>;

export default function CreatePlanModal({
  open,
  onClose,
  initialPlan,     // 👈 لو موجود يبقى Edit
  onSaved,         // 👈 بعد save نعمل refresh
}: {
  open: boolean;
  onClose: () => void;
  initialPlan: InitialPlan;
  onSaved: () => void;
}) {
  const isEdit = !!initialPlan;

  const [form, setForm] = useState<FormState>({ name: "", term: 1 });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const reset = () => {
    setForm({ name: "", term: 1 });
    setErrors({});
    setServerError(null);
    setSaving(false);
  };

  const closeAndReset = () => {
    reset();
    onClose();
  };

  // املي الفورم لما يفتح (Create أو Edit)
  useEffect(() => {
    if (!open) return;

    if (initialPlan) {
      setForm({ name: initialPlan.name ?? "", term: initialPlan.term ?? 1 });
    } else {
      setForm({ name: "", term: 1 });
    }
    setErrors({});
    setServerError(null);
  }, [open, initialPlan]);

  // ESC
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAndReset();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // lock scroll
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
    setServerError(null);
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = "اسم الخطة مطلوب";
    if (!Number.isFinite(form.term) || form.term < 1) next.term = "اختاري الترم";
    return next;
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setSaving(true);
      setServerError(null);

      const token = localStorage.getItem("access");
      if (!token) {
        setServerError("مفيش access token. اعملي تسجيل دخول تاني.");
        return;
      }

      const payload = {
        name: form.name.trim(),
        term: Number(form.term),
      };

      const url = isEdit
        ? `${API_URL}/events/plans/${initialPlan!.id}/update/`
        : `${API_URL}/events/plans/create/`;

      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log(method, "plan status:", res.status);
      console.log(method, "plan raw body:", text);

      if (!res.ok) {
        // لو السيرفر بيرجع errors بشكل معين
        let msg = `فشل الحفظ (Status ${res.status})`;
        try {
          const j = text ? JSON.parse(text) : null;
          msg = j?.detail || j?.error || msg;
        } catch {}
        setServerError(msg);
        return;
      }

      // Success
      onSaved();      // refresh list
      closeAndReset();
    } catch (err) {
      console.error(err);
      setServerError("حصل خطأ أثناء الحفظ");
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
            <h2 className={styles.modalTitle}>
              {isEdit ? "تعديل الخطة" : "إنشاء خطة جديدة"}
            </h2>
            <p className={styles.modalSubtitle}>
              {isEdit ? "عدّلي الاسم أو الترم ثم احفظي" : "قم بملء البيانات الأساسية للخطة"}
            </p>
          </div>

          <button className={styles.modalClose} type="button" onClick={closeAndReset}>
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
          </div>

          {serverError && (
            <div style={{ marginTop: 10, color: "crimson", fontWeight: 900, textAlign: "right" }}>
              {serverError}
            </div>
          )}

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