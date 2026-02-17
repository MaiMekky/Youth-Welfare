"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./CreateProposed.module.css";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Save,
  X,
  MapPin,
  CalendarDays,
  DollarSign,
  Users,
  Briefcase,
  Lightbulb,
  Clock,
} from "lucide-react";

type FormState = {
  projectName: string;
  place: string;
  period: string; // date or period text
  cost: string;
  participants: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export default function CreateProposedEventPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const planId = String(params?.id ?? "");
  const mode = (searchParams.get("mode") ?? "create") as "create" | "convert";
  const isConvert = mode === "convert";

  const [form, setForm] = useState<FormState>({
    projectName: "",
    place: "",
    period: "",
    cost: "",
    participants: "",
  });

  // بيانات المقترح الأصلية (علشان summary box)
  const [seed, setSeed] = useState<FormState | null>(null);

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = useMemo(
    () => (data: FormState): FormErrors => {
      const next: FormErrors = {};
      if (!data.projectName.trim()) next.projectName = "اسم المشروع مطلوب";
      if (!data.place.trim()) next.place = "مكان التنفيذ مطلوب";
      if (!data.period.trim()) next.period = "الفترة أو التاريخ مطلوب";
      if (!data.cost.trim()) next.cost = "التكلفة مطلوبة";
      if (!data.participants.trim()) next.participants = "عدد المشاركين مطلوب";

      const costNum = Number(String(data.cost).replaceAll(",", "").trim());
      if (data.cost.trim() && (Number.isNaN(costNum) || costNum < 0)) next.cost = "ادخلي تكلفة صحيحة";

      const partNum = Number(String(data.participants).replaceAll(",", "").trim());
      if (data.participants.trim() && (!Number.isInteger(partNum) || partNum <= 0))
        next.participants = "ادخلي عدد صحيح أكبر من 0";

      return next;
    },
    []
  );

  const onBlur = (k: keyof FormState) => {
    setTouched((p) => ({ ...p, [k]: true }));
    const nextErrors = validate(form);
    setErrors((p) => ({ ...p, [k]: nextErrors[k] }));
  };

  const resetAll = () => {
    setForm({ projectName: "", place: "", period: "", cost: "", participants: "" });
    setErrors({});
    setTouched({});
    setSeed(null);
  };

  const onCancel = () => {
    sessionStorage.removeItem("convert_proposed_payload");
    router.back();
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = validate(form);
    setErrors(nextErrors);
    setTouched({
      projectName: true,
      place: true,
      period: true,
      cost: true,
      participants: true,
    });

    if (Object.keys(nextErrors).length) return;

    if (isConvert) {
      // TODO: هنا هتعملي API لتحويل المقترح لفعالية فعلية
      const payload = {
        plan_id: planId,
        from_proposed: true,
        final: {
          project_name: form.projectName.trim(),
          place: form.place.trim(),
          period: form.period.trim(),
          cost: form.cost.trim(),
          participants_total: form.participants.trim(),
        },
      };

      console.log("CONVERT Proposed -> Event payload:", payload);
      sessionStorage.removeItem("convert_proposed_payload");

      // رجّعي لصفحة تفاصيل الخطة (أو روحي لصفحة الفعالية الجديدة بعد ما الـ API يرجع id)
      router.push(`/uni-level-activities/plans/${planId}`);
      return;
    }

    // Create Proposed normal
    const payload = {
      plan_id: planId,
      project_name: form.projectName.trim(),
      place: form.place.trim(),
      period: form.period.trim(),
      cost: form.cost.trim(),
      participants_total: form.participants.trim(),
    };

    console.log("CREATE Proposed payload:", payload);
    router.push(`/uni-level-activities/plans/${planId}`);
  };

  // Prefill عند وضع convert
  useEffect(() => {
    if (!isConvert) return;

    try {
      const raw = sessionStorage.getItem("convert_proposed_payload");
      if (!raw) return;

      const parsed = JSON.parse(raw) as {
        planId: string;
        row: {
          title?: string;
          place?: string;
          date?: string;
          expected?: string;
          cost?: string;
          category?: string;
        };
      };

      // لو الخطة اختلفت، تجاهلي
      if (String(parsed.planId) !== String(planId)) return;

      const prefilled: FormState = {
        projectName: parsed.row.title ?? "",
        place: parsed.row.place ?? "",
        period: parsed.row.date ?? "",
        participants: parsed.row.expected ?? "",
        cost: parsed.row.cost ?? "",
      };

      setSeed(prefilled);
      setForm(prefilled);
    } catch {
      // ignore
    }
  }, [isConvert, planId]);

  // ESC
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <div className={styles.headText}>
            <h1 className={styles.pageTitle}>{isConvert ? "إنشاء فعالية فعلية" : "إضافة فعالية مقترحة"}</h1>
            <p className={styles.pageSubtitle}>
              {isConvert
                ? "البيانات المبدئية من الفعالية المقترحة — يمكنك تعديلها قبل الإنشاء"
                : "قم بملء البيانات الأساسية للفعالية المقترحة"}
            </p>
          </div>

          <button className={styles.backBtn} onClick={() => router.back()} type="button">
            <ArrowRight size={18} />
            {isConvert ? "العودة للخطة" : "العودة للخطة"}
          </button>
        </div>

        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.heroTitle}>خطة رقم: {planId}</div>
        </div>

        {/* Form card */}
        <section className={styles.formCard}>
          {/* Summary box (زي الصورة) */}
          {isConvert && seed && (
            <div className={styles.summaryBox}>
              <div className={styles.summaryHead}>
                <div className={styles.summaryIcon}>
                  <Lightbulb size={18} />
                </div>
                <div className={styles.summaryTitle}>البيانات المبدئية من الفعالية المقترحة:</div>
              </div>

              <ul className={styles.summaryList}>
                <li>العنوان: {seed.projectName || "—"}</li>
                <li>المكان المقترح: {seed.place || "—"}</li>
                <li>التاريخ/الفترة: {seed.period || "—"}</li>
                <li>العدد المتوقع: {seed.participants || "—"}</li>
                <li>التكلفة التقديرية: {seed.cost || "—"}</li>
              </ul>
            </div>
          )}

            <div className={styles.formHead}>
            <div className={styles.formTitle}>
              {isConvert ? "بيانات الفعالية النهائية" : "بيانات الفعالية المقترحة"}
            </div>
            <div className={styles.formMeta}>
              {isConvert
                ? "عدّلي القيم ثم اضغطي إنشاء الفعالية."
                : "هذه البيانات للتخطيط الداخلي ويمكن تعديلها لاحقًا."}
            </div>
          </div>
          {/* Inline quick fields (زي الصورة) */}
          {isConvert && (
            <div className={styles.quickGrid}>
              {/* row 1: time + date */}
              <div className={styles.quickRow2}>
                <div className={styles.qField}>
                  <label className={styles.qLabel}>وقت الفعالية</label>
                  <div className={styles.qControl}>
                    <input
                      className={styles.qInput}
                      placeholder="--:--"
                      value={""}
                      readOnly
                    />
                    <span className={styles.qIcon}>
                      <Clock size={16} />
                    </span>
                  </div>
                </div>

                <div className={styles.qField}>
                  <label className={styles.qLabel}>التاريخ النهائي</label>
                  <div className={styles.qControl}>
                    <input
                      className={styles.qInput}
                      placeholder="mm/dd/yyyy"
                      value={form.period}
                      onChange={(e) => setField("period", e.target.value)}
                      onBlur={() => onBlur("period")}
                      dir="ltr"
                    />
                    <span className={styles.qIcon}>
                      <CalendarDays size={16} />
                    </span>
                  </div>
                  {touched.period && errors.period && <div className={styles.errorText}>{errors.period}</div>}
                </div>
              </div>

              {/* row 2: place */}
              <div className={styles.qField}>
                <label className={styles.qLabel}>المكان النهائي</label>
                <div className={styles.qControl}>
                  <input
                    className={styles.qInput}
                    placeholder="مثال: مركز الفنون - قاعة المعارض الرئيسية"
                    value={form.place}
                    onChange={(e) => setField("place", e.target.value)}
                    onBlur={() => onBlur("place")}
                  />
                </div>
                {touched.place && errors.place && <div className={styles.errorText}>{errors.place}</div>}
              </div>

              {/* row 3: cost + participants */}
              <div className={styles.quickRow2}>
                <div className={styles.qField}>
                  <label className={styles.qLabel}>التكلفة النهائية (جنيه)</label>
                  <div className={styles.qControl}>
                    <input
                      className={styles.qInput}
                      placeholder="5000"
                      value={form.cost}
                      onChange={(e) => setField("cost", e.target.value)}
                      onBlur={() => onBlur("cost")}
                      inputMode="numeric"
                      dir="ltr"
                    />
                  </div>
                  {touched.cost && errors.cost && <div className={styles.errorText}>{errors.cost}</div>}
                </div>

                <div className={styles.qField}>
                  <label className={styles.qLabel}>عدد إجمالي المشاركين</label>
                  <div className={styles.qControl}>
                    <input
                      className={styles.qInput}
                      placeholder="150"
                      value={form.participants}
                      onChange={(e) => setField("participants", e.target.value)}
                      onBlur={() => onBlur("participants")}
                      inputMode="numeric"
                      dir="ltr"
                    />
                  </div>
                  {touched.participants && errors.participants && (
                    <div className={styles.errorText}>{errors.participants}</div>
                  )}
                </div>
              </div>
            </div>
          )}
          {isConvert && (
            <div className={styles.footer}>
              <button type="button" className={styles.cancelBtn} onClick={onCancel}>
                <X size={18} />
                إلغاء
              </button>

              <button type="button" className={styles.saveBtn} onClick={() => onSubmit({ preventDefault() {} } as any)}>
                <Save size={18} />
                إنشاء الفعالية الفعلية
              </button>
            </div>
          )}

    {!isConvert && (
          <form className={styles.form} onSubmit={onSubmit} noValidate>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label}>
                  <Briefcase size={16} /> اسم المشروع
                </label>
                <input
                  className={`${styles.input} ${
                    touched.projectName && errors.projectName ? styles.inputError : ""
                  }`}
                  placeholder="مثال: معرض الفنون التشكيلية"
                  value={form.projectName}
                  onChange={(e) => setField("projectName", e.target.value)}
                  onBlur={() => onBlur("projectName")}
                />
                {touched.projectName && errors.projectName && (
                  <div className={styles.errorText}>{errors.projectName}</div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  <MapPin size={16} /> مكان التنفيذ
                </label>
                <input
                  className={`${styles.input} ${touched.place && errors.place ? styles.inputError : ""}`}
                  placeholder="مثال: قاعة الاحتفالات الكبرى"
                  value={form.place}
                  onChange={(e) => setField("place", e.target.value)}
                  onBlur={() => onBlur("place")}
                />
                {touched.place && errors.place && <div className={styles.errorText}>{errors.place}</div>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  <CalendarDays size={16} /> الفترة أو التاريخ
                </label>
                <input
                  className={`${styles.input} ${touched.period && errors.period ? styles.inputError : ""}`}
                  placeholder="مثال: 2026-03-15 أو من 15 إلى 18 مارس"
                  value={form.period}
                  onChange={(e) => setField("period", e.target.value)}
                  onBlur={() => onBlur("period")}
                />
                {touched.period && errors.period && <div className={styles.errorText}>{errors.period}</div>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  <DollarSign size={16} /> التكلفة (جنيه)
                </label>
                <input
                  className={`${styles.input} ${touched.cost && errors.cost ? styles.inputError : ""}`}
                  placeholder="مثال: 5000"
                  value={form.cost}
                  onChange={(e) => setField("cost", e.target.value)}
                  onBlur={() => onBlur("cost")}
                  inputMode="numeric"
                />
                {touched.cost && errors.cost && <div className={styles.errorText}>{errors.cost}</div>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  <Users size={16} /> عدد إجمالي المشاركين
                </label>
                <input
                  className={`${styles.input} ${
                    touched.participants && errors.participants ? styles.inputError : ""
                  }`}
                  placeholder="مثال: 100"
                  value={form.participants}
                  onChange={(e) => setField("participants", e.target.value)}
                  onBlur={() => onBlur("participants")}
                  inputMode="numeric"
                />
                {touched.participants && errors.participants && (
                  <div className={styles.errorText}>{errors.participants}</div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className={styles.footer}>
              <button type="button" className={styles.cancelBtn} onClick={onCancel}>
                <X size={18} />
                إلغاء
              </button>

              <button type="submit" className={styles.saveBtn}>
                <Save size={18} />
                {isConvert ? "إنشاء الفعالية الفعلية" : "حفظ الفعالية المقترحة"}
              </button>
            </div>

          </form>
        )}
        </section>
      </div>
    </div>
  );
}
