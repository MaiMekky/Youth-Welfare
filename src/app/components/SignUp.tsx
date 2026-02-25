"use client";
import React, { ChangeEvent, FormEvent, useState, useEffect } from "react";
import Image from "next/image";
import logo from "@/app/assets/logo1.png";
import profilePlaceholder from "@/app/assets/profile.png";
import styles from "../Styles/components/LoginPage.module.css"; // reuse popup styles

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
  faculty: string; // This will now store the faculty ID as string
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

export default function SignupPage({ onClose, onSwitchToLogin }: SignupProps) {
  // convert Arabic digits to english digits for numeric fields
  const toEnglishDigits = (str: string) =>
    str
      .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
      .replace(/[\u06f0-\u06f9]/g, (d) => String(d.charCodeAt(0) - 0x06f0));

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
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [facultiesLoading, setFacultiesLoading] = useState(true);
 const [notification, setNotification] = useState<string | null>(null);

  // Fetch faculties on component mount
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/solidarity/super_dept/faculties/");
        if (response.ok) {
          const data = await response.json();
          setFaculties(data);
        } else {
          console.error("Failed to fetch faculties");
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
    const { name, value, type } = e.target as any;
    const numericFields = ["studentId", "studentCode", "phone"];
     let newValue = value;
  if (numericFields.includes(name)) {
    // Remove non-digits except "+" for phone
    newValue = value.replace(/[^\d+]/g, "");
  }

  // Enforce max length
  if (name === "studentId") newValue = newValue.slice(0, 14); // 14 digits max
  if (name === "studentCode") newValue = newValue.slice(0, 14); // adjust if needed
  if (name === "phone") {
    // Ensure +20 at start
    if (!newValue.startsWith("+20")) newValue = "+20";
    newValue = newValue.slice(0, 13); // +20 + 11 digits = 13 chars
  }
    newValue =
      type === "radio"
        ? value
        : numericFields.includes(name)
        ? toEnglishDigits(value)
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

  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // fullNameEn - English letters only (as before)
    if (!formData.fullNameEn.trim()) {
      newErrors.fullNameEn = "الاسم باللغة العربية مطلوب";
    }

    // email
    if (!formData.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "صيغة البريد الإلكتروني غير صحيحة";
    }

    // // password
    // if (!formData.password.trim()) {
    //   newErrors.password = "كلمة المرور مطلوبة";
    // } else if (formData.password.length < 6 || formData.password.length > 14) {
    //   newErrors.password = "كلمة المرور يجب أن تكون بين 6 و 14 حرفًا";
    // } else if (
    //   !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/.test(formData.password)
    // ) {
    //   newErrors.password =
    //     "كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم باللغة الإنجليزية فقط";
    // }

    // confirm password
    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "كلمتا المرور غير متطابقتين";
    }

    // studentId
    if (!formData.studentId.trim()) {
      newErrors.studentId = "الرقم القومي / رقم الطالب مطلوب";
    } else if (!/^[0-9]{8,14}$/.test(formData.studentId)) {
      newErrors.studentId = "الرقم القومي/رقم الطالب غير صحيح";
    }

    // studentCode
    if (!formData.studentCode.trim()) {
      newErrors.studentCode = "كود الطالب مطلوب";
    } else if (!/^[0-9]{4,8}$/.test(formData.studentCode)) {
      newErrors.studentCode = "كود الطالب غير صحيح";
    }

    // faculty
    if (!formData.faculty.trim()) {
      newErrors.faculty = "الكلية مطلوبة";
    }

    // department
    if (!formData.department.trim()) {
      newErrors.department = "القسم مطلوب";
    }

    // level
    if (!formData.level.trim()) {
      newErrors.level = "الفرقة مطلوبة";
    }

    // // phone (optional but validate when present)
    // if (
    //   formData.phone &&
    //   !/^\+20[1][0125][0-9]{8}$/.test(formData.phone)
    // ) {
    //   newErrors.phone = "رقم الهاتف غير صحيح، يجب أن يبدأ بـ +20";
    // }

    // address
    if (!formData.address.trim()) {
      newErrors.address = "العنوان مطلوب";
    }

    // grade
    if (!formData.grade.trim()) {
      newErrors.grade = "التقدير مطلوب";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const formDataToSend = new FormData();

    // Append text fields
    formDataToSend.append("name", formData.fullNameEn);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);
    formDataToSend.append("faculty", formData.faculty); // This is now the faculty ID
    formDataToSend.append("gender", formData.gender);
    formDataToSend.append("nid", formData.studentId);
    formDataToSend.append("uid", formData.studentCode);
    formDataToSend.append("phone_number", formData.phone);
    formDataToSend.append("address", formData.address);
    formDataToSend.append("acd_year", formData.level);
    formDataToSend.append("grade", formData.grade);
    formDataToSend.append("major", formData.department);

    // Append file if user uploaded one
    const profileFileInput = document.getElementById("profileUpload") as HTMLInputElement;
    if (profileFileInput?.files?.[0]) {
      formDataToSend.append("profile_image", profileFileInput.files[0]);
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/signUp/", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
      showNotification( "حدث خطأ أثناء إنشاء الحساب ❌","error");
        return;
      }

      const data = await response.json();
      if (data.access) {
        localStorage.setItem("access", data.access);
      }

     showNotification( "تم إنشاء الحساب بنجاح 🎉" , "success");

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      showNotification("حدث خطأ، حاول مرة أخرى", "error" );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={styles.loginBox}>
      <button className={styles.closeBtn} onClick={onClose} aria-label="close">
        ✕
      </button>

      <div className={styles.logoContainer}>
        <Image src={logo} alt="logo" width={150} height={150} draggable={false} />
      </div>

      <h2 className={styles.loginTitle}>إنشاء حساب جديد</h2>
     {notification && (
        <div
          className={`${styles.notification} ${
            notification.startsWith("success")
              ? styles.success
              : notification.startsWith("warning")
              ? styles.warning
              : styles.error
          }`}
        >
          {notification.split(":")[1]}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.loginForm} noValidate>
        {/* profile upload */}
        <label htmlFor="profileUpload" style={{ cursor: "pointer", marginBottom: 8 }}>
          <Image
            src={profileImg}
            alt="profile"
            width={90}
            height={90}
            className={styles.profileImg}
          />
        </label>
        <input
          id="profileUpload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />

        {/* English full name */}
        <input
          name="fullNameEn"
          type="text"
          placeholder="الاسم رباعي باللغة العربية"
          value={formData.fullNameEn}
          onChange={handleChange}
          className={errors.fullNameEn ? styles.invalid : ""}
        />
        {errors.fullNameEn && <p className={styles.errorMsg}>{errors.fullNameEn}</p>}

        {/* email */}
        <input
          name="email"
          type="email"
          placeholder="البريد الإلكتروني"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? styles.invalid : ""}
        />
        {errors.email && <p className={styles.errorMsg}>{errors.email}</p>}

        {/* password */}
        <input
          name="password"
          type="password"
          placeholder="كلمة المرور"
          value={formData.password}
          onChange={handleChange}
          className={errors.password ? styles.invalid : ""}
        />
        {errors.password && <p className={styles.errorMsg}>{errors.password}</p>}

        {/* confirm password */}
        <input
          name="confirmPassword"
          type="password"
          placeholder="تأكيد كلمة المرور"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={errors.confirmPassword ? styles.invalid : ""}
        />
        {errors.confirmPassword && (
          <p className={styles.errorMsg}>{errors.confirmPassword}</p>
        )}

        {/* studentId */}
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

        {/* studentCode */}
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

        {/* faculty - Now a dropdown */}
        <select
          name="faculty"
          value={formData.faculty}
          onChange={handleChange}
          className={errors.faculty ? styles.invalid : styles.input}
        >
          <option value="" disabled hidden>اختر الكلية</option>
          {facultiesLoading ? (
            <option value="" disabled>جاري تحميل الكليات...</option>
          ) : (
            faculties.map((faculty) => (
              <option key={faculty.faculty_id} value={faculty.faculty_id}>
                {faculty.name}
              </option>
            ))
          )}
        </select>
        {errors.faculty && <p className={styles.errorMsg}>{errors.faculty}</p>}

        {/* department */}
        <input
          name="department"
          type="text"
          placeholder="القسم"
          value={formData.department}
          onChange={handleChange}
          className={errors.department ? styles.invalid : ""}
        />
        {errors.department && <p className={styles.errorMsg}>{errors.department}</p>}

        {/* level */}
        <input
          name="level"
          type="text"
          placeholder="الفرقة"
          value={formData.level}
          onChange={handleChange}
          className={errors.level ? styles.invalid : ""}
        />
        {errors.level && <p className={styles.errorMsg}>{errors.level}</p>}

        {/* phone */}
        <input
          name="phone"
          type="text"
          placeholder="التليفون"
          value={formData.phone}
          onChange={handleChange}
          className={errors.phone ? styles.invalid : ""}
          maxLength={13}
        />
        {errors.phone && <p className={styles.errorMsg}>{errors.phone}</p>}

        {/* address */}
        <input
          name="address"
          type="text"
          placeholder="العنوان"
          value={formData.address}
          onChange={handleChange}
          className={errors.address ? styles.invalid : ""}
        />
        {errors.address && <p className={styles.errorMsg}>{errors.address}</p>}

        {/* grade */}
        <select
          name="grade"
          value={formData.grade}
          onChange={handleChange}
          className={errors.grade ? styles.invalid : styles.input}
        >
          <option value="" disabled hidden>اختر التقدير</option>
          <option value="امتياز">امتياز</option>
          <option value="جيد جدا">جيد جدًا</option>
          <option value="جيد">جيد</option>
          <option value="مقبول">مقبول</option>
        </select>
        {errors.grade && <p className={styles.errorMsg}>{errors.grade}</p>}

        {/* gender */}
        <div style={{ display: "flex", gap: 12, color: "#2C3A5F", marginTop: 8 }}>
          <label style={{ cursor: "pointer" }}>
            <input
              type="radio"
              name="gender"
              value="M"
              checked={formData.gender === "M"}
              onChange={handleChange}
            />{" "}
            ذكر
          </label>
          <label style={{ cursor: "pointer" }}>
            <input
              type="radio"
              name="gender"
              value="F"
              checked={formData.gender === "F"}
              onChange={handleChange}
            />{" "}
            أنثى
          </label>
        </div>

        <button
          type="submit"
          className={styles.loginButton}
          style={{ marginTop: 14 }}
          disabled={loading}
        >
          {loading ? "جارٍ الإنشاء..." : "تسجيل"}
        </button>
      </form>

      <p className={styles.signupText} style={{ marginTop: 12 }}>
        لديك حساب؟{" "}
        <span
          className={styles.linkSwitch}
          onClick={() => {
            onSwitchToLogin();
          }}
          style={{ cursor: "pointer" }}
        >
          تسجيل الدخول
        </span>
      </p>
    </div>
  );
}