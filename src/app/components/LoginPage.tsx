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
  let router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  router = useRouter();

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

  // ======= Standard Login =======
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        showNotification("بريد الكتروني خاطئ او كلمة مرور خاطئة❌", "error");
        setLoading(false);
        return;
      }

      // تحويل role العربي لـ key انجليزي
      let roleKey = "";
      if (data.user_type === "admin") {
        if (data.role === "مشرف النظام") roleKey = "super_admin";
        else if (data.role === "مدير ادارة") roleKey = "uni_manager";
        else if (data.role === "مسؤول كلية") roleKey = "fac_manager";
      }

      // حفظ البيانات
      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);
      localStorage.setItem("user", JSON.stringify({
        name: data.name,
        role: data.role,
        faculty_name: data.faculty_name,
        admin_id: data.admin_id,
        user_type: data.user_type
      }));
      if (data.user_type === "student") {
        localStorage.setItem('student_id', data.student_id.toString());
      } else {
        localStorage.setItem('admin_id', data.admin_id.toString());
      }
      localStorage.setItem('role', data.role);
      localStorage.setItem('name', data.name);

      // حفظ cookies
      document.cookie = `access=${data.access}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `refresh=${data.refresh}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `user_type=${data.user_type}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `roleKey=${roleKey}; path=/; max-age=604800; SameSite=Lax`;

      // توجيه حسب الدور
      if (data.user_type === "admin") {
        if (roleKey === "super_admin") router.push("/SuperAdmin");
        else if (roleKey === "uni_manager") router.push("/uni-level");
        else if (roleKey === "fac_manager") router.push("/FacLevel");
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

  // ======= Google Login Handler =======
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      // Step 1: Get the Google authorization URL from your backend
      const initRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/init/`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const initData = await initRes.json();
      
      if (!initRes.ok) {
        showNotification("فشل في الاتصال بـ Google ❌", "error");
        setGoogleLoading(false);
        return;
      }

      // Step 2: Redirect to Google
      window.location.href = initData.authorization_url;

    } catch (error) {
      console.error(error);
      showNotification("خطأ في عملية تسجيل الدخول بـ Google ❌", "error");
      setGoogleLoading(false);
    }
  };

  return (
    <div className={styles.loginBox}>
      {/* Close Button */}
      <button className={styles.closeBtn} onClick={onClose}>
        ✕
      </button>

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

<button
          type="button"
          className={styles.googleButton}
          onClick={handleGoogleLogin}
        >
          <span className={styles.googleIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.85 2.02 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.02 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24c0-1.59-.15-3.13-.44-4.62H24v9.13h12.7c-.55 2.96-2.15 5.51-4.59 7.19l7.04 5.48C43.64 36.84 46.5 30.74 46.5 24z"/>
              <path fill="#FBBC05" d="M10.54 28.41A14.48 14.48 0 0 1 9.5 24c0-1.54.26-3.03.73-4.41l-7.98-6.19A23.874 23.874 0 0 0 0 24c0 3.82.88 7.44 2.56 10.6l7.98-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.72l-7.04-5.48c-2.03 1.36-4.63 2.16-8.85 2.16-6.26 0-11.57-3.52-13.46-8.91l-7.98-6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
          </span>

          <span className={styles.googleText}>تسجيل الدخول عبر Google</span>
        </button>

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