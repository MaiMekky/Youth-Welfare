"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./CreateProposed.module.css";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Save,
  X,
  MapPin,
  DollarSign,
  Users,
  Lightbulb,
  Briefcase,
} from "lucide-react";
import Footer from "@/app/FacLevel/components/Footer";
import { authFetch } from "@/utils/globalFetch";

const API_URL = `${process.env.NEXT_PUBLIC_BASE_URL}`;

type Mode = "create" | "convert";

type FormState = {
  title: string;
  description: string;
  location: string;
  st_date: string;
  end_date: string;
  cost: string;
  s_limit: string;
  type: string;
  // dept_id: string;   
  restrictions: string;
  reward: string;
  resource: string;
};

type FormErrors = Partial<Record<keyof FormState | "selected_facs", string>>;
/* ===================== Toast (same style) ===================== */
type ToastType = "success" | "error" | "warning";

function getAccessToken(): string | null {
  return (
    localStorage.getItem("access") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    null
  );
}



async function apiFetch<T>(
  path: string,
  opts: RequestInit = {}
): Promise<{ ok: true; data: T } | { ok: false; message: string; status?: number; raw?: Record<string, unknown> }> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await authFetch(`${API_URL}${path}`, { ...opts, headers });
    const text = await res.text();
    const maybeJson = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;
    if (!res.ok) {
      const msg =
        (typeof maybeJson === "object" && maybeJson &&
          ((maybeJson as Record<string, unknown>).detail || (maybeJson as Record<string, unknown>).message || (maybeJson as Record<string, unknown>).error)) ||
        (typeof maybeJson === "string" ? maybeJson : "") ||
        `طلب غير ناجح (${res.status})`;
      return { ok: false, message: String(msg), status: res.status, raw: maybeJson };
    }
    return { ok: true, data: maybeJson as T };
  } catch (e: unknown) {
    return { ok: false, message: (e as Error)?.message || "مشكلة في الاتصال" };
  }
}

export default function CreateProposedEventPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const planId = String(params?.id ?? "");
  const mode = (searchParams.get("mode") ?? "create") as Mode;
  const isConvert = mode === "convert";

