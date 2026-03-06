"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "../assets/logo.png";
import styles from "../Styles/components/LoginPage.module.css";
import ForgotPasswordModal from "./ForgotPasswordModal";

interface LoginPageProps {
  onClose: () => void;
  onSwitchToSignup: () => void;
}

interface Dept { dept_id: number; dept_name: string; }

// ── Route maps per role level ─────────────────────────────────
const FAC_ROUTE_MAP: Record<string, string> = {
  "التكافل الإجتماعي":  "/FacLevel",
  "التكافل الاجتماعي":  "/FacLevel",
  "الأسر الطلابية":     "/Family-Faclevel/events",
  "الأنشطة الرياضية":   "/Events-Faclevel",
  "الأنشطة الثقافية":   "/Events-Faclevel",
  "الأنشطة البيئية":    "/Events-Faclevel",
  "الأنشطة الاجتماعية": "/Events-Faclevel",
  "الأنشطة العلمية":    "/Events-Faclevel",
};

const UNI_ROUTE_MAP: Record<string, string> = {
  "التكافل الإجتماعي":  "/uni-level",
  "التكافل الاجتماعي":  "/uni-level",
  "الأسر الطلابية":     "/uni-level-family",
  "الأنشطة الرياضية":   "/uni-level-activities",
  "الأنشطة الثقافية":   "/uni-level-activities",
  "الأنشطة البيئية":    "/uni-level-activities",
  "الأنشطة الاجتماعية": "/uni-level-activities",
  "الأنشطة العلمية":    "/uni-level-activities",
};

function getFirstRoute(
  departments: Dept[],
  map: Record<string, string>
): string | null {
  for (const dept of departments) {
    const route = map[dept.dept_name.trim()];
    if (route) return route;
  }
  return null;
}

export default function LoginPage({ onClose, onSwitchToSignup }: LoginPageProps) {
  const router = useRouter();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const showNotification = (message: string, type: "success" | "warning" | "error") => {
    setNotification(`${type}:${message}`);
    setTimeout(() => setNotification(null), 3500);
  };

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
      const res  = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        showNotification("بريد إلكتروني خاطئ أو كلمة مرور خاطئة ❌", "error");
        setLoading(false);
        return;
      }

      // ── Map role → roleKey ───────────────────────────────────
      let roleKey = "";
      if (data.user_type === "admin") {
        const role = data.role?.trim();
        if      (role === "مشرف النظام")  roleKey = "super_admin";
        else if (role === "مدير ادارة")   roleKey = "uni_manager";
        else if (role === "مسؤول كلية")   roleKey = "fac_manager";
        else if (role === "مدير كلية")    roleKey = "fac_head";
        else if (role === "مدير عام")     roleKey = "General_admin";
      }

      // ── Persist tokens & user ────────────────────────────────
      localStorage.setItem("access",  data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("role",    data.role);
      localStorage.setItem("name",    data.name);
      localStorage.setItem("user", JSON.stringify({
        name:         data.name,
        role:         data.role,
        faculty_name: data.faculty_name,
        admin_id:     data.admin_id,
        user_type:    data.user_type,
      }));

      // ── Save departments (fac_manager + uni_manager only) ─────
      if (
        (roleKey === "fac_manager" || roleKey === "uni_manager") &&
        Array.isArray(data.departments) &&
        data.departments.length > 0
      ) {
        localStorage.setItem("departments", JSON.stringify(data.departments));
        localStorage.setItem("dept_ids",    JSON.stringify(data.dept_ids ?? []));
      } else {
        // Remove for all other roles — so Header shows all buttons
        localStorage.removeItem("departments");
        localStorage.removeItem("dept_ids");
      }

      if (data.user_type === "student") {
        localStorage.setItem("student_id", data.student_id.toString());
      } else {
        localStorage.setItem("admin_id", data.admin_id.toString());
      }

      // ── Cookies ──────────────────────────────────────────────
      document.cookie = `access=${data.access}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `refresh=${data.refresh}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `user_type=${data.user_type}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `roleKey=${roleKey}; path=/; max-age=604800; SameSite=Lax`;

      // ── Routing ──────────────────────────────────────────────
      if (data.user_type === "admin") {
        const depts: Dept[] = data.departments ?? [];

        if (roleKey === "super_admin") {
          router.push("/SuperAdmin");

        } else if (roleKey === "uni_manager") {
          // Route to first accessible uni-level dept, fallback to /uni-level
          const route = getFirstRoute(depts, UNI_ROUTE_MAP);
          router.push(route ?? "/uni-level");

        } else if (roleKey === "fac_manager") {
          // Route to first accessible fac-level dept, fallback to /FacLevel
          const route = getFirstRoute(depts, FAC_ROUTE_MAP);
          router.push(route ?? "/FacLevel");

        } else if (roleKey === "fac_head") {
          router.push("/FacultyHead");

        } else if (roleKey === "General_admin") {
          router.push("/GeneralAdmin");

        } else {
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
      <button className={styles.closeBtn} onClick={onClose}>✕</button>

      <div className={styles.logoContainer}>
        <Image src={logo} alt="Logo" width={150} height={150} draggable={false} />
      </div>

      <h2 className={styles.loginTitle}>تسجيل الدخول</h2>

      {notification && (
        <div className={`${styles.notification} ${
          notification.startsWith("success") ? styles.success :
          notification.startsWith("warning") ? styles.warning : styles.error
        }`}>
          {notification.split(":")[1]}
        </div>
      )}

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

        <p className={styles.forgotWrap}>
          <button type="button" className={styles.forgotLink} onClick={() => setShowForgotPassword(true)}>
            نسيت كلمة المرور؟
          </button>
        </p>

        {errors.general && <p className={styles.errorMsg}>{errors.general}</p>}

        <button type="submit" disabled={loading} className={styles.loginButton}>
          {loading ? "جاري التحقق..." : "تسجيل الدخول"}
        </button>
      </form>

      <p className={styles.signupText}>
        ليس لديك حساب؟{" "}
        <span className={styles.linkSwitch} onClick={onSwitchToSignup}>إنشاء حساب جديد</span>
      </p>

      {showForgotPassword && (
        <ForgotPasswordModal
          onClose={() => setShowForgotPassword(false)}
          onSuccess={() => showNotification("تم تغيير كلمة المرور. سجّل الدخول بالكلمة الجديدة.", "success")}
        />
      )}
    </div>
  );
}