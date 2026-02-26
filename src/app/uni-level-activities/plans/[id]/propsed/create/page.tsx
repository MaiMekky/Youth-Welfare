"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./CreateProposed.module.css";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Save, X, MapPin, CalendarDays, DollarSign, Users, Lightbulb , Briefcase } from "lucide-react";

const API_URL = "http://localhost:8000";

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
  restrictions: string;
  reward: string;
  resource: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function getAccessToken(): string | null {
  return (
    localStorage.getItem("access") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    null
  );
}

function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getDeptFromToken(): number | null {
  const token = getAccessToken();
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const departments = payload?.departments;
  const deptId1 = Array.isArray(departments) ? departments?.[0]?.dept_id : undefined;

  const deptIds = payload?.dept_ids;
  const deptId2 = Array.isArray(deptIds) ? deptIds?.[0] : undefined;

  const candidate = deptId1 ?? deptId2;

  if (typeof candidate === "number") return candidate;

  if (typeof candidate === "string") {
    const n = Number(candidate);
    return Number.isFinite(n) ? n : null;
  }

  return null;
}

async function apiFetch<T>(
  path: string,
  opts: RequestInit = {}
): Promise<{ ok: true; data: T } | { ok: false; message: string; status?: number; raw?: any }> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as any),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
    const text = await res.text();
    const maybeJson = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;

    if (!res.ok) {
      const msg =
        (typeof maybeJson === "object" && maybeJson && (maybeJson.detail || maybeJson.message)) ||
        (typeof maybeJson === "string" ? maybeJson : "") ||
        `طلب غير ناجح (${res.status})`;
      return { ok: false, message: String(msg), status: res.status, raw: maybeJson };
    }

    return { ok: true, data: maybeJson as T };
  } catch (e: any) {
    return { ok: false, message: e?.message || "مشكلة في الاتصال" };
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
    restrictions: "",
    reward: "",
    resource: "",
  });

  const [seed, setSeed] = useState<FormState | null>(null);
  const [eventId, setEventId] = useState<number | null>(null);

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(false);

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

      const costNum = Number(String(data.cost).replaceAll(",", "").trim());
      if (data.cost.trim() && (Number.isNaN(costNum) || costNum < 0)) next.cost = "ادخلي تكلفة صحيحة";

      if (data.s_limit.trim()) {
        const limitNum = Number(String(data.s_limit).replaceAll(",", "").trim());
        if (!Number.isInteger(limitNum) || limitNum < 0) next.s_limit = "ادخلي رقم صحيح 0 أو أكبر";
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
    router.back();
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
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);

    if (!isConvert) {
      const dept = getDeptFromToken();
      if (!dept) {
        setSubmitting(false);
        window.alert("مش قادر أحدد القسم من التوكن");
        return;
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        dept,
        cost: String(form.cost).trim(),
        location: form.location.trim(),
        restrictions: form.restrictions.trim(),
        reward: form.reward.trim(),
        imgs: "", // مؤقتاً
        st_date: form.st_date.trim(),
        end_date: form.end_date.trim(),
        s_limit: form.s_limit.trim() ? Number(form.s_limit) : 0,
        type: form.type.trim(),
        resource: form.resource.trim(),
        plan: Number(planId),
      };

      const res = await apiFetch<any>("/api/event/manage-events/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSubmitting(false);

      if (!res.ok) {
        console.error("خطأ إنشاء فعالية مقترحة:", res);
        window.alert(res.message);
        return;
      }

      router.push(`/uni-level-activities/plans/${planId}`);
      return;
    }

    if (!eventId) {
      setSubmitting(false);
      window.alert("لا يوجد رقم فعالية للتحويل");
      return;
    }

    const payload2 = {
      event_id: eventId,
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type.trim(),
      st_date: form.st_date.trim(),
      end_date: form.end_date.trim(),
      location: form.location.trim(),
      s_limit: form.s_limit.trim() ? Number(form.s_limit) : 0,
      cost: String(form.cost).trim(),
      restrictions: form.restrictions.trim(),
      reward: form.reward.trim(),
    };

    const res2 = await apiFetch<any>(`/api/events/plans/${planId}/add-event/`, {
      method: "POST",
      body: JSON.stringify(payload2),
    });

    setSubmitting(false);

    if (!res2.ok) {
      console.error("خطأ إضافة فعالية للخطة:", res2);
      window.alert(res2.message);
      return;
    }

  sessionStorage.setItem(`converted_${planId}_${eventId}`, "1");

  sessionStorage.removeItem("convert_proposed_payload");

    router.push(`/uni-level-activities/plans/${planId}`);
  };

  useEffect(() => {
    if (!isConvert) return;

    const raw = sessionStorage.getItem("convert_proposed_payload");
    if (!raw) return;

    let parsed: any = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }

    const id =
      parsed?.event?.event_id ??
      parsed?.event?.id ??
      parsed?.row?.event_id ??
      parsed?.row?.id ??
      parsed?.event_id ??
      parsed?.id ??
      null;

    const fallbackRow = parsed?.event ?? parsed?.row ?? parsed ?? {};

    const prefilledFromPayload: FormState = {
      title: fallbackRow?.title ?? "",
      description: fallbackRow?.description ?? "",
      location: fallbackRow?.location ?? "",
      st_date: fallbackRow?.st_date ?? "",
      end_date: fallbackRow?.end_date ?? "",
      cost: String(fallbackRow?.cost ?? ""),
      s_limit: String(fallbackRow?.s_limit ?? ""),
      type: fallbackRow?.type ?? "",
      restrictions: fallbackRow?.restrictions ?? "",
      reward: fallbackRow?.reward ?? "",
      resource: fallbackRow?.resource ?? "",
    };

    setSeed(prefilledFromPayload);
    setForm((p) => ({ ...p, ...prefilledFromPayload }));

    if (!id) return;

    setLoadingEvent(true);

    (async () => {
      const res = await apiFetch<any>(`/api/event/get-events/${id}/`, { method: "GET" });
      setLoadingEvent(false);

      if (!res.ok) {
        window.alert(res.message);
        return;
      }

      const e = (res.data as any)?.data ?? res.data;

      const prefilled: FormState = {
        title: e?.title ?? "",
        description: e?.description ?? "",
        location: e?.location ?? "",
        st_date: e?.st_date ?? "",
        end_date: e?.end_date ?? "",
        cost: e?.cost ?? "",
        s_limit: String(e?.s_limit ?? ""),
        type: e?.type ?? "",
        restrictions: e?.restrictions ?? "",
        reward: e?.reward ?? "",
        resource: e?.resource ?? "",
      };

      setEventId(Number(e?.event_id ?? id));
      setSeed(prefilled);
      setForm((p) => ({ ...p, ...prefilled }));
    })();
  }, [isConvert, planId]);

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
        <div className={styles.topBar}>
          <div className={styles.headText}>
            <h1 className={styles.pageTitle}>{isConvert ? "إنشاء فعالية فعلية" : "إضافة فعالية مقترحة"}</h1>
            <p className={styles.pageSubtitle}>
              {isConvert ? "يتم تحميل البيانات من الفعالية المقترحة ويمكن تعديلها" : "املئي البيانات الأساسية للفعالية"}
            </p>
          </div>

          <button className={styles.backBtn} onClick={() => router.back()} type="button">
            <ArrowRight size={18} />
            العودة للخطة
          </button>
        </div>

        <div className={styles.hero}>
          <div className={styles.heroTitle}>خطة رقم: {planId}</div>
        </div>

        <section className={styles.formCard}>
          {isConvert && seed && (
            <div className={styles.summaryBox}>
              <div className={styles.summaryHead}>
                <div className={styles.summaryIcon}>
                  <Lightbulb size={18} />
                </div>
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
              {isConvert ? "عدّلي القيم ثم اضغطي حفظ." : "هذه البيانات للتخطيط ويمكن تعديلها لاحقاً."}
            </div>
          </div>

          {isConvert && loadingEvent && (
            <div style={{ marginBottom: 12, fontWeight: 800, opacity: 0.8 }}>جاري تحميل البيانات...</div>
          )}

          <form className={styles.form} onSubmit={onSubmit} noValidate>
            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label}>
                  <Briefcase size={16} /> العنوان
                </label>
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
                <label className={styles.label}>
                  <MapPin size={16} /> المكان
                </label>
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
                <label className={styles.label}>
                  <CalendarDays size={16} /> تاريخ البداية
                </label>
                <input
                  className={`${styles.input} ${touched.st_date && errors.st_date ? styles.inputError : ""}`}
                  placeholder="YYYY-MM-DD"
                  value={form.st_date}
                  onChange={(e) => setField("st_date", e.target.value)}
                  onBlur={() => onBlur("st_date")}
                  dir="ltr"
                />
                {touched.st_date && errors.st_date && <div className={styles.errorText}>{errors.st_date}</div>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  <CalendarDays size={16} /> تاريخ النهاية
                </label>
                <input
                  className={`${styles.input} ${touched.end_date && errors.end_date ? styles.inputError : ""}`}
                  placeholder="YYYY-MM-DD"
                  value={form.end_date}
                  onChange={(e) => setField("end_date", e.target.value)}
                  onBlur={() => onBlur("end_date")}
                  dir="ltr"
                />
                {touched.end_date && errors.end_date && <div className={styles.errorText}>{errors.end_date}</div>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  <DollarSign size={16} /> التكلفة
                </label>
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
                <label className={styles.label}>
                  <Users size={16} /> الحد الأقصى للمشاركين
                </label>
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

              <div className={styles.field}>
                <label className={styles.label}>
                  <Lightbulb size={16} /> النوع
                </label>
                <input
                  className={`${styles.input} ${touched.type && errors.type ? styles.inputError : ""}`}
                  placeholder="مثال: نشاط فني"
                  value={form.type}
                  onChange={(e) => setField("type", e.target.value)}
                  onBlur={() => onBlur("type")}
                />
                {touched.type && errors.type && <div className={styles.errorText}>{errors.type}</div>}
              </div>

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

               <div className={styles.field} style={{ gridColumn: "1 / -1" }}>
                <label className={styles.label}>الوصف</label>
                <textarea
                  className={styles.input}
                  placeholder="اكتبي وصف مختصر"
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  onBlur={() => onBlur("description")}
                  rows={3}
                />
              </div>
            </div>

            <div className={styles.footer}>
              <button type="button" className={styles.cancelBtn} onClick={onCancel} disabled={submitting}>
                <X size={18} />
                إلغاء
              </button>

              <button type="submit" className={styles.saveBtn} disabled={submitting}>
                <Save size={18} />
                {isConvert ? "حفظ كفعالية فعلية" : "حفظ كفعالية مقترحة"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}