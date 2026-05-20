"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Save } from "lucide-react";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";
import styles from "./styles/create.module.css";

const API_URL = `${getBaseUrl()}/api`;

interface Faculty {
  faculty_id: number;
  name: string;
}

interface Department {
  dept_id: number;
  name: string;
}

interface CommitteeState {
  committee_key: string;
  dept_id: string;                        // ← shared for the whole committee
  head:      { uid: string };
  assistant: { uid: string };
}

const COMMITTEES = [
  { key: "cultural",   name: "اللجنة الثقافية" },
  { key: "newspaper",  name: "لجنة صحف الحائط" },
  { key: "social",     name: "لجنة الأنشطة الاجتماعية والرحلات" },
  { key: "arts",       name: "اللجنة الفنية" },
  { key: "scientific", name: "اللجنة العلمية" },
  { key: "service",    name: "لجنة الخدمة العامة والمعسكرات" },
  { key: "sports",     name: "اللجنة الرياضية" },
];

// ───────────────────────── error flattener ─────────────────────────

/** Recursively flatten any Django DRF error structure into a single string. */
function flattenError(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value))     return value.map(flattenError).join(" ");
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map(flattenError)
      .join(" | ");
  }
  return String(value ?? "");
}

/** Turn a backend error response body into a human-readable message. */
function parseBackendError(errorData: unknown): string {
  if (typeof errorData === "string") return errorData;
  if (Array.isArray(errorData))      return errorData.map(flattenError).join(" ");
  if (errorData && typeof errorData === "object") {
    const obj = errorData as Record<string, unknown>;
    // Prefer top-level `detail` / `message` if present and string
    if (typeof obj.detail  === "string") return obj.detail;
    if (typeof obj.message === "string") return obj.message;
    // Otherwise flatten everything
    return Object.values(obj).map(flattenError).join(" | ");
  }
  return "فشل إنشاء الاتحاد";
}

// ───────────────────────── validation helpers ─────────────────────────

interface FormErrors {
  name?: string;
  description?: string;
  president_nid?: string;
  vice_president_nid?: string;
  committees: {
    [key: string]: {
      dept?: string;
      head_uid?: string;
      assistant_uid?: string;
    };
  };
}

function validateNID(value: string): string | undefined {
  if (!value.trim()) return "هذا الحقل مطلوب";
  if (!/^\d+$/.test(value)) return "يجب أن يحتوي على أرقام فقط";
  // if (value.length !== 14)
  //   return "رقم الهوية يجب أن يكون 14 رقماً بالضبط";
  return undefined;
}

function validateUID(value: string): string | undefined {
  if (!value.trim()) return "هذا الحقل مطلوب";
  if (!/^\d+$/.test(value)) return "يجب أن يحتوي على أرقام فقط";
  // if (value.length < 4) return "رقم الجامعة يجب أن يكون 4 أرقام على الأقل";
  return undefined;
}

