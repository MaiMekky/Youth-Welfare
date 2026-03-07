"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "../styles/PlansPage.module.css";
import { X, Save } from "lucide-react";

const API_URL = "http://localhost:8000/api";

type InitialPlan = { id: number; name: string; term: number; dept?: number } | null;

type FormState = { name: string; term: number; dept: number };
type FormErrors = Partial<Record<keyof FormState, string>>;

type ToastType = "success" | "error" | "warning";

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

  const [form, setForm] = useState<FormState>({ name: "", term: 1, dept: 0 });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const [departments, setDepartments] = useState<any[]>([]);

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

  /* ===================== Toast (same style) ===================== */
  const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType }>({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ show: true, message, type });
    window.setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2500);
  };

  const reset = () => {
    setForm({ name: "", term: 1, dept: 0 });
    setErrors({});
    setSaving(false);
  };

  const closeAndReset = () => {
    reset();
    onClose();
  };

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
      setForm({
        name: initialPlan.name ?? "",
        term: initialPlan.term ?? 1,
        dept: initialPlan.dept ?? 0,
      });
    } else {
      setForm({ name: "", term: 1, dept: 0 });
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
  }, [open]);

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
      showToast("❌ مراجعة الحقول المطلوبة", "error");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("access");
      if (!token) {
        showToast("❌ مفيش access token. برجاء تسجيل الدخول مرة اخري.", "error");
        return;
      }
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
    <>
      {toast.show && (
        <div className={`toast ${toast.type === "success" ? "success" : toast.type === "error" ? "error" : "warning"}`}>
          <div className="msg">{toast.message}</div>
          <div className="bar" />
        </div>
      )}

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
                    <option key={d.dept_id} value={d.dept_id}>
                      {d.dept_name}
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

      <style jsx>{`
        .toast {
          position: fixed;
          top: 20px;
          right: 25px;
          width: 280px;
          background: #fff;
          padding: 14px 16px;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
          font-weight: 700;
          color: #333;
          z-index: 100000;
          animation: fadeIn 0.4s ease forwards;
          overflow: hidden;
        }
        .toast.success {
          border-right: 6px solid #4caf50;
        }
        .toast.error {
          border-right: 6px solid #f44336;
        }
        .toast.warning {
          border-right: 6px solid #f59e0b;
        }
        .msg {
          text-align: right;
          line-height: 1.35;
        }
        .bar {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 4px;
          width: 0%;
          background-color: #d4a017;
          animation: progress 2.5s linear forwards;
          transform-origin: left;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}