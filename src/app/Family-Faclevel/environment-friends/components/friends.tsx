"use client";

import React, { useState } from "react";
import styles from "../styles/friends.module.css";

type NotificationType = "success" | "error";

type Member = { nid: string };

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
  "رائد": { name: string; nid: string; ph_no: string };
  "نائب_رائد": { name: string; nid: string; ph_no: string };
  "مسؤول": { name: string; nid: string; ph_no: string };
  "أمين_صندوق": { name: string; nid: string; ph_no: string };
  "أخ_أكبر": { uid: string };
  "أخت_كبرى": { uid: string };
  "أمين_سر": { uid: string };
  "عضو_منتخب_1": { uid: string };
  "عضو_منتخب_2": { uid: string };
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

export default function FriendsForm() {
  /* ===================== Initial Values ===================== */
  const initialGeneral = { name: "", description: "", min_limit: 15 };
  const MAX_MIN_LIMIT = 150;

  const makeInitialMembers = (len = 15): Member[] =>
    Array.from({ length: len }, () => ({ nid: "" }));

  const initialAssistants: AssistantsState = {
    "رائد": { name: "", nid: "", ph_no: "" },
    "نائب_رائد": { name: "", nid: "", ph_no: "" },
    "مسؤول": { name: "", nid: "", ph_no: "" },
    "أمين_صندوق": { name: "", nid: "", ph_no: "" },
    "أخ_أكبر": { uid: "" },
    "أخت_كبرى": { uid: "" },
    "أمين_سر": { uid: "" },
    "عضو_منتخب_1": { uid: "" },
    "عضو_منتخب_2": { uid: "" },
  };

  const initialCommittees: Committee[] = [
    {
      committee_key: "cultural",
      head: { uid: "", dept_id: "4" },
      assistant: { uid: "", dept_id: "4" },
      activities: [
        { title: "", description: "", st_date: "", end_date: "", location: "", cost: "" },
      ],
    },
    {
      committee_key: "newspaper",
      head: { uid: "", dept_id: "4" },
      assistant: { uid: "", dept_id: "4" },
      activities: [
        { title: "", description: "", st_date: "", end_date: "", location: "", cost: "" },
      ],
    },
    {
      committee_key: "social",
      head: { uid: "", dept_id: "6" },
      assistant: { uid: "", dept_id: "6" },
      activities: [
        { title: "", description: "", st_date: "", end_date: "", location: "", cost: "" },
      ],
    },
    {
      committee_key: "arts",
      head: { uid: "", dept_id: "4" },
      assistant: { uid: "", dept_id: "4" },
      activities: [
        { title: "", description: "", st_date: "", end_date: "", location: "", cost: "" },
      ],
    },
    {
      committee_key: "scientific",
      head: { uid: "", dept_id: "7" },
      assistant: { uid: "", dept_id: "7" },
      activities: [
        { title: "", description: "", st_date: "", end_date: "", location: "", cost: "" },
      ],
    },
    {
      committee_key: "service",
      head: { uid: "", dept_id: "5" },
      assistant: { uid: "", dept_id: "5" },
      activities: [
        { title: "", description: "", st_date: "", end_date: "", location: "", cost: "" },
      ],
    },
    {
      committee_key: "sports",
      head: { uid: "", dept_id: "3" },
      assistant: { uid: "", dept_id: "3" },
      activities: [
        { title: "", description: "", st_date: "", end_date: "", location: "", cost: "" },
      ],
    },
  ];

  /* ===================== States ===================== */
  const [general, setGeneral] = useState(initialGeneral);
  const [members, setMembers] = useState<Member[]>(makeInitialMembers(initialGeneral.min_limit));
  const [assistants, setAssistants] = useState<AssistantsState>(initialAssistants);
  const [committees, setCommittees] = useState<Committee[]>(initialCommittees);

  // ✅ field-level errors only (each input alone turns red)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const hasFieldError = (key: string) => Boolean(fieldErrors[key]);

  const clearFieldError = (key: string) =>
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });

  const clearErrorsByPrefix = (prefix: string) =>
    setFieldErrors((prev) => {
      const copy = { ...prev };
      Object.keys(copy).forEach((k) => {
        if (k.startsWith(prefix)) delete copy[k];
      });
      return copy;
    });

  /* ===================== Notification ===================== */
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(
    null
  );

  const showNotification = (message: string, type: NotificationType) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2500);
  };

  /* ===================== Helpers ===================== */
  const parseJWT = (token: string) => {
    try {
      const payload = token.split(".")[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      console.error("خطأ في قراءة التوكن", e);
      return null;
    }
  };

  const isValidNID = (nid: string) => /^\d{14}$/.test(nid);
  const isValidPhone = (ph: string) => /^\d{11}$/.test(ph);

  const humanizeBackendMessage = (msg: string) => {
    if (!msg) return msg;

    const m = msg.match(/ErrorDetail\(string="([\s\S]*?)",\s*code=.*?\)/);
    if (m?.[1]) return m[1];

    const m2 = msg.match(/ErrorDetail\(string='([\s\S]*?)',\s*code=.*?\)/);
    if (m2?.[1]) return m2[1];

    return msg
      .replace(/^خطأ غير متوقع:\s*\[?/g, "")
      .replace(/\]$/g, "")
      .trim();
  };

  const flattenErrors = (obj: any, prefix = ""): string[] => {
    if (!obj) return [];

    if (typeof obj === "string") return [prefix ? `${prefix}: ${obj}` : obj];

    if (Array.isArray(obj)) {
      return obj.flatMap((item) => flattenErrors(item, prefix));
    }

    if (typeof obj === "object") {
      const out: string[] = [];
      for (const [key, value] of Object.entries(obj)) {
        const nextPrefix = prefix ? `${prefix} > ${key}` : key;
        out.push(...flattenErrors(value, nextPrefix));
      }
      return out;
    }

    return [];
  };

const prettyKey = (key: string) => {
  const map: Record<string, string> = {
    default_roles: "الأدوار الافتراضية",
    participants: "المشاركون",
    uid: "الرقم الجامعي",
    nid: "الرقم القومي",
  };
  return map[key] || key;
};


const prettyRole = (role: string) => role;


const makeFriendlyErrors = (data: any): string[] => {
  if (!data) return [];

  
  if (typeof data.error === "string") {
    return [humanizeBackendMessage(data.error)];
  }

 
  if (typeof data.detail === "string") {
    return [data.detail];
  }

  const errorsRoot = data.errors || data;
  const msgs: string[] = [];

 
  if (errorsRoot?.participants) {
    const p = Array.isArray(errorsRoot.participants)
      ? errorsRoot.participants.join(" ")
      : String(errorsRoot.participants);
    msgs.push(`${prettyKey("participants")}: ${p}`);
  }


  if (errorsRoot?.default_roles && typeof errorsRoot.default_roles === "object") {
    const rolesObj = errorsRoot.default_roles;

    const roleMsgs: string[] = [];
    for (const [role, roleErr] of Object.entries(rolesObj)) {
     
      const uidErr = (roleErr as any)?.uid;

      if (Array.isArray(uidErr) && uidErr.length) {
        roleMsgs.push(`${prettyRole(role)}: ${uidErr.join(" ")}`);
      } else if (typeof uidErr === "string") {
        roleMsgs.push(`${prettyRole(role)}: ${uidErr}`);
      } else {
       
        const flat = flattenErrors(roleErr, "");
        if (flat.length) roleMsgs.push(`${prettyRole(role)}: ${flat.join(" ")}`);
      }
    }

    if (roleMsgs.length) {
      msgs.push(`الأدوار الافتراضية:\n- ${roleMsgs.join("\n- ")}`);
    }
  }

  
  for (const [k, v] of Object.entries(errorsRoot || {})) {
    if (k === "participants" || k === "default_roles") continue;

    const flat = flattenErrors(v, "");
    if (flat.length) msgs.push(`${prettyKey(k)}: ${flat.join(" ")}`);
  }

  return msgs.filter(Boolean);
};

const getBackendErrorMessage = (data: any): string => {
  const list = makeFriendlyErrors(data);
  if (!list.length) return "";


  return list.join(" | ");
};


  /* ===================== Build Request ===================== */
  const buildRequestBody = () => {
    const token = localStorage.getItem("access");
    let faculty_id = 0;

    if (token) {
      const decoded = parseJWT(token);
      if (decoded && decoded.faculty_id) faculty_id = decoded.faculty_id;
    }

    const participants = members.map((m) => m.nid.trim()).filter((nid) => nid !== "");

    return {
      name: general.name,
      description: general.description,
      min_limit: general.min_limit,
      faculty_id,
      participants,
      default_roles: assistants,
      committees: committees.map((c) => ({
        committee_key: c.committee_key,
        head: { uid: Number(c.head.uid), dept_id: Number(c.head.dept_id) },
        assistant: { uid: Number(c.assistant.uid), dept_id: Number(c.assistant.dept_id) },

       
        activities: c.activities.map((a) => ({
          title: a.title,
          description: a.description,
          st_date: a.st_date,
          end_date: a.end_date,
          location: a.location,
          cost: a.cost,
        })),
      })),
    };
  };

  /* ===================== Validation (Front) ===================== */
  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!general.name.trim()) errs["general.name"] = "اسم الأسرة مطلوب";
    if (!general.description.trim()) errs["general.description"] = "وصف الأسرة مطلوب";
   if (!general.min_limit || general.min_limit <= 0)
  errs["general.min_limit"] = "الحد الأدنى للأعضاء غير صحيح";
