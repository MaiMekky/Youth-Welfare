"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./AddFamily.module.css";

export default function AddFamily() {
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "اسرة مركزية",
    description: "",
    goals: "",
  });

  // Error state
  const [errors, setErrors] = useState({
    name: "",
    description: "",
    goals: "",
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // clear error on change
  };

  // Form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validations
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = "الرجاء إدخال اسم الأسرة";
    if (!formData.description.trim()) newErrors.description = "الرجاء إدخال وصف الأسرة";
    if (!formData.goals.trim()) newErrors.goals = "الرجاء إدخال أهداف الأسرة";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit form logic
    console.log("Form submitted!", formData);
    router.push("/uni-level-family");
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.formContainer}>
        <h2>إضافة أسرة مركزية جديدة</h2>
        <form onSubmit={handleSubmit}>
          <label>اسم الأسرة</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="أدخل اسم الأسرة"
            className={`${styles.inputField} ${errors.name ? styles.invalid : ""}`}
          />
          {errors.name && <span className={styles.error}>{errors.name}</span>}

         <label>نوع الأسرة</label>
            <input
            name="type"
            value={formData.type}
            readOnly
            className={styles.readOnlyInput}
            />


          <label>وصف الأسرة</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="أدخل وصفاً مختصراً عن الأسرة وأنشطتها"
             className={`${styles.inputField} ${errors.description ? styles.invalid : ""}`}
          />
          {errors.description && <span className={styles.error}>{errors.description}</span>}

          <label>أهداف الأسرة</label>
          <textarea
            name="goals"
            value={formData.goals}
            onChange={handleChange}
            placeholder="أدخل الأهداف والرؤية الخاصة بالأسرة"
             className={`${styles.inputField} ${errors.goals ? styles.invalid : ""}`}
          />
          {errors.goals && <span className={styles.error}>{errors.goals}</span>}

          <div className={styles.buttonGroup}>
            <button type="button" onClick={() => router.back()}>إلغاء</button>
            <button type="submit">حفظ</button>
          </div>
        </form>
      </div>
    </div>
  );
}
