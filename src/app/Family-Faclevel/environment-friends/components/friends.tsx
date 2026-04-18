"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/friends.module.css";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import {
  User,
  Users,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Send,
  CheckCircle,
  FileText,
} from "lucide-react";

/* ─── Types ─── */
type NotificationType = "success" | "error";
type Member = { nid: string };

interface AssistantItem {
  name?: string;
  nid?: string;
  ph_no?: string;
  uid?: string;
  [key: string]: unknown;
}

type AssistantRole =
  | "رائد"
  | "نائب_رائد"
  | "مسؤول"
  | "أمين_صندوق"
  | "أخ_أكبر"
  | "أخت_كبرى"
  | "أمين_سر"
  | "عضو_منتخب_1"
  | "عضو_منتخب_2";

type AssistantsState = {
  رائد: { name: string; nid: string; ph_no: string };
  نائب_رائد: { name: string; nid: string; ph_no: string };
  مسؤول: { name: string; nid: string; ph_no: string };
  أمين_صندوق: { name: string; nid: string; ph_no: string };
  أخ_أكبر: { uid: string };
  أخت_كبرى: { uid: string };
  أمين_سر: { uid: string };
  عضو_منتخب_1: { uid: string };
  عضو_منتخب_2: { uid: string };
};

type Activity = {
  title: string;
  description: string;
  st_date: string;
  end_date: string;
  location: string;
  cost: string;
};

type Committee = {
  committee_key: string;
  head: { uid: string; dept_id: string };
  assistant: { uid: string; dept_id: string };
  activities: Activity[];
};

type Department = { dept_id: number; name: string };

/* ─── Constants ─── */
const committeeNames: Record<string, string> = {
  "public-service": "لجنة الخدمة العامة",
  "environmental-pollution": "لجنة التلوث البيئي وسلوكيات البيئة",
  "community-service": "لجنة خدمة المجتمع وتنمية البيئة",
  "public-relations": "لجنة العلاقات العامة",
};

const FULL_INFO_ROLES: AssistantRole[] = [
  "رائد",
  "نائب_رائد",
  "مسؤول",
  "أمين_صندوق",
];
const UID_ROLES: AssistantRole[] = [
  "أخ_أكبر",
  "أخت_كبرى",
  "أمين_سر",
  "عضو_منتخب_1",
  "عضو_منتخب_2",
];
const MAX_MIN_LIMIT = 150;

const STEPS = [
  { label: "معلومات عامة", icon: FileText },
  { label: "الأعضاء", icon: Users },
  { label: "مجلس الإدارة", icon: User },
  { label: "اللجان", icon: Users },
];

/* ─── Arabic API-error map ─── */
const AR_ERRORS: Record<string, string> = {
  invalid: "قيمة غير صالحة",
  unique: "هذه القيمة مستخدمة بالفعل",
  required: "هذا الحقل مطلوب",
  null: "لا يمكن أن يكون هذا الحقل فارغاً",
  blank: "لا يمكن أن يكون هذا الحقل فارغاً",
  does_not_exist: "لم يتم العثور على هذا المستخدم",
  not_found: "لم يتم العثور على السجل",
  permission_denied: "غير مصرح بهذه العملية",
  already_exists: "هذا السجل موجود بالفعل",
  throttled: "الرجاء الانتظار قبل المحاولة مرة أخرى",
  max_length: "القيمة أطول من الحد المسموح",
  min_length: "القيمة أقصر من الحد المسموح",
  invalid_choice: "اختيار غير صالح",
};

function parseApiErrors(err: unknown): string[] {
  if (!err || typeof err !== "object") return ["حدث خطأ غير متوقع"];
  const messages: string[] = [];
  const extract = (obj: unknown, parentKey = ""): void => {
    if (typeof obj === "string") {
      const strMatch = obj.match(/string='([^']+)'/);
      const codeMatch = obj.match(/code='([^']+)'/);
      const clean = strMatch ? strMatch[1] : obj;
      const code = codeMatch?.[1];
      const display =
        code && AR_ERRORS[code] ? AR_ERRORS[code] : AR_ERRORS[clean] ?? clean;
      messages.push(parentKey ? `${parentKey}: ${display}` : display);
      return;
    }
    if (Array.isArray(obj)) {
      obj.forEach((i) => extract(i, parentKey));
      return;
    }
    if (typeof obj === "object" && obj !== null) {
      Object.entries(obj as Record<string, unknown>).forEach(([k, v]) => {
        if (["status", "status_code"].includes(k)) return;
        extract(v, k);
      });
    }
  };
  extract(err);
  return [...new Set(messages)].filter(Boolean);
}

/* ─── Student-ID validation ─── */
type UidStatus = "idle" | "checking" | "found" | "not_found" | "error";

interface UidFieldProps {
  label: string;
  value: string;
  errorKey: string;
  fieldErrors: Record<string, string>;
  onChange: (v: string) => void;
  duplicateOf?: string; // role name that already uses this UID
}