const [form, setForm] = useState<FormState>({
  title: "",
  description: "",
  location: "",
  st_date: "",
  end_date: "",
  cost: "",
  s_limit: "",
  type: "",
  // dept_id: "",   
  restrictions: "",
  reward: "",
  resource: "",
});

  const [seed, setSeed] = useState<FormState | null>(null);
  const [eventId, setEventId] = useState<number | null>(null);

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);

  /* ===================== Toast State ===================== */
  const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType }>({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ show: true, message, type });
    window.setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2500);
  };

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = useMemo(
    () => (data: FormState): FormErrors => {
      const next: FormErrors = {};
      if (!data.title.trim()) next.title = "العنوان مطلوب";
      if (!data.location.trim()) next.location = "المكان مطلوب";
      if (!data.st_date.trim()) next.st_date = "تاريخ البداية مطلوب";
      if (!data.end_date.trim()) next.end_date = "تاريخ النهاية مطلوب";
      if (!data.cost.trim()) next.cost = "التكلفة مطلوبة";
      if (!data.type.trim()) next.type = "نوع النشاط مطلوب";
      // if (isConvert && !data.dept_id) {
      //   next.dept_id = "الإدارة مطلوبة";
      // }
      const costNum = Number(String(data.cost).replaceAll(",", "").trim());
      if (data.cost.trim() && (Number.isNaN(costNum) || costNum < 0)) next.cost = "برجاء ادخال تكلفة صحيحة";
      if (data.s_limit.trim()) {
        const limitNum = Number(String(data.s_limit).replaceAll(",", "").trim());
        if (!Number.isInteger(limitNum) || limitNum < 0) next.s_limit = "برجاء ادخال رقم صحيح 0 أو أكبر";
      }
      if (data.st_date && data.end_date && data.st_date > data.end_date) {
        next.end_date = "تاريخ النهاية لازم يكون بعد/يساوي تاريخ البداية";
      }
      return next;
    },
    []
  );

  const onBlur = (k: keyof FormState) => {
    setTouched((p) => ({ ...p, [k]: true }));
    const nextErrors = validate(form);
    setErrors((p) => ({ ...p, [k]: nextErrors[k] }));
  };

  const onCancel = () => {
    sessionStorage.removeItem("convert_proposed_payload");
    router.push('/Events-Faclevel/plans');
  };

  const touchAll = () => {
    setTouched({
      title: true,
      description: true,
      location: true,
      st_date: true,
      end_date: true,
      cost: true,
      s_limit: true,
      type: true,
      restrictions: true,
      reward: true,
      resource: true,
    });
  };

      const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const nextErrors = validate(form);
        setErrors(nextErrors);
        touchAll();
        // if (Object.keys(nextErrors).length) {
        //   showToast("⚠️ برجاء ملء الحقول المطلوبة", "warning");
        //   return;
        // }

        setSubmitting(true);

      if (!isConvert) {

      const payload = {
        title: form.title.trim(),
        type: form.type.trim(),
        location: form.location.trim(),
        st_date: form.st_date,
        end_date: form.end_date,
        cost: String(form.cost).trim(),
        s_limit: form.s_limit ? Number(form.s_limit) : 0,
        plan_id: Number(planId),
      };

      const res = await apiFetch<Record<string, unknown>>(
        "/api/events/plans/create-event/",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      setSubmitting(false);

      if (!res.ok) {
        showToast(`❌ ${res.message}`, "error");
        return;
      }

      showToast("✅ تم إنشاء فعالية مقترحة بنجاح", "success");

      router.push(`/Events-Faclevel/plans/${planId}`);
      return;
    }

    if (!eventId) {
      setSubmitting(false);
      showToast("❌ لا يوجد رقم فعالية للتحويل", "error");
      return;
        }

      const payload2 = {
        event_id: eventId,
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        st_date: form.st_date,
        end_date: form.end_date,
        location: form.location.trim(),
        s_limit: form.s_limit ? Number(form.s_limit) : 0,
        cost: String(form.cost).trim(),
        restrictions: form.restrictions.trim(),
        reward: form.reward.trim(),
        // dept_id: Number(form.dept_id),  
    };

      const res2 = await apiFetch<Record<string, unknown>>(
      `/api/events/plans/${planId}/add-event/`,
      {
        method: "POST",
        body: JSON.stringify(payload2),
      }
    );
    setSubmitting(false);
    if (!res2.ok) { console.error("خطأ إضافة فعالية للخطة:", res2); showToast(`❌ ${res2.message}`, "error"); return; }
    sessionStorage.setItem(`converted_${planId}_${eventId}`, "1");
    sessionStorage.removeItem("convert_proposed_payload");
    showToast("✅ تم تحويل الفعالية وإضافتها للخطة", "success");
    router.push(`/Events-Faclevel/plans/${planId}`);
  };

  // ── Helper: resolve dept_name from dept id using localStorage departments ──
  // Priority: 1) match by dept_id from departments array
  //           2) fallback to e.type string if already a name

  useEffect(() => {
    if (!isConvert) return;
    const raw = sessionStorage.getItem("convert_proposed_payload");
    if (!raw) return;
    let parsed: Record<string, unknown> | null = null;
    try { parsed = JSON.parse(raw); } catch { return; }

    const idFromPayload =
      (parsed?.event as Record<string, unknown>)?.event_id ?? (parsed?.event as Record<string, unknown>)?.id ??
      (parsed?.row as Record<string, unknown>)?.event_id ?? (parsed?.row as Record<string, unknown>)?.id ??
      parsed?.event_id ?? parsed?.id ?? null;

    const fallbackRow = (parsed?.event ?? parsed?.row ?? parsed ?? {}) as Record<string, unknown>;

    const prefilledFromPayload: FormState = {
      title: (fallbackRow?.title as string) ?? "",
      description: (fallbackRow?.description as string) ?? "",
      location: (fallbackRow?.location as string) ?? "",
      st_date: (fallbackRow?.st_date as string) ?? "",
      end_date: (fallbackRow?.end_date as string) ?? "",
      cost: String(fallbackRow?.cost ?? ""),
      s_limit: String(fallbackRow?.s_limit ?? ""),
      type: (fallbackRow?.type as string) ?? "",
      restrictions: (fallbackRow?.restrictions as string) ?? "",
      reward: (fallbackRow?.reward as string) ?? "",
      resource: (fallbackRow?.resource as string) ?? "",
      // dept_id: fallbackRow?.dept_id ?? "",
    };

    setSeed(prefilledFromPayload);
    setForm((p) => ({ ...p, ...prefilledFromPayload }));
    if (!idFromPayload) return;

    (async () => {
      const res = await apiFetch<Record<string, unknown>>(`/api/event/get-events/${idFromPayload}/`, { method: "GET" });
      if (!res.ok) { showToast(`❌ ${res.message}`, "error"); return; }
      const e = ((res.data as Record<string, unknown>)?.data ?? res.data) as Record<string, unknown>;

      const prefilled: FormState = {
        title: (e?.title as string) ?? "",
        description: (e?.description as string) ?? "",
        location: (e?.location as string) ?? "",
        st_date: (e?.st_date as string) ?? "",
        end_date: (e?.end_date as string) ?? "",
        cost: (e?.cost as string) ?? "",
        s_limit: String(e?.s_limit ?? ""),
        type: (e?.type as string) ?? "",
        restrictions: (e?.restrictions as string) ?? "",
        reward: (e?.reward as string) ?? "",
        resource: (e?.resource as string) ?? "",
        // dept_id: e?.dept_id ?? "",
      };

      setEventId(Number(e?.event_id ?? idFromPayload));
      setSeed(prefilled);
      setForm((p) => ({ ...p, ...prefilled }));
    })();
  }, [isConvert, planId]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  return (
    <>
      {/* ✅ Toast */}
      {toast.show && (
        <div className={`${styles.toast} ${styles[`toast_${toast.type}`]}`}>
          {toast.message}
        </div>
      )}

      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.topBar}>
            <div className={styles.headText}>
              <h1 className={styles.pageTitle}>{isConvert ? "إنشاء فعالية فعلية" : "إضافة فعالية مقترحة"}</h1>
              <p className={styles.pageSubtitle}>
                {isConvert ? "يتم تحميل البيانات من الفعالية المقترحة ويمكن تعديلها" : "املئي البيانات الأساسية للفعالية"}
              </p>
            </div>
            <button className={styles.backBtn} onClick={() => router.push('/Events-Faclevel/plans')} type="button">
              <ArrowRight size={18} /> العودة للخطة
            </button>
          </div>

          <div className={styles.hero}>
            <div className={styles.heroTitle}>خطة رقم: {planId}</div>
          </div>

          <section className={styles.formCard}>
            {isConvert && seed && (
              <div className={styles.summaryBox}>
                <div className={styles.summaryHead}>
                  <div className={styles.summaryIcon}><Lightbulb size={18} /></div>
                  <div className={styles.summaryTitle}>بيانات الفعالية المقترحة:</div>
                </div>
                <ul className={styles.summaryList}>
                  <li>العنوان: {seed.title || "—"}</li>
                  <li>المكان: {seed.location || "—"}</li>
                  <li>تاريخ البداية: {seed.st_date || "—"}</li>
                  <li>تاريخ النهاية: {seed.end_date || "—"}</li>
                  <li>الحد الأقصى: {seed.s_limit || "—"}</li>
                  <li>التكلفة: {seed.cost || "—"}</li>
                  <li>النوع: {seed.type || "—"}</li>
                </ul>
                {eventId && <div style={{ marginTop: 8, fontWeight: 800, opacity: 0.9 }}>رقم الفعالية: {eventId}</div>}
              </div>
            )}

            <div className={styles.formHead}>
              <div className={styles.formTitle}>{isConvert ? "بيانات الفعالية النهائية" : "بيانات الفعالية المقترحة"}</div>
              <div className={styles.formMeta}>
                {isConvert ? "برجاء تعديل القيم ثم اضغطي حفظ." : "هذه البيانات للتخطيط ويمكن تعديلها لاحقاً."}
              </div>
            </div>

            <form className={styles.form} onSubmit={onSubmit} noValidate>
              <div className={styles.grid2}>
                <div className={styles.field}>
                  <label className={styles.label}><Briefcase size={16} /> العنوان</label>
                  <input
                    className={`${styles.input} ${touched.title && errors.title ? styles.inputError : ""}`}
                    placeholder="مثال: معرض"
                    value={form.title}
                    onChange={(e) => setField("title", e.target.value)}
                    onBlur={() => onBlur("title")}
                  />
                  {touched.title && errors.title && <div className={styles.errorText}>{errors.title}</div>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}><MapPin size={16} /> المكان</label>
                  <input
                    className={`${styles.input} ${touched.location && errors.location ? styles.inputError : ""}`}
                    placeholder="مثال: قاعة الاحتفالات"
                    value={form.location}
                    onChange={(e) => setField("location", e.target.value)}
                    onBlur={() => onBlur("location")}
                  />
                  {touched.location && errors.location && <div className={styles.errorText}>{errors.location}</div>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>تاريخ البداية</label>
                  <input
                    className={`${styles.input} ${errors.st_date ? styles.inputError : ""}`}
                    type="date"
                    value={form.st_date}
                    onChange={(ev) => setField("st_date", ev.target.value)}
                  />
                  {touched.st_date && errors.st_date && <div className={styles.errorText}>{errors.st_date}</div>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>تاريخ النهاية</label>
                  <input
                    className={`${styles.input} ${errors.end_date ? styles.inputError : ""}`}
                    type="date"
                    value={form.end_date}
                    onChange={(ev) => setField("end_date", ev.target.value)}
                  />
                  {touched.end_date && errors.end_date && <div className={styles.errorText}>{errors.end_date}</div>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}><DollarSign size={16} /> التكلفة</label>
                  <input
                    className={`${styles.input} ${touched.cost && errors.cost ? styles.inputError : ""}`}
                    placeholder="مثال: 200"
                    value={form.cost}
                    onChange={(e) => setField("cost", e.target.value)}
                    onBlur={() => onBlur("cost")}
                    inputMode="numeric"
                    dir="ltr"
                  />
                  {touched.cost && errors.cost && <div className={styles.errorText}>{errors.cost}</div>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}><Users size={16} /> الحد الأقصى للمشاركين</label>
                  <input
                    className={`${styles.input} ${touched.s_limit && errors.s_limit ? styles.inputError : ""}`}
                    placeholder="مثال: 0"
                    value={form.s_limit}
                    onChange={(e) => setField("s_limit", e.target.value)}
                    onBlur={() => onBlur("s_limit")}
                    inputMode="numeric"
                    dir="ltr"
                  />
                  {touched.s_limit && errors.s_limit && <div className={styles.errorText}>{errors.s_limit}</div>}
                </div>

                {/* ── نوع النشاط — from localStorage departments ── */}
         <div className={styles.field}>
          <label className={styles.label}>نوع النشاط</label>

          <select
            className={`${styles.input} ${touched.type && errors.type ? styles.inputError : ""}`}
            value={form.type}
            onChange={(ev) => setField("type", ev.target.value)}
            onBlur={() => onBlur("type")}
          >
            <option value="" hidden>اختار نوع النشاط</option>

            <option value="داخلي">داخلي</option>
            <option value="خارجي">خارجي</option>

          </select>

          {touched.type && errors.type && (
            <div className={styles.errorText}>{errors.type}</div>
          )}
        </div>

        {/* {isConvert && (
          <div className={styles.field}>
            <label className={styles.label}>الإدارة المنظمة</label>

            <select
              className={styles.input}
              value={form.dept_id}
              onChange={(e) => setField("dept_id", e.target.value)}
            >
              <option value="" hidden>اختار الإدارة</option>

              {departments.map((d) => (
                <option key={d.dept_id} value={d.dept_id}>
                  {d.dept_name}
                </option>
              ))}

            </select>
          </div>
        )} */}
          {isConvert && (
            <div className={styles.field}>
              <label className={styles.label}>القيود</label>
              <input
                className={styles.input}
                placeholder="اختياري"
                    value={form.restrictions}
                    onChange={(e) => setField("restrictions", e.target.value)}
                    onBlur={() => onBlur("restrictions")}
                  />
                </div>
              )}
              {isConvert && (
                <div className={styles.field}>
                  <label className={styles.label}>المكافأة</label>
                  <input
                    className={styles.input}
                    placeholder="اختياري"
                    value={form.reward}
                    onChange={(e) => setField("reward", e.target.value)}
                    onBlur={() => onBlur("reward")}
                  />
                </div>
              )}
              {isConvert && (
                <div className={styles.field}>
                  <label className={styles.label}>الموارد</label>
                  <input
                    className={styles.input}
                    placeholder="اختياري"
                    value={form.resource}
                    onChange={(e) => setField("resource", e.target.value)}
                    onBlur={() => onBlur("resource")}
                  />
                </div>
              )}
               {isConvert && (
                <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                  <label className={styles.label}>الوصف</label>
                  <textarea
                    className={styles.input}
                    placeholder="اكتب وصف مختصر"
                    value={form.description}
                    onChange={(e) => setField("description", e.target.value)}
                    onBlur={() => onBlur("description")}
                    rows={3}
                  />
                </div>
                )}
            </div>
               <div className={styles.footer}>
                <button type="button" className={styles.cancelBtn} onClick={onCancel} disabled={submitting}>
                  <X size={18} /> إلغاء
                </button>
                <button type="submit" className={styles.saveBtn} disabled={submitting}>
                  <Save size={18} />
                  {submitting ? "جارٍ الحفظ..." : isConvert ? "حفظ كفعالية فعلية" : "حفظ كفعالية مقترحة"}
                </button>
              </div>
            </form>
          </section>
        </div>
        <Footer />
      </div>
    </>
  );
}