function buildErrors(
  formData: { name: string; description: string; president_nid: string; vice_president_nid: string },
  committees: CommitteeState[]
): FormErrors {
  const errors: FormErrors = { committees: {} };

  if (!formData.name.trim())
    errors.name = "اسم الاتحاد مطلوب";
  else if (formData.name.trim().length < 5)
    errors.name = "يجب أن يكون الاسم 5 أحرف على الأقل";

  if (!formData.description.trim())
    errors.description = "وصف الاتحاد مطلوب";
  else if (formData.description.trim().length < 10)
    errors.description = "يجب أن يكون الوصف 10 أحرف على الأقل";

  const presErr = validateNID(formData.president_nid);
  if (presErr) errors.president_nid = presErr;

  const viceErr = validateNID(formData.vice_president_nid);
  if (viceErr) errors.vice_president_nid = viceErr;

  if (
    !errors.president_nid &&
    !errors.vice_president_nid &&
    formData.president_nid === formData.vice_president_nid
  ) {
    errors.vice_president_nid = "لا يمكن أن يكون نائب الرئيس هو نفس الرئيس";
  }

  // Validate committees
  committees.forEach((c) => {
    const cErr: FormErrors["committees"][string] = {};

    if (!c.dept_id) cErr.dept = "يرجى اختيار القسم";

    const headUidErr = validateUID(c.head.uid);
    if (headUidErr) cErr.head_uid = headUidErr;

    const asstUidErr = validateUID(c.assistant.uid);
    if (asstUidErr) cErr.assistant_uid = asstUidErr;

    if (!cErr.head_uid && !cErr.assistant_uid && c.head.uid === c.assistant.uid) {
      cErr.assistant_uid = "لا يمكن أن يكون المساعد هو نفس الرئيس في هذه اللجنة";
    }

    if (Object.keys(cErr).length > 0) errors.committees[c.committee_key] = cErr;
  });

  // Cross-validation: Check for duplicate UIDs across all committees
  const allUids: Record<string, string> = {};
  committees.forEach((c) => {
    const headUid = c.head.uid.trim();
    const asstUid = c.assistant.uid.trim();
    
    if (headUid && !errors.committees[c.committee_key]?.head_uid) {
      if (allUids[headUid]) {
        if (!errors.committees[c.committee_key]) errors.committees[c.committee_key] = {};
        errors.committees[c.committee_key].head_uid = `هذا الكود مستخدم بالفعل في ${allUids[headUid]}`;
      } else {
        allUids[headUid] = `${c.committee_key} (رئيس)`;
      }
    }
    
    if (asstUid && !errors.committees[c.committee_key]?.assistant_uid) {
      if (allUids[asstUid]) {
        if (!errors.committees[c.committee_key]) errors.committees[c.committee_key] = {};
        errors.committees[c.committee_key].assistant_uid = `هذا الكود مستخدم بالفعل في ${allUids[asstUid]}`;
      } else {
        allUids[asstUid] = `${c.committee_key} (مساعد)`;
      }
    }
  });

  return errors;
}

function hasErrors(errors: FormErrors): boolean {
  if (errors.name || errors.description || errors.president_nid || errors.vice_president_nid)
    return true;
  return Object.keys(errors.committees).length > 0;
}

// ───────────────────────── main component ─────────────────────────

