"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "@/app/assets/logo1.png";
import styles from "../Styles/components/LoginPage.module.css";
import { loginUser } from "../../services/authService";

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError("");

    const result = await loginUser(email, password);

    if (result.success) {
      setLoading(false);

      // temporary redirect to FacLevel only
      router.push("/FacLevel");

      onClose(); // close the login popup
    } else {
      setApiError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginBox}>
      <button className={styles.closeBtn} onClick={onClose}>
        ✕
      </button>

      <div className={styles.logoContainer}>
        <Image src={logo} alt="Logo" width={90} height={90} />
      </div>

      <h2 className={styles.loginTitle}>تسجيل الدخول</h2>

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

      <p className={styles.signupText}>
        ليس لديك حساب؟{" "}
        <span className={styles.linkSwitch} onClick={onSwitchToSignup}>
          إنشاء حساب جديد
        </span>
      </p>
    </div>
  );
}
