"use client";

import React, { useState } from "react";
import styles from "../styles/friends.module.css";

export default function FriendsForm() {
  
  const [general, setGeneral] = useState({
    name: "",
    description: "",
    min_limit: 15,
  });

const [members, setMembers] = useState<{ nid: string }[]>(Array(general.min_limit).fill({ nid: "" }));

const clearError = () => setHasError(false);


  const [assistants, setAssistants] = useState({
    "رائد": { name: "", nid: "", ph_no: "" },
    "نائب_رائد": { name: "", nid: "", ph_no: "" },
    "مسؤول": { name: "", nid: "", ph_no: "" },
    "أمين_صندوق": { name: "", nid: "", ph_no: "" },
    "أخ_أكبر": { uid: "" },
    "أخت_كبرى": { uid: "" },
    "أمين_سر": { uid: "" },
    "عضو_منتخب_1": { uid: "" },
    "عضو_منتخب_2": { uid: "" },
  });

  
  const [committees, setCommittees] = useState([
    {
      committee_key: "cultural",
      head: { uid: "", dept_id: "4" },
      assistant: { uid: "", dept_id: "4" },
      activities: [{ title: "", description: "", st_date: "", end_date: "", location: "", cost: "" }],
    },
    {
      committee_key: "newspaper",
      head: { uid: "", dept_id: "4" },
      assistant: { uid: "", dept_id: "4" },
      activities: [{ title: "", description: "", st_date: "", end_date: "", location: "", cost: "" }],
    },
    {
      committee_key: "social",
      head: { uid: "", dept_id: "6" },
      assistant: { uid: "", dept_id: "6" },
      activities: [{ title: "", description: "", st_date: "", end_date: "", location: "", cost: "" }],
    },
    {
      committee_key: "arts",
      head: { uid: "", dept_id: "4" },
      assistant: { uid: "", dept_id: "4" },
      activities: [{ title: "", description: "", st_date: "", end_date: "", location: "", cost: "" }],
    },
    {
      committee_key: "scientific",
      head: { uid: "", dept_id: "7" },
      assistant: { uid: "", dept_id: "7" },
      activities: [{ title: "", description: "", st_date: "", end_date: "", location: "", cost: "" }],
    },
    {
      committee_key: "service",
      head: { uid: "", dept_id: "5" },
      assistant: { uid: "", dept_id: "5" },
      activities: [{ title: "", description: "", st_date: "", end_date: "", location: "", cost: "" }],
    },
    {
      committee_key: "sports",
      head: { uid: "", dept_id: "3" },
      assistant: { uid: "", dept_id: "3" },
      activities: [{ title: "", description: "", st_date: "", end_date: "", location: "", cost: "" }],
    },
  ]);
const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  const newGeneral = { ...general, [name]: name === "min_limit" ? Number(value) : value };
  setGeneral(newGeneral);

  if (name === "min_limit") {
    const newLength = Number(value);
    const newMembers = [...members];

    while (newMembers.length < newLength) newMembers.push({ nid: "" });

    
    if (newMembers.length > newLength) newMembers.length = newLength;

    setMembers(newMembers);
  }
};

const addActivity = (committeeIndex: number) => {
  const newCommittees = [...committees];
  newCommittees[committeeIndex].activities.push({
    title: "",
    description: "",
    st_date: "",
    end_date: "",
    location: "",
    cost: "",
  });
  setCommittees(newCommittees);
};

const removeActivity = (committeeIndex: number, activityIndex: number) => {
  const newCommittees = [...committees];
  newCommittees[committeeIndex].activities.splice(activityIndex, 1);
  setCommittees(newCommittees);
};

const handleMemberChange = (index: number, value: string) => {
  const newMembers = [...members];
  newMembers[index].nid = value;
  setMembers(newMembers);
};


  const handleAssistantChange = (role: string, field: string, value: string) => {
    setAssistants({
      ...assistants,
      [role]: { ...assistants[role as keyof typeof assistants], [field]: value },
    });
  };

  const handleCommitteeChange = (index: number, field: string, subField: string, value: string) => {
    const newCommittees = [...committees];
    if (subField) {
      (newCommittees[index][field as keyof typeof newCommittees[number]] as any)[subField] = value;
    } else {
      (newCommittees[index] as any)[field] = value;
    }
    setCommittees(newCommittees);
  };

  const handleActivityChange = (committeeIndex: number, activityIndex: number, field: string, value: string) => {
    const newCommittees = [...committees];
    newCommittees[committeeIndex].activities[activityIndex][field as keyof typeof newCommittees[number]["activities"][number]] = value;
    setCommittees(newCommittees);
  };

  
const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);


const showNotification = (message: string, type: "success" | "error") => {
  setNotification({ message, type });
  setTimeout(() => setNotification(null), 2500); 
};


const parseJWT = (token: string) => {
  try {
    const payload = token.split(".")[1]; 
    return JSON.parse(atob(payload));   
  } catch (e) {
    console.error("خطأ في قراءة التوكن", e);
    return null;
  }
};