function UidField({
  label,
  value,
  errorKey,
  fieldErrors,
  onChange,
  duplicateOf,
}: UidFieldProps) {
  const [status, setStatus] = useState<UidStatus>("idle");
  const [studentName, setStudentName] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const checkUid = async (uid: string) => {
    if (!uid || !/^\d+$/.test(uid)) {
      setStatus("idle");
      setStudentName("");
      return;
    }
    setStatus("checking");
    setStudentName("");
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const res = await authFetch(
        `${getBaseUrl()}/api/auth/student-lookup/?uid=${uid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setStatus("found");
        setStudentName(data?.name || data?.full_name || "");
      } else if (res.status === 404) {
        setStatus("not_found");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const handleChange = (v: string) => {
    const clean = v.replace(/\D/g, "");
    onChange(clean);
    setStatus("idle");
    clearTimeout(timerRef.current);
    if (clean.length >= 4) {
      timerRef.current = setTimeout(() => checkUid(clean), 700);
    }
  };

  const hasErr = Boolean(fieldErrors[errorKey]);
  const isDuplicate = Boolean(duplicateOf);

  const inputClass = [
    styles["member-input"],
    hasErr || isDuplicate ? styles.inputError : "",
    status === "found" && !isDuplicate ? styles["cf-input--success"] : "",
    status === "not_found" ? styles["cf-input--warn"] : "",
  ]
    .filter(Boolean)
    .join(" ");

  const suffixContent = () => {
    if (isDuplicate)
      return (
        <span style={{ fontSize: 15, color: "var(--error)" }}>✕</span>
      );
    if (status === "checking") return <span className={styles["cf-spinner"]} />;
    if (status === "found")
      return (
        <span style={{ fontSize: 16, color: "var(--success)" }}>✓</span>
      );
    if (status === "not_found")
      return <span style={{ fontSize: 15, color: "var(--warn)" }}>⚠</span>;
    return null;
  };

  const feedbackContent = () => {
    if (isDuplicate)
      return (
        <Feedback type="error">
          هذا الكود مستخدم بالفعل لـ «{duplicateOf}» — لا يمكن تكرار الطالب في
          أدوار مختلفة
        </Feedback>
      );
    if (hasErr)
      return (
        <Feedback type="error">{fieldErrors[errorKey]}</Feedback>
      );
    if (status === "found")
      return (
        <Feedback type="success">
          {studentName ? `الطالب: ${studentName}` : "تم التحقق من الرقم الجامعي"}
        </Feedback>
      );
    if (status === "not_found")
      return (
        <Feedback type="warn">الرقم الجامعي غير موجود في قاعدة البيانات</Feedback>
      );
    if (status === "error")
      return (
        <Feedback type="warn">تعذر التحقق — يُرجى التحقق يدوياً</Feedback>
      );
    return null;
  };

  return (
    <div className={styles["member-form-group"]}>
      <label>
        {label} <span style={{ color: "var(--error)" }}>*</span>
      </label>
      <div className={styles["cf-input-wrap"]}>
        <input
          value={value}
          inputMode="numeric"
          maxLength={14}
          onChange={(e) => handleChange(e.target.value)}
          className={inputClass}
          placeholder="أدخل الرقم الجامعي"
        />
        {suffixContent() && (
          <span className={styles["cf-input-suffix"]}>{suffixContent()}</span>
        )}
      </div>
      {feedbackContent()}
    </div>
  );
}

/* ─── Feedback pill ─── */
function Feedback({
  type,
  children,
}: {
  type: "error" | "warn" | "success" | "info";
  children: React.ReactNode;
}) {
  const icons = { error: "✕", warn: "⚠", success: "✓", info: "ℹ" };
  const classes: Record<string, string> = {
    error: "cf-feedback--error",
    warn: "cf-feedback--warn",
    success: "cf-feedback--success",
    info: "cf-feedback--info",
  };
  return (
    <div
      className={`${styles["cf-feedback"]} ${styles[classes[type]]}`}
    >
      <span className={styles["cf-feedback-icon"]}>{icons[type]}</span>
      <span>{children}</span>
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
export default function FriendsForm() {
  const [currentStep, setCurrentStep] = useState(0);

  const initialGeneral = { name: "", description: "", min_limit: 15 };

  const initialAssistants: AssistantsState = {
    رائد: { name: "", nid: "", ph_no: "" },
    نائب_رائد: { name: "", nid: "", ph_no: "" },
    مسؤول: { name: "", nid: "", ph_no: "" },
    أمين_صندوق: { name: "", nid: "", ph_no: "" },
    أخ_أكبر: { uid: "" },
    أخت_كبرى: { uid: "" },
    أمين_سر: { uid: "" },
    عضو_منتخب_1: { uid: "" },
    عضو_منتخب_2: { uid: "" },
  };

  const initialCommittees: Committee[] = [
    "public-service",
    "environmental-pollution",
    "community-service",
    "public-relations",
  ].map((key) => ({
    committee_key: key,
    head: { uid: "", dept_id: "" },
    assistant: { uid: "", dept_id: "" },
    activities: [
      {
        title: "",
        description: "",
        st_date: "",
        end_date: "",
        location: "",
        cost: "",
      },
    ],
  }));

  const makeMembers = (n: number): Member[] =>
    Array.from({ length: n }, () => ({ nid: "" }));

  const [general, setGeneral] = useState(initialGeneral);
  const [members, setMembers] = useState<Member[]>(
    makeMembers(initialGeneral.min_limit)
  );
  const [assistants, setAssistants] =
    useState<AssistantsState>(initialAssistants);
  const [committees, setCommittees] =
    useState<Committee[]>(initialCommittees);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [openComm, setOpenComm] = useState<Record<number, boolean>>({});
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  /* ── Duplicate UID detection ── */
  const getDuplicateUidMap = (): Record<string, string> => {
    // Map of uid -> first role that claimed it
    const seen: Record<string, string> = {};
    const dupes: Record<string, string> = {}; // errorKey -> conflicting role label

    const roleLabel: Record<string, string> = {
      أخ_أكبر: "الأخ الأكبر",
      أخت_كبرى: "الأخت الكبرى",
      أمين_سر: "أمين السر",
      عضو_منتخب_1: "العضو المنتخب الأول",
      عضو_منتخب_2: "العضو المنتخب الثاني",
    };

    UID_ROLES.forEach((role) => {
      const a = assistants[role] as AssistantItem;
      const uid = (a.uid as string)?.trim();
      if (!uid) return;
      const key = `assistants.${role}.uid`;
      if (seen[uid]) {
        dupes[key] = roleLabel[seen[uid]] ?? seen[uid];
      } else {
        seen[uid] = role;
      }
    });

    // Also check committee UIDs against each other
    committees.forEach((c, ci) => {
      const hUid = c.head.uid?.trim();
      const aUid = c.assistant.uid?.trim();
      if (hUid && hUid === aUid) {
        dupes[`committees.${ci}.assistant.uid`] = committeeNames[c.committee_key] + " (الأمين)";
      }
    });

    return dupes;
  };

  /* ── helpers ── */
  const hasErr = (k: string) => Boolean(fieldErrors[k]);
  const clearErr = (k: string) =>
    setFieldErrors((p) => {
      const c = { ...p };
      delete c[k];
      return c;
    });
  const clearByPfx = (pfx: string) =>
    setFieldErrors((p) => {
      const c = { ...p };
      Object.keys(c)
        .filter((k) => k.startsWith(pfx))
        .forEach((k) => delete c[k]);
      return c;
    });

  const showNotif = (message: string, type: NotificationType) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const parseJWT = (token: string) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  };

  /* ── per-step validation ── */
  const validateStep = (step: number): Record<string, string> => {
    const e: Record<string, string> = {};

    if (step === 0) {
      if (!general.name.trim()) e["general.name"] = "اسم الأسرة مطلوب";
      if (!general.description.trim())
        e["general.description"] = "وصف الأسرة مطلوب";
      if (!general.min_limit || general.min_limit <= 0)
        e["general.min_limit"] = "الحد الأدنى للأعضاء غير صحيح";
      else if (general.min_limit > MAX_MIN_LIMIT)
        e["general.min_limit"] = `الحد الأقصى ${MAX_MIN_LIMIT} عضو`;
    }

    if (step === 1) {
      members.forEach((m, i) => {
        if (!m.nid.trim())
          e[`members.${i}.nid`] = `الرقم القومي للعضو ${i + 1} مطلوب`;
        else if (!/^\d{14}$/.test(m.nid))
          e[`members.${i}.nid`] = `الرقم القومي ${i + 1} يجب أن يكون 14 رقماً`;
      });
    }

    if (step === 2) {
      FULL_INFO_ROLES.forEach((role) => {
        const a = assistants[role] as AssistantItem;
        if (!a.name?.trim()) e[`assistants.${role}.name`] = `اسم ${role} مطلوب`;
        if (!a.nid?.trim())
          e[`assistants.${role}.nid`] = `الرقم القومي لـ ${role} مطلوب`;
        else if (!/^\d{14}$/.test(a.nid as string))
          e[`assistants.${role}.nid`] = "يجب أن يكون 14 رقماً";
        if (!a.ph_no?.trim())
          e[`assistants.${role}.ph_no`] = `رقم الهاتف لـ ${role} مطلوب`;
        else if (!/^\d{11}$/.test(a.ph_no as string))
          e[`assistants.${role}.ph_no`] = "يجب أن يكون 11 رقماً";
      });
      UID_ROLES.forEach((role) => {
        const a = assistants[role] as AssistantItem;
        if (!a.uid?.trim())
          e[`assistants.${role}.uid`] = `الرقم الجامعي لـ ${role} مطلوب`;
        else if (!/^\d+$/.test(a.uid as string))
          e[`assistants.${role}.uid`] = "أرقام فقط";
      });

      // Duplicate UID check
      const dupeMap = getDuplicateUidMap();
      Object.entries(dupeMap).forEach(([key, conflictRole]) => {
        if (key.startsWith("assistants.")) {
          e[key] = `هذا الكود مستخدم بالفعل لـ «${conflictRole}»`;
        }
      });
    }

    if (step === 3) {
      committees.forEach((c, ci) => {
        if (!c.head.uid)
          e[`committees.${ci}.head.uid`] = "الرقم الجامعي للأمين مطلوب";
        if (!c.assistant.uid)
          e[`committees.${ci}.assistant.uid`] =
            "الرقم الجامعي للأمين المساعد مطلوب";
        else if (
          c.head.uid &&
          c.assistant.uid &&
          c.head.uid === c.assistant.uid
        ) {
          e[`committees.${ci}.assistant.uid`] =
            "لا يمكن أن يكون الأمين والأمين المساعد نفس الطالب";
        }
        c.activities.forEach((a, ai) => {
          if (!a.title.trim())
            e[`committees.${ci}.activities.${ai}.title`] =
              "اسم المشروع مطلوب";
          if (!a.st_date)
            e[`committees.${ci}.activities.${ai}.st_date`] =
              "موعد التنفيذ مطلوب";
        });
      });
    }

    return e;
  };

  /* ── step navigation ── */
  const goNext = () => {
    const errs = validateStep(currentStep);
    if (Object.keys(errs).length) {
      setFieldErrors((p) => ({ ...p, ...errs }));
      showNotif(`❌ ${errs[Object.keys(errs)[0]]}`, "error");
      setTimeout(
        () =>
          document
            .querySelector(`.${styles["cf-feedback--error"]}`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" }),
        80
      );
      return;
    }
    setCompletedSteps((p) => new Set(p).add(currentStep));
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goPrev = () => {
    setCurrentStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── handlers ── */
  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const parsed =
      name === "min_limit" ? Number(value || 0) : value;
    const capped =
      name === "min_limit"
        ? Math.min(Math.max(parsed as number, 1), MAX_MIN_LIMIT)
        : parsed;
    setGeneral((p) => ({ ...p, [name]: capped }));
    clearErr(`general.${name}`);
    if (name === "min_limit") {
      const n = Number(capped);
      setMembers((p) => {
        const m = [...p];
        while (m.length < n) m.push({ nid: "" });
        m.length = n;
        return m;
      });
      clearByPfx("members.");
    }
  };

  const handleMemberChange = (i: number, val: string) => {
    setMembers((p) => {
      const m = [...p];
      m[i] = { nid: val };
      return m;
    });
    clearErr(`members.${i}.nid`);
  };

  const handleAssistantChange = (
    role: AssistantRole,
    field: string,
    value: string
  ) => {
    setAssistants((p) => ({
      ...p,
      [role]: { ...(p[role] as AssistantItem), [field]: value },
    }));
    clearErr(`assistants.${role}.${field}`);
  };

  const handleCommitteeChange = (
    i: number,
    field: string,
    sub: string,
    val: string
  ) => {
    setCommittees((p) => {
      const c = [...p];
      if (sub)
        (c[i] as unknown as Record<string, Record<string, string>>)[field][
          sub
        ] = val;
      else (c[i] as unknown as Record<string, string>)[field] = val;
      return c;
    });
    if (field === "head" && sub === "uid")
      clearErr(`committees.${i}.head.uid`);
    if (field === "assistant" && sub === "uid")
      clearErr(`committees.${i}.assistant.uid`);
  };

  const handleActivityChange = (
    ci: number,
    ai: number,
    field: keyof Activity,
    val: string
  ) => {
    setCommittees((p) => {
      const c = [...p];
      c[ci].activities[ai][field] = val;
      return c;
    });
    clearErr(`committees.${ci}.activities.${ai}.${field}`);
  };

  const addActivity = (ci: number) =>
    setCommittees((p) =>
      p.map((c, i) =>
        i !== ci
          ? c
          : {
              ...c,
              activities: [
                ...c.activities,
                {
                  title: "",
                  description: "",
                  st_date: "",
                  end_date: "",
                  location: "",
                  cost: "",
                },
              ],
            }
      )
    );

  const removeActivity = (ci: number, ai: number) => {
    setCommittees((p) =>
      p.map((c, i) =>
        i !== ci
          ? c
          : { ...c, activities: c.activities.filter((_, j) => j !== ai) }
      )
    );
    clearByPfx(`committees.${ci}.activities.`);
  };

  /* ── build body ── */
  const buildBody = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("access") : null;
    let faculty_id = 0;
    if (token) {
      const d = parseJWT(token);
      if (d?.faculty_id) faculty_id = d.faculty_id;
    }
    return {
      name: general.name,
      description: general.description,
      min_limit: general.min_limit,
      faculty_id,
      participants: members
        .map((m) => m.nid.trim())
        .filter(Boolean),
      default_roles: assistants,
      committees: committees.map((c) => ({
        committee_key: c.committee_key,
        head: {
          uid: Number(c.head.uid),
          dept_id: Number(c.head.dept_id),
        },
        assistant: {
          uid: Number(c.assistant.uid),
          dept_id: Number(c.assistant.dept_id),
        },
        activities: c.activities.map((a) => ({
          title: a.title,
          description: a.description,
          st_date: a.st_date,
          end_date: a.end_date || a.st_date,
          location: a.location,
        })),
      })),
    };
  };

  useEffect(() => {
    authFetch(`${getBaseUrl()}/api/family/departments/`)
      .then((r) => r.json())
      .then((d) => setDepartments(d))
      .catch(() => {});
  }, []);

  /* ── submit ── */
  const handleSubmit = async () => {
    const allErrs = {
      ...validateStep(0),
      ...validateStep(1),
      ...validateStep(2),
      ...validateStep(3),
    };
    if (Object.keys(allErrs).length) {
      setFieldErrors(allErrs);
      showNotif(`❌ ${allErrs[Object.keys(allErrs)[0]]}`, "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const res = await authFetch(
        `${getBaseUrl()}/api/family/faculty/environment-family/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(buildBody()),
        }
      );
      const data = res.headers.get("content-type")?.includes("application/json")
        ? await res.json()
        : null;

      if (!res.ok) {
        const lines = parseApiErrors(data);
        lines.forEach((line, i) =>
          setTimeout(() => showNotif(`❌ ${line}`, "error"), i * 600)
        );
      } else {
        showNotif("✅ تم حفظ الأسرة بنجاح", "success");
        setCompletedSteps(new Set([0, 1, 2, 3]));
      }
    } catch {
      showNotif("❌ خطأ في الاتصال بالسيرفر", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPct = (currentStep / (STEPS.length - 1)) * 100;
  const dupeMap = getDuplicateUidMap();

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <div className={styles.formContainer}>

      {/* Notification */}
      {notification && (
        <div
          className={`${styles.notification} ${styles[notification.type]}`}
        >
          {notification.message}
        </div>
      )}

      {/* ══════════════════════════════════════
          WIZARD HEADER  (matches CreateFamForm)
      ══════════════════════════════════════ */}
      <div className={styles["cf-progress-header"]}>
        {/* top row: back | title | step counter */}
        <div className={styles["cf-progress-top"]}>
          <button className={styles["cf-back-page"]} type="button">
            <ChevronRight size={15} /> العودة للقائمة
          </button>
          <h1 className={styles["cf-wizard-title"]}>
            إنشاء أسرة أصدقاء البيئة
          </h1>
          <span className={styles["cf-step-count"]}>
            {currentStep + 1} / {STEPS.length}
          </span>
        </div>

        {/* step indicators */}
        <div className={styles["cf-steps"]}>
          {STEPS.map((step, idx) => {
            const isDone = completedSteps.has(idx);
            const isActive = idx === currentStep;
            const isPast = idx < currentStep;
            const Icon = step.icon;
            return (
              <React.Fragment key={idx}>
                <div
                  className={[
                    styles["cf-step-indicator"],
                    isActive
                      ? styles["cf-step-active"]
                      : isDone || isPast
                      ? styles["cf-step-done"]
                      : styles["cf-step-pending"],
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <button
                    type="button"
                    className={styles["cf-step-circle"]}
                    onClick={() => {
                      if (idx < currentStep) {
                        setCurrentStep(idx);
                        return;
                      }
                      if (idx > currentStep) {
                        let ok = true;
                        for (let s = currentStep; s < idx; s++) {
                          const errs = validateStep(s);
                          if (Object.keys(errs).length) {
                            setFieldErrors((p) => ({ ...p, ...errs }));
                            showNotif(
                              `❌ ${errs[Object.keys(errs)[0]]}`,
                              "error"
                            );
                            ok = false;
                            break;
                          }
                          setCompletedSteps((p) => new Set(p).add(s));
                        }
                        if (ok) setCurrentStep(idx);
                      }
                    }}
                  >
                    {isDone || isPast ? (
                      <CheckCircle size={14} />
                    ) : (
                      <Icon size={13} />
                    )}
                  </button>
                  <span className={styles["cf-step-label"]}>{step.label}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`${styles["cf-step-line"]} ${
                      isPast || isDone ? styles["cf-line-done"] : ""
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* progress bar */}
        <div className={styles["cf-progress-bar"]}>
          <div
            className={styles["cf-progress-fill"]}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* ── Body ── */}
      <div className={styles["member-form-container"]}>

        {/* ══ STEP 0: معلومات عامة ══ */}
        {currentStep === 0 && (
          <section className={styles["member-section"]}>
            <h2 className={styles["member-section-title"]}>
              <FileText size={15} /> معلومات عامة عن الأسرة
            </h2>
            <div className={styles["member-form-grid"]}>
              <div className={styles["member-form-group"]}>
                <label>
                  اسم الأسرة <span style={{ color: "var(--error)" }}>*</span>
                </label>
                <input
                  name="name"
                  placeholder="أدخل اسم الأسرة"
                  value={general.name}
                  onChange={handleGeneralChange}
                  className={`${styles["member-input"]} ${
                    hasErr("general.name") ? styles.inputError : ""
                  }`}
                />
                {hasErr("general.name") && (
                  <Feedback type="error">
                    {fieldErrors["general.name"]}
                  </Feedback>
                )}
              </div>

              <div className={styles["member-form-group"]}>
                <label>
                  وصف الأسرة <span style={{ color: "var(--error)" }}>*</span>
                </label>
                <input
                  name="description"
                  placeholder="وصف مختصر للأسرة"
                  value={general.description}
                  onChange={handleGeneralChange}
                  className={`${styles["member-input"]} ${
                    hasErr("general.description") ? styles.inputError : ""
                  }`}
                />
                {hasErr("general.description") && (
                  <Feedback type="error">
                    {fieldErrors["general.description"]}
                  </Feedback>
                )}
              </div>

              <div className={styles["member-form-group"]}>
                <label>
                  الحد الأدنى للأعضاء{" "}
                  <span style={{ color: "var(--error)" }}>*</span>
                </label>
                <input
                  name="min_limit"
                  type="number"
                  min={1}
                  max={MAX_MIN_LIMIT}
                  onKeyDown={(e) =>
                    (e.key === "-" || e.key === "e") && e.preventDefault()
                  }
                  value={general.min_limit}
                  onChange={handleGeneralChange}
                  className={`${styles["member-input"]} ${
                    hasErr("general.min_limit") ? styles.inputError : ""
                  }`}
                />
                {hasErr("general.min_limit") && (
                  <Feedback type="error">
                    {fieldErrors["general.min_limit"]}
                  </Feedback>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ══ STEP 1: الأعضاء ══ */}
        {currentStep === 1 && (
          <section className={styles["member-section"]}>
            <h2 className={styles["member-section-title"]}>
              <Users size={15} /> الأعضاء (المشاركون) — {general.min_limit} عضو
            </h2>
            <div className={styles["member-form-grid"]}>
              {members.map((m, i) => (
                <div key={i} className={styles["member-form-group"]}>
                  <label>الرقم القومي لعضو {i + 1}</label>
                  <input
                    type="text"
                    placeholder="الرقم القومي (14 رقم)"
                    value={m.nid}
                    maxLength={14}
                    inputMode="numeric"
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      if (v.length <= 14) handleMemberChange(i, v);
                    }}
                    className={`${styles["member-input"]} ${
                      hasErr(`members.${i}.nid`) ? styles.inputError : ""
                    }`}
                  />
                  {hasErr(`members.${i}.nid`) && (
                    <Feedback type="error">
                      {fieldErrors[`members.${i}.nid`]}
                    </Feedback>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══ STEP 2: مجلس الإدارة ══ */}
        {currentStep === 2 && (
          <section className={styles["member-section"]}>
            <h2 className={styles["member-section-title"]}>
              <User size={15} /> مجلس إدارة الأسرة
            </h2>

            {/* error summary banner */}
            {Object.keys(fieldErrors).some((k) =>
              k.startsWith("assistants.")
            ) && (
              <div
                className={styles["cf-error-banner"]}
                style={{ margin: "0 22px 4px" }}
              >
                <span className={styles["cf-error-banner-icon"]}>⚠</span>
                <div>
                  <strong>يوجد خطأ في بيانات مجلس الإدارة</strong>
                  <ul className={styles["cf-error-list"]}>
                    {Object.entries(fieldErrors)
                      .filter(([k]) => k.startsWith("assistants."))
                      .slice(0, 5)
                      .map(([k, v]) => (
                        <li key={k}>{v}</li>
                      ))}
                  </ul>
                </div>
              </div>
            )}

            <div className={styles.assistantGrid}>
              {FULL_INFO_ROLES.map((role) => {
                const a = assistants[role] as AssistantItem;
                const roleHasErr = Object.keys(fieldErrors).some((k) =>
                  k.startsWith(`assistants.${role}`)
                );
                return (
                  <div
                    key={role}
                    className={[
                      styles.assistantCard,
                      styles.assistantCardFull,
                      roleHasErr ? styles["cf-member-card-error"] : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <div className={styles.assistantCardHeader}>
                      <User size={14} />
                      <span>{role}</span>
                      {roleHasErr && (
                        <span className={styles["cf-member-error-badge"]}>
                          يوجد خطأ
                        </span>
                      )}
                    </div>
                    <div className={styles["assistant-inputs"]}>
                      <div className={styles["member-form-group"]}>
                        <label>
                          الاسم الكامل{" "}
                          <span style={{ color: "var(--error)" }}>*</span>
                        </label>
                        <input
                          placeholder="الاسم الكامل"
                          value={a.name as string}
                          onChange={(e) =>
                            handleAssistantChange(role, "name", e.target.value)
                          }
                          className={`${styles["member-input"]} ${
                            hasErr(`assistants.${role}.name`)
                              ? styles.inputError
                              : ""
                          }`}
                        />
                        {hasErr(`assistants.${role}.name`) && (
                          <Feedback type="error">
                            {fieldErrors[`assistants.${role}.name`]}
                          </Feedback>
                        )}
                      </div>
                      <div className={styles["member-form-group"]}>
                        <label>
                          الرقم القومي{" "}
                          <span style={{ color: "var(--error)" }}>*</span>
                        </label>
                        <input
                          placeholder="14 رقماً"
                          maxLength={14}
                          inputMode="numeric"
                          value={a.nid as string}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, "");
                            if (v.length <= 14)
                              handleAssistantChange(role, "nid", v);
                          }}
                          className={`${styles["member-input"]} ${
                            hasErr(`assistants.${role}.nid`)
                              ? styles.inputError
                              : ""
                          }`}
                        />
                        {hasErr(`assistants.${role}.nid`) && (
                          <Feedback type="error">
                            {fieldErrors[`assistants.${role}.nid`]}
                          </Feedback>
                        )}
                      </div>
                      <div className={styles["member-form-group"]}>
                        <label>
                          رقم الهاتف{" "}
                          <span style={{ color: "var(--error)" }}>*</span>
                        </label>
                        <input
                          placeholder="01XXXXXXXXX"
                          maxLength={11}
                          inputMode="numeric"
                          value={a.ph_no as string}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, "");
                            if (v.length <= 11)
                              handleAssistantChange(role, "ph_no", v);
                          }}
                          className={`${styles["member-input"]} ${
                            hasErr(`assistants.${role}.ph_no`)
                              ? styles.inputError
                              : ""
                          }`}
                        />
                        {hasErr(`assistants.${role}.ph_no`) && (
                          <Feedback type="error">
                            {fieldErrors[`assistants.${role}.ph_no`]}
                          </Feedback>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {UID_ROLES.map((role) => {
                const a = assistants[role] as AssistantItem;
                const errKey = `assistants.${role}.uid`;
                return (
                  <div key={role} className={styles.assistantCard}>
                    <div className={styles.assistantCardHeader}>
                      <User size={14} />
                      <span>{role}</span>
                    </div>
                    <UidField
                      label="الرقم الجامعي"
                      value={a.uid as string}
                      errorKey={errKey}
                      fieldErrors={fieldErrors}
                      onChange={(v) =>
                        handleAssistantChange(role, "uid", v)
                      }
                      duplicateOf={dupeMap[errKey]}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ══ STEP 3: اللجان ══ */}
        {currentStep === 3 && (
          <section className={styles["member-section"]}>
            <h2 className={styles["member-section-title"]}>
              <Users size={15} /> اللجان
            </h2>
            <div className={styles.committeesWrapper}>
              {committees.map((c, ci) => {
                const isOpen = !!openComm[ci];
                return (
                  <div
                    key={c.committee_key}
                    className={`${styles["committee-inputs"]} ${
                      isOpen ? styles.committeeOpen : ""
                    }`}
                  >
                    <div
                      className={styles.committeeSummary}
                      onClick={() =>
                        setOpenComm((p) => ({ ...p, [ci]: !p[ci] }))
                      }
                    >
                      <span className={styles.committeeDot} />
                      <span>
                        {committeeNames[c.committee_key] ?? c.committee_key}
                      </span>
                      <ChevronLeft
                        size={15}
                        className={styles.committeeChevron}
                      />
                    </div>

                    {isOpen && (
                      <div className={styles.committeeBody}>
                        <div className={styles.committeeGrid}>
                          {/* Head UID */}
                          <div className={styles["member-form-group"]}>
                            <label className={styles.committeeFieldLabel}>
                              الرقم الجامعي للأمين{" "}
                              <span style={{ color: "var(--error)" }}>*</span>
                            </label>
                            <div className={styles["cf-input-wrap"]}>
                              <input
                                placeholder="الرقم الجامعي"
                                value={c.head.uid}
                                inputMode="numeric"
                                onChange={(e) => {
                                  const v = e.target.value.replace(/\D/g, "");
                                  handleCommitteeChange(ci, "head", "uid", v);
                                }}
                                className={`${styles["member-input"]} ${
                                  hasErr(`committees.${ci}.head.uid`)
                                    ? styles.inputError
                                    : ""
                                }`}
                              />
                            </div>
                            {hasErr(`committees.${ci}.head.uid`) && (
                              <Feedback type="error">
                                {fieldErrors[`committees.${ci}.head.uid`]}
                              </Feedback>
                            )}
                          </div>

                          {/* Assistant UID */}
                          <div className={styles["member-form-group"]}>
                            <label className={styles.committeeFieldLabel}>
                              الرقم الجامعي للأمين المساعد{" "}
                              <span style={{ color: "var(--error)" }}>*</span>
                            </label>
                            <div className={styles["cf-input-wrap"]}>
                              <input
                                placeholder="الرقم الجامعي"
                                value={c.assistant.uid}
                                inputMode="numeric"
                                onChange={(e) => {
                                  const v = e.target.value.replace(/\D/g, "");
                                  handleCommitteeChange(
                                    ci,
                                    "assistant",
                                    "uid",
                                    v
                                  );
                                }}
                                className={`${styles["member-input"]} ${
                                  hasErr(`committees.${ci}.assistant.uid`)
                                    ? styles.inputError
                                    : ""
                                }`}
                              />
                            </div>
                            {hasErr(`committees.${ci}.assistant.uid`) && (
                              <Feedback type="error">
                                {
                                  fieldErrors[
                                    `committees.${ci}.assistant.uid`
                                  ]
                                }
                              </Feedback>
                            )}
                          </div>

                          {/* Department */}
                          <div className={styles["member-form-group"]}>
                            <label className={styles.committeeFieldLabel}>
                              القسم
                            </label>
                            <select
                              value={c.head.dept_id}
                              onChange={(e) => {
                                handleCommitteeChange(
                                  ci,
                                  "head",
                                  "dept_id",
                                  e.target.value
                                );
                                handleCommitteeChange(
                                  ci,
                                  "assistant",
                                  "dept_id",
                                  e.target.value
                                );
                              }}
                              className={styles["member-input"]}
                            >
                              <option value="" hidden>
                                اختر القسم
                              </option>
                              {departments.map((d) => (
                                <option key={d.dept_id} value={d.dept_id}>
                                  {d.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Activities */}
                        {c.activities.map((a, ai) => (
                          <div key={ai} className={styles.activityCard}>
                            <div className={styles.activityCardHeader}>
                              <span>مشروع {ai + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeActivity(ci, ai)}
                                className={styles["delete-activity-btn"]}
                              >
                                <Trash2 size={12} /> حذف
                              </button>
                            </div>
                            <div className={styles.activityGrid}>
                              <div
                                className={`${styles["member-form-group"]} ${styles.activityGridFull}`}
                              >
                                <label
                                  className={styles.committeeFieldLabel}
                                >
                                  اسم المشروع{" "}
                                  <span style={{ color: "var(--error)" }}>
                                    *
                                  </span>
                                </label>
                                <input
                                  placeholder="اسم المشروع"
                                  value={a.title}
                                  onChange={(e) =>
                                    handleActivityChange(
                                      ci,
                                      ai,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                  className={`${styles["member-input"]} ${
                                    hasErr(
                                      `committees.${ci}.activities.${ai}.title`
                                    )
                                      ? styles.inputError
                                      : ""
                                  }`}
                                />
                                {hasErr(
                                  `committees.${ci}.activities.${ai}.title`
                                ) && (
                                  <Feedback type="error">
                                    {
                                      fieldErrors[
                                        `committees.${ci}.activities.${ai}.title`
                                      ]
                                    }
                                  </Feedback>
                                )}
                              </div>
                              <div className={styles["member-form-group"]}>
                                <label
                                  className={styles.committeeFieldLabel}
                                >
                                  موعد التنفيذ{" "}
                                  <span style={{ color: "var(--error)" }}>
                                    *
                                  </span>
                                </label>
                                <input
                                  type="date"
                                  value={a.st_date}
                                  onChange={(e) =>
                                    handleActivityChange(
                                      ci,
                                      ai,
                                      "st_date",
                                      e.target.value
                                    )
                                  }
                                  className={`${styles["member-input"]} ${
                                    hasErr(
                                      `committees.${ci}.activities.${ai}.st_date`
                                    )
                                      ? styles.inputError
                                      : ""
                                  }`}
                                />
                                {hasErr(
                                  `committees.${ci}.activities.${ai}.st_date`
                                ) && (
                                  <Feedback type="error">
                                    {
                                      fieldErrors[
                                        `committees.${ci}.activities.${ai}.st_date`
                                      ]
                                    }
                                  </Feedback>
                                )}
                              </div>
                              <div className={styles["member-form-group"]}>
                                <label
                                  className={styles.committeeFieldLabel}
                                >
                                  مصادر التمويل
                                </label>
                                <input
                                  placeholder="مصادر التمويل"
                                  value={a.description}
                                  onChange={(e) =>
                                    handleActivityChange(
                                      ci,
                                      ai,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  className={styles["member-input"]}
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => addActivity(ci)}
                          className={styles["add-activity-btn"]}
                        >
                          <Plus size={14} /> إضافة فعالية جديدة
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ══ Navigation ══ */}
        <div className={styles.stepNavButtons}>
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={goPrev}
              className={styles.stepNavPrev}
            >
              <ChevronRight size={15} />
              السابق
            </button>
          ) : (
            <div />
          )}

          {/* Progress dots */}
          <div className={styles["cf-footer-dots"]}>
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={[
                  styles["cf-dot"],
                  i === currentStep ? styles["cf-dot-active"] : "",
                  i < currentStep ? styles["cf-dot-done"] : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            ))}
          </div>

          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className={styles["add-member-btn"]}
            >
              التالي
              <ChevronLeft size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={styles["add-member-btn"]}
            >
              {isSubmitting ? (
                "جاري الحفظ..."
              ) : (
                <>
                  <Send size={16} /> حفظ الأسرة
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}