"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "../CreateEvent.module.css";
import { useRouter, useParams } from "next/navigation";
import { ArrowRight, Save } from "lucide-react";
import Footer from "@/app/FacLevel/components/Footer";
import Header from "@/app/FacLevel/components/Header";

/** ================== API ================== */
const API_URL = "http://localhost:8000";

type ApiFaculty = { faculty_id: number; name: string };

type ApiEventDetails = {
  event_id: number;
  title: string;
  description: string;
  dept: number;
  cost: string;
  location: string;
  restrictions: string;
  reward: string;
  imgs: string;
  st_date: string;
  end_date: string;
  s_limit: number;
  type: string;
  resource: string;
  selected_facs: number[];
  active: boolean;
};

type ManageEventPayload = {
  title: string;
  description: string;
  dept: number;
  cost: string;
  location: string;
  restrictions: string;
  reward: string;
  imgs: string;
  st_date: string;
  end_date: string;
  s_limit: number;
  type: string;
  resource: string;
  selected_facs: number[];
};

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
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * dept في التوكن عندك ساعات بيطلع dept_ids فاضي
 * فهنا بنحاول:
 * 1) departments[0].dept_id
 * 2) dept_ids[0]
 * 3) dept_id
 * 4) dept
 */
function getDeptFromToken(): number | null {
  const token = getAccessToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const departments = payload?.departments;
  const deptId1 = Array.isArray(departments) ? departments?.[0]?.dept_id : undefined;

  const deptIds = payload?.dept_ids;
  const deptId2 = Array.isArray(deptIds) ? deptIds?.[0] : undefined;

  const deptId3 = payload?.dept_id;
  const deptId4 = payload?.dept;

  const candidate = deptId1 ?? deptId2 ?? deptId3 ?? deptId4;

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
    ...(opts.headers as any),
  };

  // لو body JSON نحط content-type
  if (!headers["Content-Type"] && opts.body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
    const text = await res.text();
    const maybeJson = text
      ? (() => {
          try {
            return JSON.parse(text);
          } catch {
            return text;
          }
        })()
      : null;

    if (!res.ok) {
      const msg =
        (typeof maybeJson === "object" &&
          maybeJson &&
          (maybeJson.detail || maybeJson.message || maybeJson.error)) ||
        (typeof maybeJson === "string" ? maybeJson : "") ||
        `طلب غير ناجح (${res.status})`;
      return { ok: false, message: String(msg), status: res.status, raw: maybeJson };
    }

    return { ok: true, data: maybeJson as T };
  } catch (e: any) {
    return { ok: false, message: e?.message || "مشكلة في الاتصال" };
  }
}

/** ================== UI Types ================== */
type Faculty = { id: number; name: string };

type FormState = {
  title: string;
  st_date: string;
  end_date: string;
  location: string;
  s_limit: number;
  cost: string;
  description: string;

  type: string;
  restrictions: string;
  reward: string;
  resource: string;

  // imgs مؤقتًا مش في UI (بس هنفضل نبعت string فاضية)
  imgs: string;
};

type FormErrors = Partial<Record<keyof FormState | "selected_facs", string>>;

