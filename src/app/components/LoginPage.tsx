"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "../assets/logo1.png";
import styles from "../Styles/components/LoginPage.module.css";

interface LoginPageProps {
  onClose: () => void;
  onSwitchToSignup: () => void;
}

export default function LoginPage({ onClose, onSwitchToSignup }: LoginPageProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (message: string, type: "success" | "warning" | "error") => {
    setNotification(`${type}:${message}`);
    setTimeout(() => setNotification(null), 3500);
  };

  // ======= Validation =======
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = "البريد مطلوب";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "البريد غير صالح";

    if (!password.trim()) newErrors.password = "كلمة المرور مطلوبة";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        showNotification("بريد الكتروني خاطئ او كلمة مرور خاطئة❌", "error");
        setLoading(false);
        return;
      }

      // Debug: log exact role string to catch hidden spaces
      console.log("role received:", JSON.stringify(data.role));
      console.log("user_type:", data.user_type);

      // Map Arabic role to English key
      let roleKey = "";
      if (data.user_type === "admin") {
        const role = data.role?.trim(); // trim any accidental whitespace
        if (role === "مشرف النظام")   roleKey = "super_admin";
        else if (role === "مدير ادارة") roleKey = "uni_manager";
        else if (role === "مسؤول كلية") roleKey = "fac_manager";
        else if (role === "مدير كلية")  roleKey = "fac_head";
        else if (role ===  "مدير عام")  roleKey = "General_admin";
      }

      // Save tokens & user data
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("user", JSON.stringify({
        name: data.name,
        role: data.role,
        faculty_name: data.faculty_name,
        admin_id: data.admin_id,
        user_type: data.user_type,
      }));

      if (data.user_type === "student") {
        localStorage.setItem("student_id", data.student_id.toString());
      } else {
        localStorage.setItem("admin_id", data.admin_id.toString());
      }
      localStorage.setItem("role", data.role);
      localStorage.setItem("name", data.name);

      // Save cookies
      document.cookie = `access=${data.access}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `refresh=${data.refresh}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `user_type=${data.user_type}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `roleKey=${roleKey}; path=/; max-age=604800; SameSite=Lax`;

      // Route based on role
      if (data.user_type === "admin") {
        if (roleKey === "super_admin")  router.push("/SuperAdmin");
        else if (roleKey === "uni_manager") router.push("/uni-level");
        else if (roleKey === "fac_manager") router.push("/FacLevel");
        else if (roleKey === "fac_head")    router.push("/FacultyHead");
        else if (roleKey === "General_admin")       router.push("/GeneralAdmin");
        else {
          // Fallback: unknown admin role
          console.warn("Unknown roleKey:", roleKey, "| raw role:", data.role);
          showNotification("دور المستخدم غير معروف، تواصل مع الدعم", "error");
        }
      } else if (data.user_type === "student") {
        router.push("/Student");
      }

    } catch (error) {
      console.error(error);
      showNotification("حدث خطأ أثناء تسجيل الدخول ❌", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginBox}>
      {/* Close Button */}
      <button className={styles.closeBtn} onClick={onClose}>✕</button>

      {/* Logo */}
      <div className={styles.logoContainer}>
        <Image src={logo} alt="Logo" width={150} height={150} draggable={false} />
      </div>

      <h2 className={styles.loginTitle}>تسجيل الدخول</h2>

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

      {/* Form */}
      <form onSubmit={handleLogin} className={styles.loginForm}>
        <input
          type="text"
          placeholder="البريد الجامعي"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={errors.email ? styles.invalid : ""}
        />
        {errors.email && <p className={styles.errorMsg}>{errors.email}</p>}

        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={errors.password ? styles.invalid : ""}
        />
        {errors.password && <p className={styles.errorMsg}>{errors.password}</p>}

        {errors.general && <p className={styles.errorMsg}>{errors.general}</p>}

        <button type="submit" disabled={loading} className={styles.loginButton}>
          {loading ? "جاري التحقق..." : "تسجيل الدخول"}
        </button>
      </form>

      {/* Signup Link */}
      <p className={styles.signupText}>
        ليس لديك حساب؟{" "}
        <span className={styles.linkSwitch} onClick={onSwitchToSignup}>
          إنشاء حساب جديد
        </span>
      </p>
    </div>
  );
}