const buildRequestBody = () => {
  const token = localStorage.getItem("access");
  let faculty_id = 0;
  if (token) {
    const decoded = parseJWT(token);
    if (decoded && decoded.faculty_id) {
      faculty_id = decoded.faculty_id; 
    }
  }

  return {
    name: general.name,
    description: general.description,
    min_limit: general.min_limit,
    faculty_id,          
    family_type: "أصدقاء البيئة",
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
const isValidNID = (nid: string) => {
  return /^\d{14}$/.test(nid);
};

const validateForm = () => {
  
  if (!general.name.trim()) return "اسم الأسرة مطلوب";
  if (!general.description.trim()) return "وصف الأسرة مطلوب";
  if (!general.min_limit || general.min_limit <= 0) return "الحد الأدنى للأعضاء غير صحيح";

  
  for (let i = 0; i < members.length; i++) {
    if (!members[i].nid.trim()) {
      return `الرقم القومي للعضو رقم ${i + 1} مطلوب`;
    }
    if (!isValidNID(members[i].nid)) {
      return `الرقم القومي للعضو رقم ${i + 1} يجب أن يكون 14 رقم`;
    }
  }

  
  for (let c of committees) {
    if (!c.head.uid) {
      return "الرقم الجامعي للأمين مطلوب في جميع اللجان";
    }
    if (!c.assistant.uid) {
      return "الرقم الجامعي للأمين المساعد مطلوب في جميع اللجان";
    }

    
    for (let a of c.activities) {
      if (!a.title.trim()) return "عنوان النشاط مطلوب";
      if (!a.st_date) return "تاريخ بداية النشاط مطلوب";
      if (!a.end_date) return "تاريخ نهاية النشاط مطلوب";
    }
  }

  return null; 
};
const [hasError, setHasError] = useState(false);


const handleSubmit = async () => {
  const errorMessage = validateForm();

  if (errorMessage) {
    setHasError(true);        
    showNotification(`❌ ${errorMessage}`, "error");
    return;
  }

  setHasError(false);        
  const body = buildRequestBody();
  const token = localStorage.getItem("access");

  try {
    const res = await fetch(
      "http://localhost:8000/api/family/faculty/environment-family/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      showNotification("❌ يوجد خطأ في البيانات المرسلة", "error");
      setHasError(true);
    } else {
      showNotification("✅ تم حفظ الأسرة بنجاح", "success");
      setHasError(false);
    }
  } catch (err) {
    showNotification("❌ خطأ في الاتصال بالسيرفر", "error");
    setHasError(true);
  }
};


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
          <p className={styles.formSubtitle}>إدارة الأسرة الطلابية / طلبات / إنشاء أسرة أصدقاء البيئة</p>
        </div>
      </header>

      <div className={styles["member-form-container"]}>
        {/* الحقول العامة */}
        <section className={styles["member-section"]}>
          <h2 className={styles["member-section-title"]}>معلومات عامة عن الأسرة</h2>
          <div className={styles["member-form-grid"]}>
            <div className={styles["member-form-group"]}>
              <label>اسم الأسرة</label>
              <input name="name" placeholder="اسم الاسرة" value={general.name} onChange={(e) => {
  clearError();
  handleGeneralChange(e);
}}
  className={`${styles["member-input"]} ${
    hasError ? styles.inputError : ""
  }`}
 />
            </div>
            <div className={styles["member-form-group"]}>
              <label>الوصف</label>
              <input name="description" placeholder="وصف الأسرة" value={general.description} onChange={(e) => {
  clearError();
  handleGeneralChange(e);
}}
  className={`${styles["member-input"]} ${
    hasError ? styles.inputError : ""
  }`}
 />
            </div>
            <div className={styles["member-form-group"]}>
              <label>الحد الأدنى للأعضاء</label>
            <input
              name="min_limit"
              type="number"
              min={1}
              onKeyDown={(e) => {
                if (e.key === "-" || e.key === "e") e.preventDefault();
              }}
              value={general.min_limit}
              onChange={(e) => {
                clearError();
                handleGeneralChange(e);
              }}

                className={`${styles["member-input"]} ${
hasError ? styles.inputError : ""
  }`}

            />
            </div>
          </div>
        </section>

        {/* أعضاء الأسرة */}
        <section className={styles["member-section"]}>
          <h2 className={styles["member-section-title"]}>الأعضاء</h2>
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
              clearError();
              const val = e.target.value.replace(/\D/g, "");
              if (val.length <= 14) handleMemberChange(index, val);
            }}
              className={`${styles["member-input"]} ${
    hasError ? styles.inputError : ""
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
              {("name" in val) ? (
                <>
                  <input type="text" placeholder="الاسم" value={val.name} onChange={(e) => { clearError(); handleAssistantChange(role, "name", e.target.value); }}  className={`${styles["member-input"]} ${
    hasError ? styles.inputError : ""
  }`}
 />
                <input
                type="text"
                placeholder="الرقم القومي"
                value={val.nid}
                maxLength={14}
                inputMode="numeric"
                pattern="[0-9]*"
                onChange={(e) => {
                  clearError();
                  const v = e.target.value.replace(/\D/g, "");
                  if (v.length <= 14) handleAssistantChange(role, "nid", v);
                }}
                  className={`${styles["member-input"]} ${
    hasError ? styles.inputError : ""
  }`}

              />

                <input
                type="text"
                placeholder="رقم الهاتف"
                value={val.ph_no}
                maxLength={11}
                inputMode="numeric"
                pattern="[0-9]*"
                onChange={(e) => {
                  clearError();
                  const v = e.target.value.replace(/\D/g, "");
                  if (v.length <= 11) handleAssistantChange(role, "ph_no", v);
                }}
                  className={`${styles["member-input"]} ${
    hasError ? styles.inputError : ""
  }`}

              />

                </>
              ) : (
                <input
                type="text"
                placeholder="رقم الجامعي"
                value={val.uid}
                inputMode="numeric"
                pattern="[0-9]*"
                onChange={(e) => {
                  clearError();
                  const v = e.target.value.replace(/\D/g, "");
                  if (v.length <= 14) handleAssistantChange(role, "uid", v);
                }}
                  className={`${styles["member-input"]} ${
    hasError ? styles.inputError : ""
  }`}

              />

              )}
            </div>
          ))}
        </section>
<section className={styles["member-section"]}>
  <h2 className={styles["member-section-title"]}>اللجان</h2>
   {committees.map((c, i) => (
  <div key={c.committee_key} className={styles["committee-inputs"]} style={{ marginBottom: "20px" }}>
    <h3>
      {(() => {
        switch (c.committee_key) {
          case "cultural": return "اللجنة الثقافية";
          case "newspaper": return "لجنة صحف الحائط";
          case "social": return "اللجنة الاجتماعية والرحلات";
          case "arts": return "اللجنة الفنية";
          case "scientific": return "اللجنة العلمية";
          case "service": return "لجنة الخدمة العامة والمعسكرات";
          case "sports": return "اللجنة الرياضية";
          default: return c.committee_key;
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
    clearError();
    const v = e.target.value.replace(/\D/g, "");
    handleCommitteeChange(i, "head", "uid", v);
  }}
    className={`${styles["member-input"]} ${
    hasError ? styles.inputError : ""
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
    clearError();
    const v = e.target.value.replace(/\D/g, "");
    handleCommitteeChange(i, "assistant", "uid", v);
  }}
    className={`${styles["member-input"]} ${
    hasError ? styles.inputError : ""
  }`}

