"use client";
import React, { ChangeEvent, FormEvent, useState, useEffect } from "react";
import Image from "next/image";
import logo from "@/app/assets/logo.png";
import profilePlaceholder from "@/app/assets/profile.png";
import styles from "../Styles/components/LoginPage.module.css";
import { authFetch } from "@/utils/globalFetch";

interface SignupProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

interface FormData {
  fullNameEn: string;
  email: string;
  password: string;
  confirmPassword: string;
  studentId: string;
  studentCode: string;
  faculty: string;
  department: string;
  level: string;
  phone: string;
  address: string;
  gender: string;
  grade: string;
}

interface Faculty {
  faculty_id: number;
  name: string;
}

const TOTAL_STEPS = 3;

export default function SignupPage({ onClose, onSwitchToLogin }: SignupProps) {
  const toEnglishDigits = (str: string) =>
    str
      .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
      .replace(/[\u06f0-\u06f9]/g, (d) => String(d.charCodeAt(0) - 0x06f0));

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState<FormData>({
    fullNameEn: "",
    email: "",
    password: "",
    confirmPassword: "",
    studentId: "",
    studentCode: "",
    faculty: "",
    department: "",
    level: "",
    phone: "",
    address: "",
    gender: "",
    grade: "",
  });

  const [profileImg, setProfileImg] = useState<string>(profilePlaceholder.src);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [facultiesLoading, setFacultiesLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await authFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/family/faculties/`);
        if (response.ok) {
          const data = await response.json();
          setFaculties(data);
        }
      } catch (error) {
        console.error("Error fetching faculties:", error);
      } finally {
        setFacultiesLoading(false);
      }
    };
    fetchFaculties();
  }, []);

  const showNotification = (message: string, type: "success" | "warning" | "error") => {
    setNotification(`${type}:${message}`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value, type } = target;
    const numericFields = ["studentId", "studentCode", "phone"];
    let newValue = value;

    if (numericFields.includes(name)) {
      newValue = value.replace(/[^\d+]/g, "");
    }

    if (name === "studentId") newValue = newValue.slice(0, 14);
    if (name === "studentCode") newValue = newValue.slice(0, 14);
    if (name === "phone") {
      if (!newValue.startsWith("+20")) newValue = "+20";
      newValue = newValue.slice(0, 13);
    }

    newValue =
      type === "radio"
        ? value
        : numericFields.includes(name)
        ? toEnglishDigits(value)
        : name === "email"
        ? value.toLowerCase()
        : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfileImg(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Validate only fields relevant to the current step
  const validateStep = (currentStep: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (currentStep === 1) {
      if (!formData.fullNameEn.trim()) newErrors.fullNameEn = "الاسم باللغة العربية مطلوب";

      if (!formData.email.trim()) {
        newErrors.email = "البريد الإلكتروني مطلوب";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "صيغة البريد الإلكتروني غير صحيحة";
      }

      if (!formData.password.trim()) {
        newErrors.password = "كلمة المرور مطلوبة";
      } else if (formData.password.length < 6 || formData.password.length > 14) {
        newErrors.password = "كلمة المرور يجب أن تكون بين 6 و 14 حرفًا";
      }

      if (!formData.confirmPassword.trim()) {
        newErrors.confirmPassword = "تأكيد كلمة المرور مطلوب";
      } else if (formData.confirmPassword !== formData.password) {
        newErrors.confirmPassword = "كلمتا المرور غير متطابقتين";
      }
    }

    if (currentStep === 2) {
      if (!formData.studentId.trim()) {
        newErrors.studentId = "الرقم القومي / رقم الطالب مطلوب";
      } else if (!/^[0-9]{8,14}$/.test(formData.studentId)) {
        newErrors.studentId = "الرقم القومي/رقم الطالب غير صحيح";
      }

      if (!formData.studentCode.trim()) {
        newErrors.studentCode = "كود الطالب مطلوب";
      } else if (!/^[0-9]{4,8}$/.test(formData.studentCode)) {
        newErrors.studentCode = "كود الطالب غير صحيح";
      }

      if (!formData.faculty.trim()) newErrors.faculty = "الكلية مطلوبة";
      if (!formData.department.trim()) newErrors.department = "القسم مطلوب";
      if (!formData.level.trim()) newErrors.level = "الفرقة مطلوبة";
    }

    if (currentStep === 3) {
      if (!formData.phone.trim()) {
        newErrors.phone = "رقم الهاتف مطلوب";
      } else if (!/^(01[0125])[0-9]{8}$/.test(formData.phone)) {
        newErrors.phone = "رقم الهاتف غير صحيح، يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015 ويحتوي على 11 رقمًا";
      }

      if (!formData.address.trim()) newErrors.address = "العنوان مطلوب";
      if (!formData.grade.trim()) newErrors.grade = "التقدير مطلوب";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    const normalizedEmail = formData.email.trim().toLowerCase();

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.fullNameEn);
    formDataToSend.append("email", normalizedEmail);
    formDataToSend.append("password", formData.password);
    formDataToSend.append("faculty", formData.faculty);
    formDataToSend.append("gender", formData.gender);
    formDataToSend.append("nid", formData.studentId);
    formDataToSend.append("uid", formData.studentCode);
    formDataToSend.append("phone_number", formData.phone);
    formDataToSend.append("address", formData.address);
    formDataToSend.append("acd_year", formData.level);
    formDataToSend.append("grade", formData.grade);
    formDataToSend.append("major", formData.department);

    const profileFileInput = document.getElementById("profileUpload") as HTMLInputElement;
    if (profileFileInput?.files?.[0]) {
      formDataToSend.append("profile_image", profileFileInput.files[0]);
    }

    setLoading(true);
    try {
      const response = await authFetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/signUp/`, {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        showNotification("حدث خطأ أثناء إنشاء الحساب ❌", "error");
        return;
      }

      const data = await response.json();
      if (data.access) localStorage.setItem("access", data.access);

      showNotification("تم إنشاء الحساب بنجاح 🎉", "success");
      setTimeout(() => { onClose(); }, 1500);
    } catch (err) {
      console.error(err);
      showNotification("حدث خطأ، حاول مرة أخرى", "error");
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ["البيانات الأساسية", "بيانات الطالب", "معلومات إضافية"];

  return (
    <div className={styles.loginBox}>
      <button className={styles.closeBtn} onClick={onClose} aria-label="close">✕</button>

      <div className={styles.logoContainer}>
        <Image src={logo} alt="logo" width={130} height={130} draggable={false} />
      </div>

      <h2 className={styles.loginTitle}>إنشاء حساب جديد</h2>

      {/* ── Notification ── */}
      {notification && (
        <div className={`${styles.notification} ${
          notification.startsWith("success") ? styles.success :
          notification.startsWith("warning") ? styles.warning : styles.error
        }`}>
          {notification.split(":")[1]}
        </div>
      )}

      {/* ── Step Progress Bar ── */}
      <div className={styles.progressWrapper}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
          const num = i + 1;
          const isCompleted = step > num;
          const isActive = step === num;
          return (
            <React.Fragment key={num}>
              <div className={styles.stepItem}>
                <div
                  className={`${styles.stepCircle} ${isCompleted ? styles.stepCompleted : ""} ${isActive ? styles.stepActive : ""}`}
                >
                  {isCompleted ? "✓" : num}
                </div>
                <span className={`${styles.stepLabel} ${isActive ? styles.stepLabelActive : ""}`}>
                  {stepLabels[i]}
                </span>
              </div>
              {i < TOTAL_STEPS - 1 && (
                <div className={`${styles.stepLine} ${step > num ? styles.stepLineActive : ""}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className={styles.loginForm} noValidate>

        {/* STEP 1 — Account credentials */}
        {step === 1 && (
          <div className={styles.stepFields}>
            <input
              name="fullNameEn"
              type="text"
              placeholder="الاسم رباعي باللغة العربية"
              value={formData.fullNameEn}
              onChange={handleChange}
              className={errors.fullNameEn ? styles.invalid : ""}
            />
            {errors.fullNameEn && <p className={styles.errorMsg}>{errors.fullNameEn}</p>}

            <input
              name="email"
              type="email"
              placeholder="البريد الإلكتروني"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? styles.invalid : ""}
            />
            {errors.email && <p className={styles.errorMsg}>{errors.email}</p>}

            <input
              name="password"
              type="password"
              placeholder="كلمة المرور"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? styles.invalid : ""}
            />
            {errors.password && <p className={styles.errorMsg}>{errors.password}</p>}

            <input
              name="confirmPassword"
              type="password"
              placeholder="تأكيد كلمة المرور"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? styles.invalid : ""}
            />
            {errors.confirmPassword && <p className={styles.errorMsg}>{errors.confirmPassword}</p>}
          </div>
        )}

        {/* STEP 2 — Student info */}
        {step === 2 && (
          <div className={styles.stepFields}>
            <input
              name="studentId"
              type="text"
              placeholder="الرقم القومي"
              value={formData.studentId}
              onChange={handleChange}
              className={errors.studentId ? styles.invalid : ""}
              maxLength={14}
            />
            {errors.studentId && <p className={styles.errorMsg}>{errors.studentId}</p>}

            <input
              name="studentCode"
              type="text"
              placeholder="كود الطالب"
              value={formData.studentCode}
              onChange={handleChange}
              className={errors.studentCode ? styles.invalid : ""}
              maxLength={8}
            />
            {errors.studentCode && <p className={styles.errorMsg}>{errors.studentCode}</p>}

            <select
              name="faculty"
              value={formData.faculty}
              onChange={handleChange}
              className={errors.faculty ? styles.invalid : styles.selectField}
            >
              <option value="" disabled hidden>اختر الكلية</option>
              {facultiesLoading
                ? <option value="" disabled>جاري تحميل الكليات...</option>
                : faculties.map((f) => (
                    <option key={f.faculty_id} value={f.faculty_id}>{f.name}</option>
                  ))
              }
            </select>
            {errors.faculty && <p className={styles.errorMsg}>{errors.faculty}</p>}

            <input
              name="department"
              type="text"
              placeholder="القسم"
              value={formData.department}
              onChange={handleChange}
              className={errors.department ? styles.invalid : ""}
            />
            {errors.department && <p className={styles.errorMsg}>{errors.department}</p>}

            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className={errors.level ? styles.invalid : styles.selectField}
            >
              <option value="" disabled hidden>اختر الفرقة</option>
              <option value="الفرقة الأولى">الفرقة الأولى</option>
              <option value="الفرقة الثانية">الفرقة الثانية</option>
              <option value="الفرقة الثالثة">الفرقة الثالثة</option>
              <option value="الفرقة الرابعة">الفرقة الرابعة</option>
              <option value="الفرقة الخامسة">الفرقة الخامسة</option>
              <option value="الفرقة السادسة">الفرقة السادسة</option>
            </select>
            {errors.level && <p className={styles.errorMsg}>{errors.level}</p>}
          </div>
        )}

        {/* STEP 3 — Personal info */}
        {step === 3 && (
          <div className={styles.stepFields}>
            {/* Profile image */}
            <div className={styles.profileUploadWrapper}>
              <label htmlFor="profileUpload" className={styles.profileLabel}>
                <Image
                  src={profileImg}
                  alt="profile"
                  width={90}
                  height={90}
                  className={styles.profileImg}
                />
                <span className={styles.profileHint}>اضغط لرفع الصورة (اختياري)</span>
              </label>
              <input
                id="profileUpload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
            </div>

            <input
              name="phone"
              type="text"
              placeholder="التليفون"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? styles.invalid : ""}
              maxLength={11}
            />
            {errors.phone && <p className={styles.errorMsg}>{errors.phone}</p>}

            <input
              name="address"
              type="text"
              placeholder="العنوان"
              value={formData.address}
              onChange={handleChange}
              className={errors.address ? styles.invalid : ""}
            />
            {errors.address && <p className={styles.errorMsg}>{errors.address}</p>}

            <select
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              className={errors.grade ? styles.invalid : styles.selectField}
            >
              <option value="" disabled hidden>اختر التقدير</option>
              <option value="امتياز">امتياز</option>
              <option value="جيد جدا">جيد جدًا</option>
              <option value="جيد">جيد</option>
              <option value="مقبول">مقبول</option>
            </select>
            {errors.grade && <p className={styles.errorMsg}>{errors.grade}</p>}

            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="gender"
                  value="M"
                  checked={formData.gender === "M"}
                  onChange={handleChange}
                />
                ذكر
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="gender"
                  value="F"
                  checked={formData.gender === "F"}
                  onChange={handleChange}
                />
                أنثى
              </label>
            </div>
          </div>
        )}

        {/* ── Navigation Buttons ── */}
        <div className={styles.navButtons}>
          {step > 1 && (
            <button type="button" className={styles.backButton} onClick={handleBack}>
              ← رجوع
            </button>
          )}

          {step < TOTAL_STEPS ? (
            <button type="button" className={styles.nextButton} onClick={handleNext}>
              التالي →
            </button>
          ) : (
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? "جارٍ الإنشاء..." : "تسجيل ✓"}
            </button>
          )}
        </div>
      </form>

      <p className={styles.signupText}>
        لديك حساب؟{" "}
        <span className={styles.linkSwitch} onClick={onSwitchToLogin}>
          تسجيل الدخول
        </span>
      </p>
    </div>
  );
}