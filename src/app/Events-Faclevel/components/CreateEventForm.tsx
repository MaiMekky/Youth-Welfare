"use client";

import React, { useMemo, useState } from "react";
import styles from "../styles/CreateEventPage.module.css";
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, FileText, Save, X } from "lucide-react";

type FormState = {
  title: string;
  type: string;
  department: string; // القسم المحدد
  startDate: string;
  endDate: string;
  place: string;
  description: string;
  awards: string; // اختياري
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export default function CreateEventForm() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    title: "",
    type: "",
    department: "القسم المحدد: ثقافي", // تقدري تخليه جاي من API لاحقاً
    startDate: "",
    endDate: "",
    place: "",
    description: "",
    awards: "",
  });

  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [errors, setErrors] = useState<FormErrors>({});

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = useMemo(
    () => (data: FormState): FormErrors => {
      const next: FormErrors = {};
      if (!data.title.trim()) next.title = "اسم الفعالية مطلوب";
      if (!data.type.trim()) next.type = "نوع الفعالية مطلوب";
      if (!data.startDate.trim()) next.startDate = "تاريخ البداية مطلوب";
      if (!data.endDate.trim()) next.endDate = "تاريخ النهاية مطلوب";
      if (!data.place.trim()) next.place = "المكان مطلوب";
      if (!data.description.trim()) next.description = "الوصف مطلوب";

      // تحقق بسيط: النهاية بعد البداية
      if (data.startDate && data.endDate && data.endDate < data.startDate) {
        next.endDate = "تاريخ النهاية يجب أن يكون بعد تاريخ البداية";
      }
      return next;
    },
    []
  );

  const onBlur = (k: keyof FormState) => {
    setTouched((p) => ({ ...p, [k]: true }));
    const v = validate(form);
    setErrors((p) => ({ ...p, [k]: v[k] }));
  };

  const onCancel = () => router.back();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const v = validate(form);
    setErrors(v);
    setTouched({
      title: true,
      type: true,
      startDate: true,
      endDate: true,
      place: true,
      description: true,
      awards: true,
      department: true,
    });

    if (Object.keys(v).length) return;

    // TODO: Replace with API call
    const payload = {
      title: form.title.trim(),
      type: form.type,
      department: form.department,
      start_date: form.startDate,
      end_date: form.endDate,
      place: form.place.trim(),
      description: form.description.trim(),
      awards: form.awards.trim() || null,
    };

    console.log("CREATE EVENT payload:", payload);

    // رجوع لصفحة الفعاليات
    router.push("/Events-Faclevel");
  };

  return (
    <section className={styles.card}>
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        {/* اسم الفعالية */}
        <div className={styles.field}>
          <label className={styles.label}>
            اسم الفعالية <span className={styles.req}>*</span>
          </label>
          <input
            className={`${styles.input} ${touched.title && errors.title ? styles.inputError : ""}`}
            placeholder="أدخل اسم الفعالية"
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            onBlur={() => onBlur("title")}
          />
          {touched.title && errors.title && <div className={styles.errorText}>{errors.title}</div>}
        </div>

        {/* نوع الفعالية */}
        <div className={styles.field}>
          <label className={styles.label}>
            نوع الفعالية <span className={styles.req}>*</span>
          </label>
          <select
            className={`${styles.select} ${touched.type && errors.type ? styles.inputError : ""}`}
            value={form.type}
            onChange={(e) => setField("type", e.target.value)}
            onBlur={() => onBlur("type")}
          >
            <option value="" disabled>
              اختر نوع الفعالية
            </option>
            <option value="ندوة">ندوة</option>
            <option value="ورشة">ورشة</option>
            <option value="مسابقة">مسابقة</option>
            <option value="رحلة">رحلة</option>
          </select>
          {touched.type && errors.type && <div className={styles.errorText}>{errors.type}</div>}
        </div>

        {/* ✅ شيلنا “مشرف القسم” نهائياً */}

        {/* القسم المحدد */}
        <div className={styles.smallNote}>{form.department}</div>

        {/* تاريخ البداية + النهاية */}
        <div className={styles.grid2}>
          <div className={styles.field}>
            <label className={styles.label}>
              تاريخ البداية <span className={styles.req}>*</span>
            </label>
            <div className={styles.iconInput}>
              <input
                className={`${styles.input} ${touched.startDate && errors.startDate ? styles.inputError : ""}`}
                placeholder="mm/dd/yyyy"
                value={form.startDate}
                onChange={(e) => setField("startDate", e.target.value)}
                onBlur={() => onBlur("startDate")}
                dir="ltr"
              />
              <span className={styles.icon}>
                <CalendarDays size={16} />
              </span>
            </div>
            {touched.startDate && errors.startDate && <div className={styles.errorText}>{errors.startDate}</div>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              تاريخ النهاية <span className={styles.req}>*</span>
            </label>
            <div className={styles.iconInput}>
              <input
                className={`${styles.input} ${touched.endDate && errors.endDate ? styles.inputError : ""}`}
                placeholder="mm/dd/yyyy"
                value={form.endDate}
                onChange={(e) => setField("endDate", e.target.value)}
                onBlur={() => onBlur("endDate")}
                dir="ltr"
              />
              <span className={styles.icon}>
                <CalendarDays size={16} />
              </span>
            </div>
            {touched.endDate && errors.endDate && <div className={styles.errorText}>{errors.endDate}</div>}
          </div>
        </div>

        {/* المكان */}
        <div className={styles.field}>
          <label className={styles.label}>
            المكان <span className={styles.req}>*</span>
          </label>
          <div className={styles.iconInput}>
            <input
              className={`${styles.input} ${touched.place && errors.place ? styles.inputError : ""}`}
              placeholder="أدخل مكان الفعالية"
              value={form.place}
              onChange={(e) => setField("place", e.target.value)}
              onBlur={() => onBlur("place")}
            />
            <span className={styles.icon}>
              <MapPin size={16} />
            </span>
          </div>
          {touched.place && errors.place && <div className={styles.errorText}>{errors.place}</div>}
        </div>

        {/* الوصف */}
        <div className={styles.field}>
          <label className={styles.label}>
            الوصف <span className={styles.req}>*</span>
          </label>
          <div className={styles.iconArea}>
            <textarea
              className={`${styles.textarea} ${touched.description && errors.description ? styles.inputError : ""}`}
              placeholder="وصف تفصيلي للفعالية"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              onBlur={() => onBlur("description")}
            />
            <span className={styles.iconTop}>
              <FileText size={16} />
            </span>
          </div>
          {touched.description && errors.description && (
            <div className={styles.errorText}>{errors.description}</div>
          )}
        </div>

        {/* الجوائز والشهادات (اختياري) */}
        <div className={styles.field}>
          <label className={styles.label}>الجوائز والشهادات</label>
          <input
            className={styles.input}
            placeholder="أدخل الجوائز أو الشهادات (اختياري)"
            value={form.awards}
            onChange={(e) => setField("awards", e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            <X size={18} />
            إلغاء
          </button>

          <button type="submit" className={styles.saveBtn}>
            <Save size={18} />
            إنشاء الفعالية
          </button>
        </div>
      </form>
    </section>
  );
}
