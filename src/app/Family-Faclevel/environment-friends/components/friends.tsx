"use client";

import React, { useState, useEffect } from "react";
import styles from "../styles/friends.module.css";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { User, Users, ChevronLeft, Plus, Trash2, Send, CheckCircle } from "lucide-react";

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
  "رائد":        { name: string; nid: string; ph_no: string };
  "نائب_رائد":   { name: string; nid: string; ph_no: string };
  "مسؤول":       { name: string; nid: string; ph_no: string };
  "أمين_صندوق":  { name: string; nid: string; ph_no: string };
  "أخ_أكبر":     { uid: string };
  "أخت_كبرى":    { uid: string };
  "أمين_سر":     { uid: string };
  "عضو_منتخب_1": { uid: string };
  "عضو_منتخب_2": { uid: string };
};

type Activity = {
  title: string; description: string; st_date: string;
  end_date: string; location: string; cost: string;
};

type Committee = {
  committee_key: string;
  head:      { uid: string; dept_id: string };
  assistant: { uid: string; dept_id: string };
  activities: Activity[];
};

type Department = {
  dept_id: number;
  name: string;
};

const committeeNames: Record<string, string> = {
  "public-service": "لجنة الخدمة العامة",
  "environmental-pollution": "لجنة التلوث البيئي وسلوكيات البيئة",
  "community-service": "لجنة خدمة المجتمع وتنمية البيئة",
  "public-relations": "لجنة العلاقات العامة",
};

const FULL_INFO_ROLES: AssistantRole[] = ["رائد", "نائب_رائد", "مسؤول", "أمين_صندوق"];
const UID_ROLES: AssistantRole[]       = ["أخ_أكبر", "أخت_كبرى", "أمين_سر", "عضو_منتخب_1", "عضو_منتخب_2"];
const MAX_MIN_LIMIT = 150;

const STEPS = [
  { label: "معلومات عامة", icon: "📋" },
  { label: "الأعضاء",      icon: "👥" },
  { label: "مجلس الإدارة", icon: "👤" },
  { label: "اللجان",       icon: "🏛️" },
];