/>

    </div>

    {/* الأنشطة */}
    {c.activities.length > 0 ? (
      c.activities.map((a, j) => (
        <div key={j} className={styles["activity-section"]} style={{ marginBottom: "15px" }}>
          <h4 style={{ marginBottom: "10px" }}>فعالية {j + 1}</h4>
          <input placeholder="عنوان النشاط" style={{ marginBottom: "10px" }} value={a.title} onChange={(e) => { clearError(); handleActivityChange(i, j, "title", e.target.value); }}   className={`${styles["member-input"]} ${
    hasError ? styles.inputError : ""
  }`}
 />
          <input placeholder="وصف النشاط"style={{ marginBottom: "10px" }} value={a.description} onChange={(e) => { clearError(); handleActivityChange(i, j, "description", e.target.value); } }   className={`${styles["member-input"]} ${
    hasError ? styles.inputError : ""
  }`}
 />
          <input type="date" placeholder="تاريخ البداية"style={{ marginBottom: "10px" }} value={a.st_date} onChange={(e) => { clearError(); handleActivityChange(i, j, "st_date", e.target.value); }}   className={`${styles["member-input"]} ${
    hasError ? styles.inputError : ""
  }`}
 />
          <input type="date" placeholder="تاريخ النهاية" style={{ marginBottom: "10px" }}value={a.end_date} onChange={(e) => { clearError(); handleActivityChange(i, j, "end_date", e.target.value); }}   className={`${styles["member-input"]} ${
    hasError ? styles.inputError : ""
  }`}
 />
          <input placeholder="المكان"style={{ marginBottom: "10px" }} value={a.location} onChange={(e) => { clearError(); handleActivityChange(i, j, "location", e.target.value); }}   className={`${styles["member-input"]} ${
    hasError ? styles.inputError : ""
  }`}
 />
          <input placeholder="التكلفة"style={{ marginBottom: "10px" }} value={a.cost} onChange={(e) => { clearError(); handleActivityChange(i, j, "cost", e.target.value); }}   className={`${styles["member-input"]} ${
    hasError ? styles.inputError : ""
  }`}
 />

          <div className={styles["activity-buttons"]}>
            <button type="button" onClick={() => addActivity(i)} className={styles["add-activity-btn"]}>
              إضافة فعالية جديدة
            </button>
            <button type="button" onClick={() => removeActivity(i, j)} className={styles["delete-activity-btn"]}>
              حذف الفعالية
            </button>
          </div>
        </div>
      ))
    ) : (
      
      <button type="button" onClick={() => addActivity(i)} className={styles["add-activity-btn"]} style={{ marginTop: 10 }}>
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