else if (general.min_limit > MAX_MIN_LIMIT)
  errs["general.min_limit"] = `الحد الأقصى للأعضاء هو ${MAX_MIN_LIMIT}`;


    for (let i = 0; i < members.length; i++) {
      const key = `members.${i}.nid`;
      if (!members[i].nid.trim()) errs[key] = `الرقم القومي للعضو رقم ${i + 1} مطلوب`;
      else if (!isValidNID(members[i].nid))
        errs[key] = `الرقم القومي للعضو رقم ${i + 1} يجب أن يكون 14 رقم`;
    }
      // ✅ Assistants Validation
      const assistantsWithPersonData: AssistantRole[] = [
        "رائد",
        "نائب_رائد",
        "مسؤول",
        "أمين_صندوق",
      ];

      const assistantsWithUid: AssistantRole[] = [
        "أخ_أكبر",
        "أخت_كبرى",
        "أمين_سر",
        "عضو_منتخب_1",
        "عضو_منتخب_2",
      ];

      assistantsWithPersonData.forEach((role) => {
        const a = assistants[role] as any;

        if (!a.name?.trim()) errs[`assistants.${role}.name`] = `اسم ${role} مطلوب`;

        if (!a.nid?.trim()) errs[`assistants.${role}.nid`] = `الرقم القومي لـ ${role} مطلوب`;
        else if (!isValidNID(a.nid)) errs[`assistants.${role}.nid`] = `الرقم القومي لـ ${role} يجب أن يكون 14 رقم`;

        if (!a.ph_no?.trim()) errs[`assistants.${role}.ph_no`] = `رقم هاتف ${role} مطلوب`;
        else if (!isValidPhone(a.ph_no)) errs[`assistants.${role}.ph_no`] = `رقم هاتف ${role} يجب أن يكون 11 رقم`;
      });

      assistantsWithUid.forEach((role) => {
        const a = assistants[role] as any;

        if (!a.uid?.trim()) errs[`assistants.${role}.uid`] = `الرقم الجامعي لـ ${role} مطلوب`;
        else if (!/^\d+$/.test(a.uid)) errs[`assistants.${role}.uid`] = `الرقم الجامعي لـ ${role} لازم أرقام فقط`;
      });

    for (let ci = 0; ci < committees.length; ci++) {
      const c = committees[ci];

      if (!c.head.uid) errs[`committees.${ci}.head.uid`] = "الرقم الجامعي للأمين مطلوب";
      if (!c.assistant.uid) errs[`committees.${ci}.assistant.uid`] = "الرقم الجامعي للأمين المساعد مطلوب";

      // ✅ لو activities فاضية: نعدّي بدون ما نطلب عنوان/تواريخ
      for (let ai = 0; ai < c.activities.length; ai++) {
        const a = c.activities[ai];

        if (!a.title.trim())
          errs[`committees.${ci}.activities.${ai}.title`] = "عنوان النشاط مطلوب";
        if (!a.st_date)
          errs[`committees.${ci}.activities.${ai}.st_date`] = "تاريخ بداية النشاط مطلوب";
        if (!a.end_date)
          errs[`committees.${ci}.activities.${ai}.end_date`] = "تاريخ نهاية النشاط مطلوب";
      }
    }

    setFieldErrors(errs);

    const firstKey = Object.keys(errs)[0];
    return firstKey ? errs[firstKey] : null;
  };

  /* ===================== Reset ===================== */
  const resetForm = () => {
    setGeneral(initialGeneral);
    setMembers(makeInitialMembers(initialGeneral.min_limit));
    setAssistants(initialAssistants);
    setCommittees(initialCommittees);
    setFieldErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ===================== Handlers ===================== */
  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;

  const parsed =
    name === "min_limit" ? Number(value || 0) : value;

  const capped =
    name === "min_limit" ? Math.min(Math.max(parsed as number, 1), MAX_MIN_LIMIT) : parsed;

  const newGeneral = {
    ...general,
    [name]: capped,
  };

  setGeneral(newGeneral);

  if (name === "name") clearFieldError("general.name");
  if (name === "description") clearFieldError("general.description");

  if (name === "min_limit") {
    clearFieldError("general.min_limit");

    const newLength = Number(capped);

    setMembers((prevMembers) => {
      const newMembers = [...prevMembers];

      while (newMembers.length < newLength) newMembers.push({ nid: "" });
      if (newMembers.length > newLength) newMembers.length = newLength;

      return newMembers;
    });

    clearErrorsByPrefix("members.");
  }
};


  const handleMemberChange = (index: number, value: string) => {
    setMembers((prevMembers) => {
      const newMembers = [...prevMembers];
      newMembers[index] = { nid: value };
      return newMembers;
    });
    clearFieldError(`members.${index}.nid`);
  };

