"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "@/app/assets/logo1.png"; // تأكد المسار صحيح
import styles from "../Styles/components/LoginPage.module.css";
import { loginUser } from "././../services/authService";

interface LoginPageProps {
  onClose: () => void;
  onSwitchToSignup: () => void;
}

export default function LoginPage({ onClose, onSwitchToSignup }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const router = useRouter();

  // ======= Validation =======
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = "البريد مطلوب";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "البريد غير صالح";

    if (!password.trim()) newErrors.password = "كلمة المرور مطلوبة";
    else if (password.length < 3) newErrors.password = "كلمة المرور قصيرة جدًا";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ======= Handle Login =======
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError("");

    const result = await loginUser(email, password);

    if (result.success) {
      setLoading(false);
      onClose(); // اغلاق البوب اب
      router.push("/uni-level"); // Redirect بعد login
    } else {
      setApiError(result.message || "فشل تسجيل الدخول");
      setLoading(false);
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
        <Image
          src={logo}
          alt="Logo"
          width={90}
          height={90}
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </div>

      <h2 className={styles.loginTitle}>تسجيل الدخول</h2>

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

        {apiError && <p className={styles.errorMsg}>{apiError}</p>}

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