export default function EventForm({
  mode,
  id,
}: {
  mode: "create" | "edit";
  id?: string;
}) {
  const router = useRouter();
  const params = useParams();
  const routeId = params?.id as string | undefined;
  const eventId = id ?? routeId; // يدعم الاتنين
  const isEditMode = mode === "edit" && !!eventId;

  /** ===== Faculties from API ===== */
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loadingFacs, setLoadingFacs] = useState(false);

  const [selectedFacultyIds, setSelectedFacultyIds] = useState<number[]>([]);
  const allSelected = faculties.length > 0 && selectedFacultyIds.length === faculties.length;
  const someSelected = selectedFacultyIds.length > 0 && !allSelected;

  /** ===== Form ===== */
  const [form, setForm] = useState<FormState>({
    title: "",
    st_date: "",
    end_date: "",
    location: "",
    s_limit: 100,
    cost: "",
    description: "",

    type: "",
    restrictions: "",
    reward: "",
    resource: "",

    imgs: "", // مؤقتًا
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(false);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const toggleAll = () => {
    setSelectedFacultyIds(allSelected ? [] : faculties.map((f) => f.id));
    setErrors((p) => ({ ...p, selected_facs: undefined }));
  };

  const toggleOne = (fid: number) => {
    setSelectedFacultyIds((prev) => (prev.includes(fid) ? prev.filter((x) => x !== fid) : [...prev, fid]));
    setErrors((p) => ({ ...p, selected_facs: undefined }));
  };

  /** ===== Validation ===== */
  const validate = (): FormErrors => {
    const next: FormErrors = {};

    if (!form.title.trim()) next.title = "عنوان الفعالية مطلوب";
    if (!form.st_date) next.st_date = "تاريخ البداية مطلوب";
    if (!form.end_date) next.end_date = "تاريخ النهاية مطلوب";
    if (form.st_date && form.end_date && form.st_date > form.end_date) next.end_date = "تاريخ النهاية لازم يكون بعد/يساوي تاريخ البداية";

    if (!form.location.trim()) next.location = "المكان مطلوب";

    if (!Number.isFinite(form.s_limit) || form.s_limit < 1) next.s_limit = "الحد الأقصى للمشاركين لازم يكون رقم أكبر من 0";

    const costNum = Number(String(form.cost).replaceAll(",", "").trim());
    if (String(form.cost).trim() && (Number.isNaN(costNum) || costNum < 0)) next.cost = "التكلفة لازم تكون رقم أكبر أو يساوي 0";

    if (!form.description.trim()) next.description = "الوصف مطلوب";

    if (!form.type.trim()) next.type = "نوع النشاط مطلوب";

    if (selectedFacultyIds.length === 0) next.selected_facs = "اختاري كلية واحدة على الأقل";

    return next;
  };

  /** ===== Load Faculties ===== */
  useEffect(() => {
    (async () => {
      setLoadingFacs(true);
      const res = await apiFetch<ApiFaculty[]>("/api/solidarity/super_dept/faculties/", { method: "GET" });
      setLoadingFacs(false);

      if (!res.ok) {
        window.alert(res.message);
        return;
      }

      const list = Array.isArray(res.data) ? res.data : [];
      const mapped: Faculty[] = list.map((f) => ({ id: f.faculty_id, name: f.name }));
      setFaculties(mapped);
    })();
  }, []);

  /** ===== Load event details for edit ===== */
  useEffect(() => {
    if (!isEditMode || !eventId) return;

    (async () => {
      setLoadingEvent(true);
      const res = await apiFetch<ApiEventDetails>(`/api/event/get-events/${eventId}/`, { method: "GET" });
      setLoadingEvent(false);

      if (!res.ok) {
        window.alert(res.message);
        return;
      }

      const e = res.data;

      setForm((p) => ({
        ...p,
        title: e?.title ?? "",
        st_date: e?.st_date ?? "",
        end_date: e?.end_date ?? "",
        location: e?.location ?? "",
        s_limit: Number(e?.s_limit ?? 100),
        cost: String(e?.cost ?? ""),
        description: e?.description ?? "",
        type: e?.type ?? "",
        restrictions: e?.restrictions ?? "",
        reward: e?.reward ?? "",
        resource: e?.resource ?? "",
        imgs: e?.imgs ?? "",
      }));

      setSelectedFacultyIds(Array.isArray(e?.selected_facs) ? e.selected_facs : []);
    })();
  }, [isEditMode, eventId]);

  /** ===== Submit ===== */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const dept = getDeptFromToken();
    if (!dept) {
      window.alert("مش قادر أحدد القسم من التوكن (dept).");
      return;
    }

    const payload: ManageEventPayload = {
      title: form.title.trim(),
      description: form.description.trim(),
      dept,
      cost: String(form.cost).trim() || "0",
      location: form.location.trim(),
      restrictions: form.restrictions.trim(),
      reward: form.reward.trim(),
      imgs: form.imgs?.trim?.() ?? "", // مؤقتًا
      st_date: form.st_date,
      end_date: form.end_date,
      s_limit: Number(form.s_limit),
      type: form.type.trim(),
      resource: form.resource.trim(),
      selected_facs: selectedFacultyIds,
    };

    setSubmitting(true);

    if (isEditMode) {
      const res = await apiFetch<any>(`/api/event/manage-events/${eventId}/`, {
        method: "PATCH", 
        body: JSON.stringify(payload),
      });
      setSubmitting(false);

      if (!res.ok) {
        window.alert(res.message);
        return;
      }
    } else {
      const res = await apiFetch<any>("/api/event/manage-events/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setSubmitting(false);

      if (!res.ok) {
        window.alert(res.message);
        return;
      }
    }

    router.push("/uni-level-activities");
  };

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>{isEditMode ? "تعديل الفعالية" : "إنشاء فعالية جديدة"}</h1>
            <p className={styles.subtitle}>
              {isEditMode ? "قومي بتعديل البيانات ثم حفظ" : "قومي بملء البيانات لإنشاء فعالية جديدة"}
            </p>
          </div>

          <button className={styles.backBtn} onClick={() => router.back()} type="button">
            <ArrowRight size={18} />
            رجوع
          </button>
        </header>

        {(loadingEvent || loadingFacs) && (
          <div style={{ fontWeight: 800, opacity: 0.8, marginBottom: 10 }}>
            جاري تحميل البيانات...
          </div>
        )}

        <form className={styles.card} onSubmit={onSubmit} noValidate>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label}>عنوان الفعالية</label>
              <input
                className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
                placeholder="عنوان الفعالية"
                value={form.title}
                onChange={(ev) => setField("title", ev.target.value)}
              />
              {errors.title && <div className={styles.errorText}>{errors.title}</div>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>نوع النشاط</label>
              <input
                className={`${styles.input} ${errors.type ? styles.inputError : ""}`}
                placeholder="مثال: نشاط ثقافي"
                value={form.type}
                onChange={(ev) => setField("type", ev.target.value)}
              />
              {errors.type && <div className={styles.errorText}>{errors.type}</div>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>تاريخ البداية</label>
              <input
                className={`${styles.input} ${errors.st_date ? styles.inputError : ""}`}
                type="date"
                value={form.st_date}
                onChange={(ev) => setField("st_date", ev.target.value)}
              />
              {errors.st_date && <div className={styles.errorText}>{errors.st_date}</div>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>تاريخ النهاية</label>
              <input
                className={`${styles.input} ${errors.end_date ? styles.inputError : ""}`}
                type="date"
                value={form.end_date}
                onChange={(ev) => setField("end_date", ev.target.value)}
              />
              {errors.end_date && <div className={styles.errorText}>{errors.end_date}</div>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>المكان</label>
              <input
                className={`${styles.input} ${errors.location ? styles.inputError : ""}`}
                placeholder="المكان"
                value={form.location}
                onChange={(ev) => setField("location", ev.target.value)}
              />
              {errors.location && <div className={styles.errorText}>{errors.location}</div>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>الحد الأقصى للمشاركين</label>
              <input
                className={`${styles.input} ${styles.numberInput} ${errors.s_limit ? styles.inputError : ""}`}
                type="number"
                min={1}
                value={form.s_limit}
                onChange={(ev) => setField("s_limit", Number(ev.target.value))}
              />
              {errors.s_limit && <div className={styles.errorText}>{errors.s_limit}</div>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>التكلفة</label>
              <input
                className={`${styles.input} ${styles.numberInput} ${errors.cost ? styles.inputError : ""}`}
                type="number"
                min={0}
                value={form.cost}
                onChange={(ev) => setField("cost", ev.target.value)}
              />
              {errors.cost && <div className={styles.errorText}>{errors.cost}</div>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>الموارد</label>
              <input
                className={`${styles.input} ${errors.resource ? styles.inputError : ""}`}
                placeholder="اختياري"
                value={form.resource}
                onChange={(ev) => setField("resource", ev.target.value)}
              />
              {errors.resource && <div className={styles.errorText}>{errors.resource}</div>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>القيود</label>
              <input
                className={`${styles.input} ${errors.restrictions ? styles.inputError : ""}`}
                placeholder="اختياري"
                value={form.restrictions}
                onChange={(ev) => setField("restrictions", ev.target.value)}
              />
              {errors.restrictions && <div className={styles.errorText}>{errors.restrictions}</div>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>المكافأة</label>
              <input
                className={`${styles.input} ${errors.reward ? styles.inputError : ""}`}
                placeholder="اختياري"
                value={form.reward}
                onChange={(ev) => setField("reward", ev.target.value)}
              />
              {errors.reward && <div className={styles.errorText}>{errors.reward}</div>}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>الوصف</label>
            <textarea
              className={`${styles.textarea} ${errors.description ? styles.inputError : ""}`}
              placeholder="الوصف"
              value={form.description}
              onChange={(ev) => setField("description", ev.target.value)}
              rows={5}
            />
            {errors.description && <div className={styles.errorText}>{errors.description}</div>}
          </div>
          
          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={() => router.back()} disabled={submitting}>
              إلغاء
            </button>

            <button type="submit" className={styles.saveBtn} disabled={submitting}>
              <Save size={18} />
              حفظ
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}