function CreateUnionContent() {
  const router     = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [faculties,   setFaculties]   = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name:               "",
    description:        "",
    faculty_id:         searchParams.get("faculty") || "",
    president_nid:      "",
    vice_president_nid: "",
  });

  const [committees, setCommittees] = useState<CommitteeState[]>(
    COMMITTEES.map((c) => ({
      committee_key: c.key,
      dept_id:   "",                        // ← one shared dept per committee
      head:      { uid: "" },
      assistant: { uid: "" },
    }))
  );

  const [errors, setErrors] = useState<FormErrors>({ committees: {} });

  useEffect(() => {
    if (submitted) setErrors(buildErrors(formData, committees));
  }, [formData, committees, submitted]);

  const fetchFaculties = useCallback(async () => {
    try {
      const res = await authFetch(`${API_URL}/family/faculties/`);
      if (!res.ok) return;
      setFaculties(await res.json());
    } catch { /* ignore */ }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await authFetch(`${API_URL}/family/departments/`);
      if (!res.ok) return;
      setDepartments(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchFaculties();
    fetchDepartments();
  }, [fetchFaculties, fetchDepartments]);

  const handleInputChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleCommitteeChange = (
    index: number,
    role: "head" | "assistant",
    value: string
  ) => {
    setCommittees((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [role]: { uid: value } };
      return updated;
    });
  };

  const handleCommitteeDept = (index: number, value: string) => {
    setCommittees((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], dept_id: value };
      return updated;
    });
  };

  // ── submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const validationErrors = buildErrors(formData, committees);
    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      showToast("يرجى تصحيح الأخطاء قبل الإرسال", "error");
      const firstError = document.querySelector(`.${styles.errorMsg}`);
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name:               formData.name.trim(),
        description:        formData.description.trim(),
        faculty_id:         formData.faculty_id ? parseInt(formData.faculty_id) : null,
        president_nid:      parseInt(formData.president_nid),
        vice_president_nid: parseInt(formData.vice_president_nid),
        committees: committees.map((c) => ({
          committee_key: c.committee_key,
          head: {
            uid:     parseInt(c.head.uid) || 0,
            dept_id: parseInt(c.dept_id) || 0,
          },
          assistant: {
            uid:     parseInt(c.assistant.uid) || 0,
            dept_id: parseInt(c.dept_id) || 0,
          },
        })),
      };

      // Validate no NaN or 0 values before sending
      if (isNaN(payload.president_nid) || payload.president_nid === 0) {
        throw new Error("رقم هوية رئيس الاتحاد غير صالح");
      }
      if (isNaN(payload.vice_president_nid) || payload.vice_president_nid === 0) {
        throw new Error("رقم هوية نائب رئيس الاتحاد غير صالح");
      }
      
      payload.committees.forEach((c, idx) => {
        if (c.head.uid === 0 || c.assistant.uid === 0) {
          throw new Error(`بيانات اللجنة ${COMMITTEES[idx].name} غير مكتملة`);
        }
        if (c.head.dept_id === 0 || c.assistant.dept_id === 0) {
          throw new Error(`يرجى اختيار القسم للجنة ${COMMITTEES[idx].name}`);
        }
      });

      console.log("=== Submitting Union Creation ===");
      console.log("Payload:", JSON.stringify(payload, null, 2));
      console.log("Number of committees:", payload.committees.length);

      const response = await authFetch(`${API_URL}/family/unions/`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const errorData = await response.json();
          console.error("Backend error response:", errorData);
          console.error("Payload sent:", payload);
          throw new Error(parseBackendError(errorData));
        } else {
          const text = await response.text();
          console.error("Non-JSON error response:", text);
          console.error("Payload sent:", payload);
          throw new Error(text || `خطأ في الخادم (${response.status})`);
        }
      }

      const data = await response.json();
      showToast("تم إنشاء الاتحاد بنجاح ✓", "success");
      router.push(`/uni-level-family/unions/${data.family_id}`);
    } catch (error) {
      console.error("Error creating union:", error);
      showToast(error instanceof Error ? error.message : "فشل إنشاء الاتحاد", "error");
    } finally {
      setLoading(false);
    }
  };

  const getCommitteeErrors = (key: string) => errors.committees[key] || {};

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()} type="button">
          <ArrowRight size={20} />
        </button>
        <div>
          <h1 className={styles.title}>إنشاء اتحاد جديد</h1>
          <p className={styles.subtitle}>قم بإدخال بيانات الاتحاد وأعضاء اللجان</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>

        {/* Error Summary Banner */}
        {submitted && hasErrors(errors) && (
          <div className={styles.errorBanner}>
            <span className={styles.errorBannerIcon}>⚠</span>
            <div>
              <strong>يوجد أخطاء في النموذج — يرجى المراجعة والتصحيح</strong>
              <ul className={styles.errorList}>
                {errors.name && <li>اسم الاتحاد: {errors.name}</li>}
                {errors.description && <li>الوصف: {errors.description}</li>}
                {errors.president_nid && <li>رئيس الاتحاد: {errors.president_nid}</li>}
                {errors.vice_president_nid && <li>نائب الرئيس: {errors.vice_president_nid}</li>}
                {Object.keys(errors.committees).length > 0 && (
                  <li>يوجد {Object.keys(errors.committees).length} خطأ في بيانات اللجان</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* ── Basic Info ── */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>المعلومات الأساسية</h2>
          <div className={styles.formGrid}>

            <div className={styles.formGroup}>
              <label className={styles.label}>اسم الاتحاد *</label>
              <input
                type="text"
                className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="مثال: اتحاد طلاب كلية الهندسة"
              />
              {errors.name && <span className={styles.errorMsg}>{errors.name}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>الكلية</label>
              <select
                className={styles.select}
                value={formData.faculty_id}
                onChange={(e) => handleInputChange("faculty_id", e.target.value)}
              >
                <option value="">اتحاد عام (بدون كلية)</option>
                {faculties.map((f) => (
                  <option key={f.faculty_id} value={f.faculty_id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
              <label className={styles.label}>الوصف *</label>
              <textarea
                className={`${styles.textarea} ${errors.description ? styles.inputError : ""}`}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="وصف مختصر عن الاتحاد وأهدافه"
                rows={4}
              />
              {errors.description && (
                <span className={styles.errorMsg}>{errors.description}</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Leadership ── */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>القيادة</h2>
          <div className={styles.formGrid}>

            <div className={styles.formGroup}>
              <label className={styles.label}>رقم هوية رئيس الاتحاد *</label>
              <input
                type="text"
                inputMode="numeric"
                className={`${styles.input} ${errors.president_nid ? styles.inputError : ""}`}
                value={formData.president_nid}
                onChange={(e) =>
                  handleInputChange("president_nid", e.target.value.replace(/\D/g, ""))
                }
                placeholder="أدخل رقم الهوية"
                maxLength={14}
              />
              {errors.president_nid && (
                <span className={styles.errorMsg}>{errors.president_nid}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>رقم هوية نائب رئيس الاتحاد *</label>
              <input
                type="text"
                inputMode="numeric"
                className={`${styles.input} ${errors.vice_president_nid ? styles.inputError : ""}`}
                value={formData.vice_president_nid}
                onChange={(e) =>
                  handleInputChange("vice_president_nid", e.target.value.replace(/\D/g, ""))
                }
                placeholder="أدخل رقم الهوية"
                maxLength={14}
              />
              {errors.vice_president_nid && (
                <span className={styles.errorMsg}>{errors.vice_president_nid}</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Committees ── */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>اللجان (7 لجان)</h2>
          <div className={styles.committeesGrid}>
            {COMMITTEES.map((committee, index) => {
              const cErr = getCommitteeErrors(committee.key);
              return (
                <div key={committee.key} className={styles.committeeCard}>
                  <h3 className={styles.committeeTitle}>{committee.name}</h3>

                  {/* ── Shared dept (once per card) ── */}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>القسم *</label>
                    <select
                      className={`${styles.select} ${cErr.dept ? styles.inputError : ""}`}
                      value={committees[index].dept_id}
                      onChange={(e) => handleCommitteeDept(index, e.target.value)}
                    >
                      <option value="">اختر القسم</option>
                      {departments.map((d) => (
                        <option key={d.dept_id} value={d.dept_id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    {cErr.dept && <span className={styles.errorMsg}>{cErr.dept}</span>}
                  </div>

                  {/* Head */}
                  <div className={styles.committeeSection}>
                    <h4 className={styles.committeeSubtitle}>رئيس اللجنة</h4>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>رقم الجامعة (UID)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        className={`${styles.input} ${cErr.head_uid ? styles.inputError : ""}`}
                        value={committees[index].head.uid}
                        onChange={(e) =>
                          handleCommitteeChange(index, "head", e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="UID"
                      />
                      {cErr.head_uid && (
                        <span className={styles.errorMsg}>{cErr.head_uid}</span>
                      )}
                    </div>
                  </div>

                  {/* Assistant */}
                  <div className={styles.committeeSection}>
                    <h4 className={styles.committeeSubtitle}>مساعد رئيس اللجنة</h4>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>رقم الجامعة (UID)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        className={`${styles.input} ${cErr.assistant_uid ? styles.inputError : ""}`}
                        value={committees[index].assistant.uid}
                        onChange={(e) =>
                          handleCommitteeChange(
                            index,
                            "assistant",
                            e.target.value.replace(/\D/g, "")
                          )
                        }
                        placeholder="UID"
                      />
                      {cErr.assistant_uid && (
                        <span className={styles.errorMsg}>{cErr.assistant_uid}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => router.back()}
            disabled={loading}
          >
            إلغاء
          </button>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <>
                <div className={styles.spinner} />
                <span>جاري الإنشاء...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>إنشاء الاتحاد</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreateUnionPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p>جاري التحميل...</p>
        </div>
      }
    >
      <CreateUnionContent />
    </Suspense>
  );
}