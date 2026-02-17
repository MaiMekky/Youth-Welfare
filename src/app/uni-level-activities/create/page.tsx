"use client";

import React, { useMemo, useState } from "react";
import styles from "./CreateEvent.module.css";
import { useRouter } from "next/navigation";
import { ArrowRight, Save } from "lucide-react";

type Faculty = { id: number; name: string };

type FormState = {
  title: string;
  date: string;
  time: string;
  location: string;
  maxParticipants: number;
  cost: number;
  description: string;
};

type FormErrors = Partial<Record<keyof FormState | "faculty_ids", string>>;

export default function CreateEventPage() {
  const router = useRouter();

  const faculties: Faculty[] = useMemo(
    () => [
      { id: 1, name: "كلية الحاسبات والمعلومات" },
      { id: 2, name: "كلية الهندسة" },
      { id: 3, name: "كلية التجارة" },
      { id: 4, name: "كلية الآداب" },
      { id: 5, name: "كلية العلوم" },
      { id: 6, name: "كلية التربية" },
      { id: 7, name: "كلية الحقوق" },
      { id: 8, name: "كلية الطب" },
      { id: 9, name: "كلية الصيدلة" },
      { id: 10, name: "كلية التمريض" },
    ],
    []
  );

  const [form, setForm] = useState<FormState>({
    title: "",
    date: "",
    time: "",
    location: "",
    maxParticipants: 100,
    cost: 0,
    description: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedFacultyIds, setSelectedFacultyIds] = useState<number[]>([]);

  const allSelected = selectedFacultyIds.length === faculties.length && faculties.length > 0;
  const someSelected = selectedFacultyIds.length > 0 && !allSelected;

  const toggleAll = () => {
    setSelectedFacultyIds(allSelected ? [] : faculties.map((f) => f.id));
    setErrors((p) => ({ ...p, faculty_ids: undefined }));
  };

  const toggleOne = (id: number) => {
    setSelectedFacultyIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      return next;
    });
    setErrors((p) => ({ ...p, faculty_ids: undefined }));
  };

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};

    if (!form.title.trim()) next.title = "عنوان الفعالية مطلوب";
    if (!form.date) next.date = "تاريخ الفعالية مطلوب";
    if (!form.time) next.time = "وقت الفعالية مطلوب";
    if (!form.location.trim()) next.location = "المكان مطلوب";

    if (!Number.isFinite(form.maxParticipants) || form.maxParticipants > 200) {
      next.maxParticipants = "الحد الأقصى للمشاركين لا يمكن أن يتجاوز 200";
    }
    if (
    !Number.isFinite(form.maxParticipants) ||
    form.maxParticipants < 1 ||
    form.maxParticipants > 200
  ) {
    next.maxParticipants = "عدد المشاركين يجب أن يكون بين 1 و 200";
  }

    if (form.cost < 0) {
      next.cost = "التكلفة يجب أن تكون رقمًا أكبر أو يساوي 0";
    }

    const desc = form.description.trim();
    if (!desc) {
      next.description = "الوصف مطلوب";
    }

    if (!Number.isFinite(form.cost) || form.cost < 0) {
      next.cost = "التكلفة يجب أن تكون رقمًا أكبر أو يساوي 0";
    }

    if (selectedFacultyIds.length === 0) {
      next.faculty_ids = "اختاري كلية واحدة على الأقل";
    }

    return next;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    const payload = { ...form, faculty_ids: selectedFacultyIds };
    console.log("CREATE EVENT PAYLOAD:", payload);
    alert("تم تجهيز بيانات الإنشاء (شوفي console).");
    router.push("/uni-level-activities");
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>إنشاء فعالية جديدة</h1>
            <p className={styles.subtitle}>قم بملء التفاصيل لإنشاء فعالية جديدة</p>
          </div>

          <button className={styles.backBtn} onClick={() => router.back()}>
            <ArrowRight size={18} />
            رجوع
          </button>
        </header>

        <form className={styles.card} onSubmit={onSubmit} noValidate>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label}>عنوان الفعالية</label>
              <input
                className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
                placeholder="عنوان الفعالية"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                required
              />
              {errors.title && <div className={styles.errorText}>{errors.title}</div>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>تاريخ الفعالية</label>
              <input
                className={`${styles.input} ${errors.date ? styles.inputError : ""}`}
                type="date"
                value={form.date}
                onChange={(e) => setField("date", e.target.value)}
                required
              />
              {errors.date && <div className={styles.errorText}>{errors.date}</div>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>وقت الفعالية</label>
              <input
                className={`${styles.input} ${errors.time ? styles.inputError : ""}`}
                type="time"
                value={form.time}
                onChange={(e) => setField("time", e.target.value)}
                required
              />
              {errors.time && <div className={styles.errorText}>{errors.time}</div>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>المكان</label>
              <input
                className={`${styles.input} ${errors.location ? styles.inputError : ""}`}
                placeholder="المكان"
                value={form.location}
                onChange={(e) => setField("location", e.target.value)}
                required
              />
              {errors.location && <div className={styles.errorText}>{errors.location}</div>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>الحد الأقصى للمشاركين</label>
              <input
                className={`${styles.input} ${styles.numberInput} ${
                  errors.maxParticipants ? styles.inputError : ""
                }`}
                type="number"
                min={1}
                max={200}
                value={form.maxParticipants}
                onChange={(e) =>
                setField("maxParticipants", Math.min(200, Number(e.target.value)))
              }
              />
              {errors.maxParticipants && (
                <div className={styles.errorText}>{errors.maxParticipants}</div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>التكلفة</label>
              <input
                className={`${styles.input} ${styles.numberInput} ${
                  errors.cost ? styles.inputError : ""
                }`}
                type="number"
                min={0}
                value={form.cost}
                onChange={(e) => setField("cost", Number(e.target.value))}
              />
              {errors.cost && <div className={styles.errorText}>{errors.cost}</div>}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>الوصف</label>
            <textarea
              className={`${styles.textarea} ${errors.description ? styles.inputError : ""}`}
              placeholder="الوصف"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={5}
            />
            <div className={styles.hintRow}>

              {errors.description && <span className={styles.errorTextInline}>{errors.description}</span>}
            </div>
          </div>

          <div className={`${styles.facultyBox} ${errors.faculty_ids ? styles.boxError : ""}`}>
            <div className={styles.facultyHeader}>
              <div>
                <div className={styles.facultyTitle}>الكليات المستهدفة</div>
                <div className={styles.facultyHint}>اختاري كلية أو أكثر</div>
              </div>

              <label className={styles.selectAll}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                />
                <span>اختيار كل الكليات</span>
              </label>
            </div>

            {errors.faculty_ids && <div className={styles.errorText}>{errors.faculty_ids}</div>}

            <div className={styles.facultyGrid}>
              {faculties.map((f) => (
                <label key={f.id} className={styles.facultyItem}>
                  <input
                    type="checkbox"
                    checked={selectedFacultyIds.includes(f.id)}
                    onChange={() => toggleOne(f.id)}
                  />
                  <span>{f.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={() => router.back()}>
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