const handleAssistantChange = (role: AssistantRole, field: string, value: string) => {
  setAssistants((prev) => ({
    ...prev,
    [role]: { ...(prev as any)[role], [field]: value },
  }));

  clearFieldError(`assistants.${role}.${field}`);
};


  const handleCommitteeChange = (index: number, field: string, subField: string, value: string) => {
    setCommittees((prev) => {
      const newCommittees = [...prev];
      const target: any = newCommittees[index];

      if (subField) {
        target[field][subField] = value;
      } else {
        target[field] = value;
      }

      return newCommittees;
    });

    if (field === "head" && subField === "uid") clearFieldError(`committees.${index}.head.uid`);
    if (field === "assistant" && subField === "uid")
      clearFieldError(`committees.${index}.assistant.uid`);
  };

  const handleActivityChange = (
    committeeIndex: number,
    activityIndex: number,
    field: keyof Activity,
    value: string
  ) => {
    setCommittees((prev) => {
      const newCommittees = [...prev];
      newCommittees[committeeIndex].activities[activityIndex][field] = value;
      return newCommittees;
    });

    clearFieldError(`committees.${committeeIndex}.activities.${activityIndex}.${field}`);
  };

  const addActivity = (committeeIndex: number) => {
    setCommittees((prev) => {
      const newCommittees = [...prev];
      newCommittees[committeeIndex].activities.push({
        title: "",
        description: "",
        st_date: "",
        end_date: "",
        location: "",
        cost: "",
      });
      return newCommittees;
    });
  };

  const removeActivity = (committeeIndex: number, activityIndex: number) => {
    setCommittees((prev) => {
      const newCommittees = [...prev];
      newCommittees[committeeIndex].activities.splice(activityIndex, 1);
      return newCommittees;
    });

    // ✅ امسح أخطاء الفعالية اللي اتمسحت
    clearErrorsByPrefix(`committees.${committeeIndex}.activities.${activityIndex}.`);
    // ✅ كمان امسح باقي activities errors للجنة دي (عشان indexes بتتزحزح بعد splice)
    clearErrorsByPrefix(`committees.${committeeIndex}.activities.`);
  };

  /* ===================== Submit ===================== */
  const handleSubmit = async () => {
    const errorMessage = validateForm();
    if (errorMessage) {
      showNotification(`❌ ${errorMessage}`, "error");
      return;
    }

    const body = buildRequestBody();
    const token = localStorage.getItem("access");

    try {
      const res = await fetch("http://localhost:8000/api/family/faculty/environment-family/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json") ? await res.json() : null;

      if (!res.ok) {
        const msg = getBackendErrorMessage(data) || "يوجد خطأ في البيانات المرسلة";
        showNotification(`❌ ${msg}`, "error");
        return;
      }

      showNotification("✅ تم حفظ الأسرة بنجاح", "success");
      resetForm();
    } catch (err) {
      showNotification("❌ خطأ في الاتصال بالسيرفر", "error");
    }
  };

  /* ===================== UI ===================== */
  return (
    <div className={styles.formContainer}>
      {notification && (
        <div
          className={`${styles.notification} ${
            notification.type === "success" ? styles.success : styles.error
          }`}
        >
          {notification.message}
        </div>
      )}

      <header className={styles.formHeader}>
        <div className={styles.formHeaderContent}>
          <h1 className={styles.formTitle}>إنشاء أسرة أصدقاء البيئة</h1>
          <p className={styles.formSubtitle}>
            إدارة الأسرة الطلابية / طلبات / إنشاء أسرة أصدقاء البيئة
          </p>
        </div>
      </header>

      <div className={styles["member-form-container"]}>
        {/* الحقول العامة */}
        <section className={styles["member-section"]}>
          <h2 className={styles["member-section-title"]}>معلومات عامة عن الأسرة</h2>

          <div className={styles["member-form-grid"]}>
            <div className={styles["member-form-group"]}>
              <label>اسم الأسرة</label>
              <input
                name="name"
                placeholder="اسم الاسرة"
                value={general.name}
                onChange={handleGeneralChange}
                className={`${styles["member-input"]} ${
                  hasFieldError("general.name") ? styles.inputError : ""
                }`}
              />
            </div>

            <div className={styles["member-form-group"]}>
              <label>الوصف</label>
              <input
                name="description"
                placeholder="وصف الأسرة"
                value={general.description}
                onChange={handleGeneralChange}
                className={`${styles["member-input"]} ${
                  hasFieldError("general.description") ? styles.inputError : ""
                }`}
              />
            </div>

            <div className={styles["member-form-group"]}>
              <label>الحد الأدنى للأعضاء</label>
              <input
                name="min_limit"
                type="number"
                min={1}
                max={MAX_MIN_LIMIT}
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e") e.preventDefault();
                }}
                value={general.min_limit}
                onChange={handleGeneralChange}
                className={`${styles["member-input"]} ${
                  hasFieldError("general.min_limit") ? styles.inputError : ""
                }`}
              />
            </div>
          </div>
        </section>

        {/* أعضاء الأسرة */}
        <section className={styles["member-section"]}>
          <h2 className={styles["member-section-title"]}>الأعضاء (المشاركين)</h2>

          <div className={styles["member-form-grid"]}>
            {members.map((member, index) => (
              <div key={index} className={styles["member-form-group"]}>
                <label>عضو {index + 1}</label>
                <input
                  type="text"
                  placeholder="الرقم القومي"
                  value={member.nid}
                  maxLength={14}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 14) handleMemberChange(index, val);
                  }}
                  className={`${styles["member-input"]} ${
                    hasFieldError(`members.${index}.nid`) ? styles.inputError : ""
                  }`}
                />
              </div>
            ))}
          </div>
        </section>

        {/* المساعدين */}
        <section className={styles["member-section"]}>
          <h2 className={styles["member-section-title"]}>المساعدين</h2>

          {Object.entries(assistants).map(([role, val]) => (
            <div key={role} className={styles["assistant-inputs"]}>
              <label>{role}</label>

              {"name" in (val as any) ? (
                <>
                  <input
                    type="text"
                    placeholder="الاسم"
                    value={(val as any).name}
                    onChange={(e) => handleAssistantChange(role as AssistantRole, "name", e.target.value)}
                    className={`${styles["member-input"]} ${
                    hasFieldError(`assistants.${role}.name`) ? styles.inputError : ""
                  }`}

                  />

                  <input
                    type="text"
                    placeholder="الرقم القومي"
                    value={(val as any).nid}
                    maxLength={14}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      if (v.length <= 14) handleAssistantChange(role as AssistantRole, "nid", v);
                    }}
                   className={`${styles["member-input"]} ${
                  hasFieldError(`assistants.${role}.nid`) ? styles.inputError : ""
                }`}

                  />

                  <input
                    type="text"
                    placeholder="رقم الهاتف"
                    value={(val as any).ph_no}
                    maxLength={11}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      if (v.length <= 11) handleAssistantChange(role as AssistantRole, "ph_no", v);
                    }}
                   className={`${styles["member-input"]} ${
                    hasFieldError(`assistants.${role}.ph_no`) ? styles.inputError : ""
                  }`}
                  />
                </>
              ) : (
                <input
                  type="text"
                  placeholder="رقم الجامعي"
                  value={(val as any).uid}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    if (v.length <= 14) handleAssistantChange(role as AssistantRole, "uid", v);
                  }}
                  className={`${styles["member-input"]} ${
                    hasFieldError(`assistants.${role}.uid`) ? styles.inputError : ""
                  }`}
                />
              )}
            </div>
          ))}
        </section>

        {/* اللجان */}
        <section className={styles["member-section"]}>
          <h2 className={styles["member-section-title"]}>اللجان</h2>

          {committees.map((c, i) => (
            <div
              key={c.committee_key}
              className={styles["committee-inputs"]}
              style={{ marginBottom: "20px" }}
            >
              <h3>
                {(() => {
                  switch (c.committee_key) {
                    case "cultural":
                      return "اللجنة الثقافية";
                    case "newspaper":
                      return "لجنة صحف الحائط";
                    case "social":
                      return "اللجنة الاجتماعية والرحلات";
                    case "arts":
                      return "اللجنة الفنية";
                    case "scientific":
                      return "اللجنة العلمية";
                    case "service":
                      return "لجنة الخدمة العامة والمعسكرات";
                    case "sports":
                      return "اللجنة الرياضية";
                    default:
                      return c.committee_key;
                  }
                })()}
              </h3>

              {/* Head */}
              <div className={styles["committee-head"]} style={{ marginBottom: "10px" }}>
                <h4>الأمين</h4>
                <input
                  type="text"
                  placeholder="الرقم الجامعي"
                  value={c.head.uid}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    handleCommitteeChange(i, "head", "uid", v);
                  }}
                  className={`${styles["member-input"]} ${
                    hasFieldError(`committees.${i}.head.uid`) ? styles.inputError : ""
                  }`}
                />
              </div>

              {/* Assistant */}
              <div className={styles["committee-assistant"]} style={{ marginBottom: "10px" }}>
                <h4>الأمين المساعد</h4>
                <input
                  type="text"
                  placeholder="الرقم الجامعي"
                  value={c.assistant.uid}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    handleCommitteeChange(i, "assistant", "uid", v);
                  }}
                  className={`${styles["member-input"]} ${
                    hasFieldError(`committees.${i}.assistant.uid`) ? styles.inputError : ""
                  }`}
                />
              </div>

              {/* الأنشطة */}
              {c.activities.length > 0 ? (
                c.activities.map((a, j) => (
                  <div
                    key={j}
                    className={styles["activity-section"]}
                    style={{ marginBottom: "15px" }}
                  >
                    <h4 style={{ marginBottom: "10px" }}>فعالية {j + 1}</h4>

                    <input
                      placeholder="عنوان النشاط"
                      style={{ marginBottom: "10px" }}
                      value={a.title}
                      onChange={(e) => handleActivityChange(i, j, "title", e.target.value)}
                      className={`${styles["member-input"]} ${
                        hasFieldError(`committees.${i}.activities.${j}.title`) ? styles.inputError : ""
                      }`}
                    />

                    <input
                      placeholder="وصف النشاط"
                      style={{ marginBottom: "10px" }}
                      value={a.description}
                      onChange={(e) => handleActivityChange(i, j, "description", e.target.value)}
                      className={styles["member-input"]}
                    />

                    <input
                      type="date"
                      placeholder="تاريخ البداية"
                      style={{ marginBottom: "10px" }}
                      value={a.st_date}
                      onChange={(e) => handleActivityChange(i, j, "st_date", e.target.value)}
                      className={`${styles["member-input"]} ${
                        hasFieldError(`committees.${i}.activities.${j}.st_date`)
                          ? styles.inputError
                          : ""
                      }`}
                    />

                    <input
                      type="date"
                      placeholder="تاريخ النهاية"
                      style={{ marginBottom: "10px" }}
                      value={a.end_date}
                      onChange={(e) => handleActivityChange(i, j, "end_date", e.target.value)}
                      className={`${styles["member-input"]} ${
                        hasFieldError(`committees.${i}.activities.${j}.end_date`)
                          ? styles.inputError
                          : ""
                      }`}
                    />

                    <input
                      placeholder="المكان"
                      style={{ marginBottom: "10px" }}
                      value={a.location}
                      onChange={(e) => handleActivityChange(i, j, "location", e.target.value)}
                      className={styles["member-input"]}
                    />

                    <input
                      placeholder="التكلفة"
                      style={{ marginBottom: "10px" }}
                      value={a.cost}
                      onChange={(e) => handleActivityChange(i, j, "cost", e.target.value)}
                      className={styles["member-input"]}
                    />

                    <div className={styles["activity-buttons"]}>
                      <button
                        type="button"
                        onClick={() => addActivity(i)}
                        className={styles["add-activity-btn"]}
                      >
                        إضافة فعالية جديدة
                      </button>

                      <button
                        type="button"
                        onClick={() => removeActivity(i, j)}
                        className={styles["delete-activity-btn"]}
                      >
                        حذف الفعالية
                      </button>
                    </div>
                  </div>
                ))
              ) : (

                <button
                  type="button"
                  onClick={() => addActivity(i)}
                  className={styles["add-activity-btn"]}
                  style={{ marginTop: 10 }}
                >
                  إضافة فعالية جديدة
                </button>
              )}
            </div>
          ))}
        </section>

        <button onClick={handleSubmit} className={styles["add-member-btn"]} style={{ marginTop: 20 }}>
          حفظ الأسرة
        </button>
      </div>
    </div>
  );
}