export default function FriendsForm() {
  /* ── step state ── */
  const [currentStep, setCurrentStep] = useState(0);

  /* ── initial data ── */
  const initialGeneral = { name: "", description: "", min_limit: 15 };

  const initialAssistants: AssistantsState = {
    "رائد":        { name: "", nid: "", ph_no: "" },
    "نائب_رائد":   { name: "", nid: "", ph_no: "" },
    "مسؤول":       { name: "", nid: "", ph_no: "" },
    "أمين_صندوق":  { name: "", nid: "", ph_no: "" },
    "أخ_أكبر":     { uid: "" },
    "أخت_كبرى":    { uid: "" },
    "أمين_سر":     { uid: "" },
    "عضو_منتخب_1": { uid: "" },
    "عضو_منتخب_2": { uid: "" },
  };

  const initialCommittees: Committee[] = [
    "public-service","environmental-pollution","community-service","public-relations",
  ].map((key) => ({
    committee_key: key,
    head:      { uid: "", dept_id: "" },
    assistant: { uid: "", dept_id: "" },
    activities: [{ title:"", description:"", st_date:"", end_date:"", location:"", cost:"" }],
  }));

  const makeMembers = (n: number): Member[] =>
    Array.from({ length: n }, () => ({ nid: "" }));

  /* ── state ── */
  const [general,     setGeneral]     = useState(initialGeneral);
  const [members,     setMembers]     = useState<Member[]>(makeMembers(initialGeneral.min_limit));
  const [assistants,  setAssistants]  = useState<AssistantsState>(initialAssistants);
  const [committees,  setCommittees]  = useState<Committee[]>(initialCommittees);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [openCommittees, setOpenCommittees] = useState<Record<number, boolean>>({});
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  /* ── helpers ── */
  const hasErr = (k: string) => Boolean(fieldErrors[k]);
  const clearErr  = (k: string) => setFieldErrors(p => { const c={...p}; delete c[k]; return c; });
  const clearByPrefix = (pfx: string) =>
    setFieldErrors(p => { const c={...p}; Object.keys(c).forEach(k => k.startsWith(pfx) && delete c[k]); return c; });

  const showNotif = (message: string, type: NotificationType) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2800);
  };

  const parseJWT = (token: string) => {
    try { return JSON.parse(atob(token.split(".")[1])); }
    catch { return null; }
  };

  const toggleCommittee = (i: number) =>
    setOpenCommittees(p => ({ ...p, [i]: !p[i] }));

  /* ── per-step validation ── */
  const validateStep = (step: number): Record<string, string> => {
    const errs: Record<string, string> = {};

    if (step === 0) {
      if (!general.name.trim())        errs["general.name"]        = "اسم الأسرة مطلوب";
      if (!general.description.trim()) errs["general.description"] = "وصف الأسرة مطلوب";
      if (!general.min_limit || general.min_limit <= 0)
        errs["general.min_limit"] = "الحد الأدنى للأعضاء غير صحيح";
      else if (general.min_limit > MAX_MIN_LIMIT)
        errs["general.min_limit"] = `الحد الأقصى ${MAX_MIN_LIMIT}`;
    }

    if (step === 1) {
      members.forEach((m, i) => {
        if (!m.nid.trim())               errs[`members.${i}.nid`] = `الرقم القومي للعضو ${i+1} مطلوب`;
        else if (!/^\d{14}$/.test(m.nid)) errs[`members.${i}.nid`] = `الرقم القومي ${i+1} يجب أن يكون 14 رقم`;
      });
    }

    if (step === 2) {
      FULL_INFO_ROLES.forEach(role => {
        const a = assistants[role] as AssistantItem;
        if (!a.name?.trim())                    errs[`assistants.${role}.name`]  = `اسم ${role} مطلوب`;
        if (!a.nid?.trim())                     errs[`assistants.${role}.nid`]   = `الرقم القومي لـ ${role} مطلوب`;
        else if (!/^\d{14}$/.test(a.nid as string)) errs[`assistants.${role}.nid`] = `14 رقم مطلوب`;
        if (!a.ph_no?.trim())                   errs[`assistants.${role}.ph_no`] = `رقم الهاتف لـ ${role} مطلوب`;
        else if (!/^\d{11}$/.test(a.ph_no as string)) errs[`assistants.${role}.ph_no`] = `11 رقم مطلوب`;
      });
      UID_ROLES.forEach(role => {
        const a = assistants[role] as AssistantItem;
        if (!a.uid?.trim())              errs[`assistants.${role}.uid`] = `الرقم الجامعي لـ ${role} مطلوب`;
        else if (!/^\d+$/.test(a.uid as string)) errs[`assistants.${role}.uid`] = `أرقام فقط`;
      });
    }

    if (step === 3) {
      committees.forEach((c, ci) => {
        if (!c.head.uid)      errs[`committees.${ci}.head.uid`]      = "الرقم الجامعي للأمين مطلوب";
        if (!c.assistant.uid) errs[`committees.${ci}.assistant.uid`] = "الرقم الجامعي للأمين المساعد مطلوب";
        c.activities.forEach((a, ai) => {
          if (!a.title.trim()) errs[`committees.${ci}.activities.${ai}.title`]  = "اسم المشروع مطلوب";
          if (!a.st_date)      errs[`committees.${ci}.activities.${ai}.st_date`] = "موعد التنفيذ مطلوب";
        });
      });
    }

    return errs;
  };

  /* ── full validation (for submit) ── */
  const validate = () => {
    const allErrs = { ...validateStep(0), ...validateStep(1), ...validateStep(2), ...validateStep(3) };
    setFieldErrors(allErrs);
    return Object.keys(allErrs)[0] ? allErrs[Object.keys(allErrs)[0]] : null;
  };

  /* ── step navigation ── */
  const goToNext = () => {
    const errs = validateStep(currentStep);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(prev => ({ ...prev, ...errs }));
      showNotif(`❌ ${errs[Object.keys(errs)[0]]}`, "error");
      return;
    }
    setCompletedSteps(prev => new Set(prev).add(currentStep));
    setCurrentStep(s => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToPrev = () => {
    setCurrentStep(s => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── handlers ── */
  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const parsed = name === "min_limit" ? Number(value || 0) : value;
    const capped = name === "min_limit"
      ? Math.min(Math.max(parsed as number, 1), MAX_MIN_LIMIT)
      : parsed;
    setGeneral(p => ({ ...p, [name]: capped }));
    clearErr(`general.${name}`);
    if (name === "min_limit") {
      const n = Number(capped);
      setMembers(p => {
        const m = [...p];
        while (m.length < n) m.push({ nid: "" });
        m.length = Math.min(m.length, n);
        return m;
      });
      clearByPrefix("members.");
    }
  };

  const handleMemberChange = (i: number, val: string) => {
    setMembers(p => { const m=[...p]; m[i]={nid:val}; return m; });
    clearErr(`members.${i}.nid`);
  };

  const handleAssistantChange = (role: AssistantRole, field: string, value: string) => {
    setAssistants(p => ({ ...p, [role]: { ...(p[role] as AssistantItem), [field]: value } }));
    clearErr(`assistants.${role}.${field}`);
  };

  const handleCommitteeChange = (i: number, field: string, sub: string, val: string) => {
    setCommittees(p => {
      const c=[...p];
      if (sub) {
        ((c[i] as unknown as Record<string, Record<string, string>>)[field][sub]=val);
      } else {
        ((c[i] as unknown as Record<string, string>)[field]=val);
      }
      return c;
    });
    if (field==="head"      && sub==="uid") clearErr(`committees.${i}.head.uid`);
    if (field==="assistant" && sub==="uid") clearErr(`committees.${i}.assistant.uid`);
  };

  const handleActivityChange = (ci: number, ai: number, field: keyof Activity, val: string) => {
    setCommittees(p => {
      const c=[...p]; c[ci].activities[ai][field]=val; return c;
    });
    clearErr(`committees.${ci}.activities.${ai}.${field}`);
  };

  const addActivity = (ci: number) => {
    setCommittees(prev => {
      const updated = [...prev];
      updated[ci] = {
        ...updated[ci],
        activities: [
          ...updated[ci].activities,
          { title: "", description: "", st_date: "", end_date: "", location: "", cost: "" }
        ]
      };
      return updated;
    });
  };

  const removeActivity = (ci: number, ai: number) => {
    setCommittees(prev =>
      prev.map((committee, index) => {
        if (index !== ci) return committee;
        return { ...committee, activities: committee.activities.filter((_, i) => i !== ai) };
      })
    );
    clearByPrefix(`committees.${ci}.activities.`);
  };

  const buildBody = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
    let faculty_id = 0;
    if (token) { const d=parseJWT(token); if (d?.faculty_id) faculty_id=d.faculty_id; }
    return {
      name: general.name, description: general.description, min_limit: general.min_limit,
      faculty_id,
      participants: members.map(m => m.nid.trim()).filter(Boolean),
      default_roles: assistants,
      committees: committees.map(c => ({
        committee_key: c.committee_key,
        head:      { uid: Number(c.head.uid),      dept_id: Number(c.head.dept_id) },
        assistant: { uid: Number(c.assistant.uid), dept_id: Number(c.assistant.dept_id) },
        activities: c.activities.map(a => ({
          title: a.title,
          description: a.description,
          st_date: a.st_date,
          end_date: a.end_date || a.st_date,
          location: a.location,
        }))
      })),
    };
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await authFetch(`${getBaseUrl()}/api/family/departments/`);
        const data = await res.json();
        setDepartments(data);
      } catch (err) {
        console.error("Failed to load departments", err);
      }
    };
    fetchDepartments();
  }, []);

  const handleSubmit = async () => {
    const err = validate();
    if (err) { showNotif(`❌ ${err}`, "error"); return; }
    setIsSubmitting(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
      const res = await authFetch(`${getBaseUrl()}/api/family/faculty/environment-family/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(buildBody()),
      });
      const data = res.headers.get("content-type")?.includes("application/json") ? await res.json() : null;
      if (!res.ok) {
        const msg = data?.error || data?.detail || "يوجد خطأ في البيانات المرسلة";
        showNotif(`❌ ${msg}`, "error");
      } else {
        showNotif("✅ تم حفظ الأسرة بنجاح", "success");
        setCompletedSteps(new Set([0, 1, 2, 3]));
      }
    } catch { showNotif("❌ خطأ في الاتصال بالسيرفر", "error"); }
    finally { setIsSubmitting(false); }
  };

  /* ═══════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════ */
  return (
    <div className={styles.formContainer}>

      {/* Notification */}
      {notification && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )}

      {/* ── Header ── */}
      <header className={styles.formHeader}>
        <div className={styles.formHeaderContent}>
          <h1 className={styles.formTitle}>إنشاء أسرة أصدقاء البيئة</h1>
          <p className={styles.formSubtitle}>إدارة الأسرة الطلابية / طلبات / إنشاء أسرة أصدقاء البيئة</p>
        </div>
      </header>

      {/* ── Stepper ── */}
      <div className={styles.stepperWrapper}>
        <div className={styles.stepperTrack}>
          {STEPS.map((step, idx) => {
            const isDone    = completedSteps.has(idx);
            const isActive  = idx === currentStep;
            const isPast    = idx < currentStep;
            return (
              <React.Fragment key={idx}>
                {/* connector line */}
                {idx > 0 && (
                  <div
                    className={`${styles.stepConnector} ${isPast || isDone ? styles.stepConnectorDone : ""}`}
                  />
                )}
                {/* step bubble */}
                <button
                  type="button"
                  className={`${styles.stepBubble} ${isActive ? styles.stepBubbleActive : ""} ${(isDone || isPast) ? styles.stepBubbleDone : ""}`}
                  onClick={() => {
                    // allow going back freely; going forward only if previous steps done
                    if (idx < currentStep) {
                      setCurrentStep(idx);
                    } else if (idx > currentStep) {
                      // validate all steps up to target
                      let canJump = true;
                      for (let s = currentStep; s < idx; s++) {
                        const errs = validateStep(s);
                        if (Object.keys(errs).length > 0) {
                          setFieldErrors(prev => ({ ...prev, ...errs }));
                          showNotif(`❌ ${errs[Object.keys(errs)[0]]}`, "error");
                          canJump = false;
                          break;
                        } else {
                          setCompletedSteps(prev => new Set(prev).add(s));
                        }
                      }
                      if (canJump) setCurrentStep(idx);
                    }
                  }}
                >
                  {isDone || isPast ? <CheckCircle size={16} /> : <span>{idx + 1}</span>}
                </button>
                {/* step label */}
                <span
                  className={`${styles.stepLabel} ${isActive ? styles.stepLabelActive : ""}`}
                >
                  {step.label}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className={styles["member-form-container"]}>

        {/* ══ STEP 0: معلومات عامة ══ */}
        {currentStep === 0 && (
          <section className={styles["member-section"]}>
            <h2 className={styles["member-section-title"]}>معلومات عامة عن الأسرة</h2>
            <div className={styles["member-form-grid"]}>
              <div className={styles["member-form-group"]}>
                <label>اسم الأسرة <span style={{color:"var(--error)"}}>*</span></label>
                <input
                  name="name"
                  placeholder="أدخل اسم الأسرة"
                  value={general.name}
                  onChange={handleGeneralChange}
                  className={`${styles["member-input"]} ${hasErr("general.name") ? styles.inputError : ""}`}
                />
              </div>
              <div className={styles["member-form-group"]}>
                <label>وصف الأسرة <span style={{color:"var(--error)"}}>*</span></label>
                <input
                  name="description"
                  placeholder="وصف مختصر للأسرة"
                  value={general.description}
                  onChange={handleGeneralChange}
                  className={`${styles["member-input"]} ${hasErr("general.description") ? styles.inputError : ""}`}
                />
              </div>
              <div className={styles["member-form-group"]}>
                <label>الحد الأدنى للأعضاء <span style={{color:"var(--error)"}}>*</span></label>
                <input
                  name="min_limit"
                  type="number"
                  min={1}
                  max={MAX_MIN_LIMIT}
                  onKeyDown={e => (e.key==="-"||e.key==="e") && e.preventDefault()}
                  value={general.min_limit}
                  onChange={handleGeneralChange}
                  className={`${styles["member-input"]} ${hasErr("general.min_limit") ? styles.inputError : ""}`}
                />
              </div>
            </div>
          </section>
        )}

        {/* ══ STEP 1: الأعضاء ══ */}
        {currentStep === 1 && (
          <section className={styles["member-section"]}>
            <h2 className={styles["member-section-title"]}>
              <Users size={16} /> الأعضاء (المشاركون) — {general.min_limit} عضو
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
                    onChange={e => { const v=e.target.value.replace(/\D/g,""); if(v.length<=14) handleMemberChange(i,v); }}
                    className={`${styles["member-input"]} ${hasErr(`members.${i}.nid`) ? styles.inputError : ""}`}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══ STEP 2: مجلس الإدارة ══ */}
        {currentStep === 2 && (
          <section className={styles["member-section"]}>
            <h2 className={styles["member-section-title"]}>
              <User size={16} /> مجلس إدارة الأسرة
            </h2>
            <div className={styles.assistantGrid}>
              {FULL_INFO_ROLES.map(role => {
                const a = assistants[role] as AssistantItem;
                return (
                  <div key={role} className={`${styles.assistantCard} ${styles.assistantCardFull}`}>
                    <div className={styles.assistantCardHeader}>
                      <User size={14} />
                      <span>{role}</span>
                    </div>
                    <div className={styles["assistant-inputs"]}>
                      <div className={styles["member-form-group"]}>
                        <label>الاسم الكامل <span style={{color:"var(--error)"}}>*</span></label>
                        <input
                          placeholder="الاسم الكامل"
                          value={a.name}
                          onChange={e => handleAssistantChange(role, "name", e.target.value)}
                          className={`${styles["member-input"]} ${hasErr(`assistants.${role}.name`) ? styles.inputError : ""}`}
                        />
                      </div>
                      <div className={styles["member-form-group"]}>
                        <label>الرقم القومي <span style={{color:"var(--error)"}}>*</span></label>
                        <input
                          placeholder="14 رقماً"
                          maxLength={14}
                          value={a.nid}
                          inputMode="numeric"
                          onChange={e => { const v=e.target.value.replace(/\D/g,""); if(v.length<=14) handleAssistantChange(role,"nid",v); }}
                          className={`${styles["member-input"]} ${hasErr(`assistants.${role}.nid`) ? styles.inputError : ""}`}
                        />
                      </div>
                      <div className={styles["member-form-group"]}>
                        <label>رقم الهاتف <span style={{color:"var(--error)"}}>*</span></label>
                        <input
                          placeholder="01XXXXXXXXX"
                          maxLength={11}
                          value={a.ph_no}
                          inputMode="numeric"
                          onChange={e => { const v=e.target.value.replace(/\D/g,""); if(v.length<=11) handleAssistantChange(role,"ph_no",v); }}
                          className={`${styles["member-input"]} ${hasErr(`assistants.${role}.ph_no`) ? styles.inputError : ""}`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              {UID_ROLES.map(role => {
                const a = assistants[role] as AssistantItem;
                return (
                  <div key={role} className={styles.assistantCard}>
                    <div className={styles.assistantCardHeader}>
                      <User size={14} />
                      <span>{role}</span>
                    </div>
                    <div className={styles["member-form-group"]}>
                      <label>الرقم الجامعي <span style={{color:"var(--error)"}}>*</span></label>
                      <input
                        placeholder="أدخل الرقم الجامعي"
                        value={a.uid}
                        inputMode="numeric"
                        onChange={e => { const v=e.target.value.replace(/\D/g,""); if(v.length<=14) handleAssistantChange(role,"uid",v); }}
                        className={`${styles["member-input"]} ${hasErr(`assistants.${role}.uid`) ? styles.inputError : ""}`}
                      />
                    </div>
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
              <Users size={16} /> اللجان
            </h2>
            <div className={styles.committeesWrapper}>
              {committees.map((c, ci) => {
                const isOpen = !!openCommittees[ci];
                return (
                  <div
                    key={c.committee_key}
                    className={`${styles["committee-inputs"]} ${isOpen ? styles.committeeOpen : ""}`}
                  >
                    <div
                      className={styles.committeeSummary}
                      onClick={() => toggleCommittee(ci)}
                    >
                      <span className={styles.committeeDot} />
                      <span>{committeeNames[c.committee_key] ?? c.committee_key}</span>
                      <ChevronLeft size={15} className={styles.committeeChevron} />
                    </div>

                    {isOpen && (
                      <div className={styles.committeeBody}>
                        <div className={styles.committeeGrid}>
                          <div className={styles["member-form-group"]}>
                            <label className={styles.committeeFieldLabel}>الرقم الجامعي للأمين <span style={{color:"var(--error)"}}>*</span></label>
                            <input
                              placeholder="الرقم الجامعي"
                              value={c.head.uid}
                              inputMode="numeric"
                              onChange={e => { const v=e.target.value.replace(/\D/g,""); handleCommitteeChange(ci,"head","uid",v); }}
                              className={`${styles["member-input"]} ${hasErr(`committees.${ci}.head.uid`) ? styles.inputError : ""}`}
                            />
                          </div>
                          <div className={styles["member-form-group"]}>
                            <label className={styles.committeeFieldLabel}>الرقم الجامعي للأمين المساعد <span style={{color:"var(--error)"}}>*</span></label>
                            <input
                              placeholder="الرقم الجامعي"
                              value={c.assistant.uid}
                              inputMode="numeric"
                              onChange={e => { const v=e.target.value.replace(/\D/g,""); handleCommitteeChange(ci,"assistant","uid",v); }}
                              className={`${styles["member-input"]} ${hasErr(`committees.${ci}.assistant.uid`) ? styles.inputError : ""}`}
                            />
                          </div>
                          <div className={styles["member-form-group"]}>
                            <label className={styles.committeeFieldLabel}>القسم</label>
                            <select
                              value={c.head.dept_id}
                              onChange={(e) => {
                                handleCommitteeChange(ci,"head","dept_id",e.target.value);
                                handleCommitteeChange(ci,"assistant","dept_id",e.target.value);
                              }}
                              className={`${styles["member-input"]} ${hasErr(`committees.${ci}.assistant.uid`) ? styles.inputError : ""}`}
                            >
                              <option value="" hidden>اختر القسم</option>
                              {departments.map((d) => (
                                <option key={d.dept_id} value={d.dept_id}>{d.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {c.activities.map((a, ai) => (
                          <div key={ai} className={styles.activityCard}>
                            <div className={styles.activityCardHeader}>
                              <span>مشروع {ai + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeActivity(ci, ai)}
                                className={styles["delete-activity-btn"]}
                                style={{ padding: "4px 12px", fontSize: "0.78rem" }}
                              >
                                <Trash2 size={12} /> حذف
                              </button>
                            </div>
                            <div className={styles.activityGrid}>
                              <div className={`${styles["member-form-group"]} ${styles.activityGridFull}`}>
                                <label className={styles.committeeFieldLabel}>اسم المشروع <span style={{color:"var(--error)"}}>*</span></label>
                                <input
                                  placeholder="اسم المشروع"
                                  value={a.title}
                                  onChange={e => handleActivityChange(ci,ai,"title",e.target.value)}
                                  className={`${styles["member-input"]} ${hasErr(`committees.${ci}.activities.${ai}.title`) ? styles.inputError : ""}`}
                                />
                              </div>
                              <div className={styles["member-form-group"]}>
                                <label className={styles.committeeFieldLabel}>موعد التنفيذ <span style={{color:"var(--error)"}}>*</span></label>
                                <input
                                  type="date"
                                  value={a.st_date}
                                  onChange={e => handleActivityChange(ci,ai,"st_date",e.target.value)}
                                  className={`${styles["member-input"]} ${hasErr(`committees.${ci}.activities.${ai}.st_date`) ? styles.inputError : ""}`}
                                />
                              </div>
                              <div className={styles["member-form-group"]}>
                                <label className={styles.committeeFieldLabel}>مصادر التمويل</label>
                                <input
                                  placeholder="مصادر التمويل"
                                  value={a.description}
                                  onChange={e => handleActivityChange(ci,ai,"description",e.target.value)}
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

        {/* ══ Navigation Buttons ══ */}
        <div className={styles.stepNavButtons}>
          {/* Previous */}
          {currentStep > 0 && (
            <button
              type="button"
              onClick={goToPrev}
              className={styles.stepNavPrev}
            >
              <ChevronLeft size={16} style={{ transform: "rotate(180deg)" }} />
              السابق
            </button>
          )}

          {/* Spacer when no prev button */}
          {currentStep === 0 && <div />}

          {/* Next or Submit */}
          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goToNext}
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
              {isSubmitting ? "جاري الحفظ..." : <><Send size={16} /> حفظ الأسرة</>}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
