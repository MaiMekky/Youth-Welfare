"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "../assets/logo.png";
import styles from "../Styles/components/LoginPage.module.css";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";

interface LoginPageProps {
  onClose: () => void;
  onSwitchToSignup: () => void;
}

interface Dept { dept_id: number; dept_name: string; }

// ── Route maps per role level ─────────────────────────────────
const FAC_ROUTE_MAP: Record<string, string> = {
  "إدارة التكافل الاجتماعي":  "/FacLevel",
  "إدارة الأسر الطلابية و الاتحادات" :  "/Family-Faclevel/events",
  "إدارة النشاط الثقافي و الفنى":   "/Events-Faclevel",
  "إدارة النشاط الاجتماعي":   "/Events-Faclevel",
  "إدارة النشاط الرياضي و الرحلات":    "/Events-Faclevel",
  "إدارة النشاط العلمى و التكنولوجي": "/Events-Faclevel",
};

const UNI_ROUTE_MAP: Record<string, string> = {
"إدارة التكافل الاجتماعي":  "/uni-level",
  "إدارة الأسر الطلابية و الاتحادات" :     "/uni-level-family",
  "إدارة النشاط الرياضي و الرحلات":   "/uni-level-activities",
  "إدارة النشاط الثقافي و الفنى":   "/uni-level-activities",
  "إدارة النشاط الاجتماعي": "/uni-level-activities",
  "إدارة النشاط العلمى و التكنولوجي":  "/uni-level-activities",
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

  useEffect(() => {
  const access = localStorage.getItem("access");
  const role = localStorage.getItem("role");
  const departments = JSON.parse(localStorage.getItem("departments") || "[]");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const lastRoute = localStorage.getItem("lastRoute");

  if (access && lastRoute) {
    router.replace(lastRoute);
    return;
  }
  if (!access || !user) return;

  const userType = user.user_type;

  if (userType === "student") {
    router.replace("/Student");
    return;
  }

  if (userType === "admin") {
    const roleName = role?.trim();

    let roleKey = "";

    if (roleName === "مشرف النظام") roleKey = "super_admin";
    else if (roleName === "مدير ادارة") roleKey = "uni_manager";
    else if (roleName === "مسؤول كلية") roleKey = "fac_manager";
    else if (roleName === "مدير كلية") roleKey = "fac_head";
    else if (roleName === "مدير عام") roleKey = "General_admin";

    if (roleKey === "super_admin") {
      router.replace("/CreateAdmins");
      return;
    }

    if (roleKey === "uni_manager") {
      const route = getFirstRoute(departments, UNI_ROUTE_MAP);
      router.replace(route ?? "/uni-level");
      return;
    }

    if (roleKey === "fac_manager") {
      const route = getFirstRoute(departments, FAC_ROUTE_MAP);
      router.replace(route ?? "/FacLevel");
      return;
    }

    if (roleKey === "fac_head") {
      router.replace("/FacultyHead");
      return;
    }

    if (roleKey === "General_admin") {
      router.replace("/GeneralAdmin");
      return;
    }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

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
      const baseUrl = getBaseUrl();
      const res  = await authFetch(`${baseUrl}/api/auth/login/`, {
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
     localStorage.setItem("departments", JSON.stringify(data.departments));

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
      const lastRoute = localStorage.getItem("lastRoute");

      if (lastRoute) {
        router.push(lastRoute);
        return;
      }
      // ── Routing ──────────────────────────────────────────────
      if (data.user_type === "admin") {
        const depts: Dept[] = data.departments ?? [];

        if (roleKey === "super_admin") {
          router.push("/CreateAdmins");

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
 // ======= Google Login Handler =======
  const handleGoogleLogin = async () => {
    try {
      // Step 1: Get the Google authorization URL from your backend
      const initRes = await authFetch(
        `${getBaseUrl()}/api/auth/google/init/`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const initData = await initRes.json();
      
      if (!initRes.ok) {
        showNotification("فشل في الاتصال بـ Google ❌", "error");
        return;
      }

      // Step 2: Redirect to Google
      window.location.href = initData.authorization_url;

    } catch (error) {
      console.error(error);
      showNotification("خطأ في عملية تسجيل الدخول بـ Google ❌", "error");
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
          onChange={(e) => setEmail(e.target.value.toLowerCase())}
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