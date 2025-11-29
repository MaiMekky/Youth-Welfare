"use client";

import React, { useState } from "react";
import styles from "../styles/friends.module.css";

export default function FriendsForm() {
  const [members, setMembers] = useState({
    الاسم: "",
    "الرقم القومي": "",
    "الرقم الجامعي": "",
    "رقم الهاتف": "",
    العنوان: "",
    "الفرقة الدراسية": "",
  });

  const [assistants, setAssistants] = useState({
    "رائد الأسرة": { الاسم: "", الدور: "" },
    "نائب الرائد": { الاسم: "", الدور: "" },
    "مسؤول الأسرة": { الاسم: "", الدور: "" },
    "أمين الصندوق": { الاسم: "", الدور: "" },
    "الأخ الأكبر": { الاسم: "", الدور: "" },
    "الأخت الكبرى": { الاسم: "", الدور: "" },
    "السكرتير / أمين السر": { الاسم: "", الدور: "" },
    "عضو منتخب (1)": { الاسم: "", الدور: "" },
    "عضو منتخب (2)": { الاسم: "", الدور: "" },
  });

  const [committees, setCommittees] = useState({
    "اللجنة الثقافية": { الأمين: "", "الأمين المساعد": "" },
    "لجنة صحف الحائط": { الأمين: "", "الأمين المساعد": "" },
    "اللجنة الاجتماعية والرحلات": { الأمين: "", "الأمين المساعد": "" },
    "اللجنة الفنية": { الأمين: "", "الأمين المساعد": "" },
    "اللجنة العلمية": { الأمين: "", "الأمين المساعد": "" },
    "لجنة الخدمة العامة والمعسكرات": { الأمين: "", "الأمين المساعد": "" },
    "اللجنة الرياضية": { الأمين: "", "الأمين المساعد": "" },
  });

  const [errors, setErrors] = useState({} as Record<string, string>);


  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };
    switch (name) {
      case "الرقم القومي":
        if (!/^\d{10}$/.test(value)) newErrors[`member-${name}`] = "الرقم القومي يجب أن يكون 10 أرقام";
        else delete newErrors[`member-${name}`];
        break;
      case "الرقم الجامعي":
        if (!/^\d{9}$/.test(value)) newErrors[`member-${name}`] = "الرقم الجامعي يجب أن يكون 9 أرقام";
        else delete newErrors[`member-${name}`];
        break;
      default:
        if (!value.trim()) newErrors[`member-${name}`] = "هذا الحقل مطلوب";
        else delete newErrors[`member-${name}`];
    }
    setErrors(newErrors);
  };


  const handleMemberChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMembers({ ...members, [name]: value });
    validateField(name, value);
  };


  const handleAssistantChange = (role: string, field: string, value: string) => {
    setAssistants({ ...assistants, [role]: { ...assistants[role], [field]: value } });
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, [`assistant-${role}`]: `يرجى تعيين شخص لهذا الدور` }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`assistant-${role}`];
        return newErrors;
      });
    }
  };


  const handleCommitteeChange = (committee: string, field: string, value: string) => {
    setCommittees({ ...committees, [committee]: { ...committees[committee], [field]: value } });
    const errorKey = `committee-${committee}-${field}`;
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, [errorKey]: `هذا الحقل مطلوب` }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };


  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};


    Object.entries(members).forEach(([key, value]) => {
      if (!value.trim()) newErrors[`member-${key}`] = "هذا الحقل مطلوب";
    });
    if (!/^\d{10}$/.test(members["الرقم القومي"])) newErrors[`member-الرقم القومي`] = "الرقم القومي يجب أن يكون 10 أرقام";
    if (!/^\d{9}$/.test(members["الرقم الجامعي"])) newErrors[`member-الرقم الجامعي`] = "الرقم الجامعي يجب أن يكون 9 أرقام";

   
    Object.entries(assistants).forEach(([role, assistant]) => {
      if (!assistant.الدور.trim()) newErrors[`assistant-${role}`] = `يرجى تعيين شخص لهذا الدور`;
    });

  
    Object.entries(committees).forEach(([committeeName, committee]) => {
      if (!committee.الأمين.trim()) newErrors[`committee-${committeeName}-الأمين`] = `اسم الأمين مطلوب`;
      if (!committee["الأمين المساعد"].trim()) newErrors[`committee-${committeeName}-الأمين المساعد`] = `اسم الأمين المساعد مطلوب`;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert("الرجاء ملء جميع الحقول المطلوبة للأعضاء، المساعدين، واللجان");
      return;
    }

    console.log({ members, assistants, committees });
    alert("تم حفظ الأسرة بنجاح!");
  };

  const yearOptions = ["الفرقة الأولى", "الفرقة الثانية", "الفرقة الثالثة", "الفرقة الرابعة"];

  return (
    <div className={styles.formContainer}>
      <header className={styles.formHeader}>
        <div className={styles.formHeaderContent}>
          <h1 className={styles.formTitle}>إنشاء أسرة أصدقاء البيئة</h1>
          <p className={styles.formSubtitle}>إدارة الأسرة الطلابية / طلبات / إنشاء أسرة أصدقاء البيئة</p>
        </div>
      </header>

      <div className={styles["member-form-container"]}>
        {/* Members Section */}
        <section className={styles["member-section"]}>
          <h2 className={styles["member-section-title"]}>الأعضاء</h2>
          <div className={styles["member-form-grid"]}>
            {Object.keys(members).map((key) => (
              <div key={key} className={styles["member-form-group"]}>
                <label className={styles["member-label"]}>{key}</label>
                {key === "الفرقة الدراسية" ? (
                  <select
                    name={key}
                    value={(members as any)[key]}
                    onChange={handleMemberChange}
                    className={`${styles["member-input"]} ${errors[`member-${key}`] ? styles.error : ""}`}
                  >
                    <option value="" hidden disabled>اختر الفرقة الدراسية</option>
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    name={key}
                    value={(members as any)[key]}
                    onChange={handleMemberChange}
                    className={`${styles["member-input"]} ${errors[`member-${key}`] ? styles.error : ""}`}
                    placeholder={`أدخل ${key}`}
                  />
                )}
                {errors[`member-${key}`] && <span className={styles["error-message"]}>{errors[`member-${key}`]}</span>}
              </div>
            ))}
          </div>
          <button className={styles["add-member-btn"]} onClick={handleSubmit}>
            إضافة عضو
          </button>
        </section>

        {/* Assistants Section */}
        <section className={styles["member-section"]}>
          <h2 className={styles["member-section-title"]}>المساعدين</h2>
          <div className={styles["assistant-list"]}>
            {Object.entries(assistants).map(([key, assistant]) => (
              <div key={key}>
                <h3 className={styles["assistant-title"]}>{key}</h3>
                <div className={styles["assistant-inputs"]}>
                  <input
                    placeholder="تعيين شخص لهذا الدور"
                    value={assistant.الدور}
                    onChange={(e) => handleAssistantChange(key, "الدور", e.target.value)}
                    className={`${styles["member-input"]} ${errors[`assistant-${key}`] ? styles.error : ""}`}
                  />
                  {errors[`assistant-${key}`] && (
                    <span className={styles["error-message"]}>{errors[`assistant-${key}`]}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Committees Section */}
        <section className={styles["member-section"]}>
          <h2 className={styles["member-section-title"]}>اللجان</h2>
          <div className={styles["committee-list"]}>
            {Object.entries(committees).map(([key, committee]) => (
              <div key={key}>
                <h3 className={styles["committee-title"]}>{key}</h3>
                <div className={styles["committee-inputs"]}>
                  <input
                    placeholder="أدخل اسم الأمين"
                    value={committee.الأمين}
                    onChange={(e) => handleCommitteeChange(key, "الأمين", e.target.value)}
                    className={`${styles["member-input"]} ${errors[`committee-${key}-الأمين`] ? styles.error : ""}`}
                  />
                  {errors[`committee-${key}-الأمين`] && (
                    <span className={styles["error-message"]}>{errors[`committee-${key}-الأمين`]}</span>
                  )}

                  <input
                    placeholder="أدخل اسم الأمين المساعد"
                    value={committee["الأمين المساعد"]}
                    onChange={(e) => handleCommitteeChange(key, "الأمين المساعد", e.target.value)}
                    className={`${styles["member-input"]} ${errors[`committee-${key}-الأمين المساعد`] ? styles.error : ""}`}
                  />
                  {errors[`committee-${key}-الأمين المساعد`] && (
                    <span className={styles["error-message"]}>{errors[`committee-${key}-الأمين المساعد`]}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <button
          className={styles["add-member-btn"]}
          onClick={handleSubmit}
          style={{ marginTop: "20px" }}
        >
          حفظ الأسرة
        </button>
      </div>
    </div>
  );
}
