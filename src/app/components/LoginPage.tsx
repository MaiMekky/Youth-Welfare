"use client";
import React, { useState } from "react";
import Image from "next/image";
import logo from "../assets/logo.png";
import styles from "../Styles/components/LoginPage.module.css";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";

interface LoginPageProps {
  onClose: () => void;
  onSwitchToSignup: () => void;
}

interface Dept { dept_id: number; dept_name: string; }

// ── Route maps per role level (keyed by dept_id) ──────────────────────────────
// Used only to determine the FIRST/default destination after login.
// The middleware uses its own copy of these maps for ongoing protection.
const FAC_ROUTE_MAP: Record<number, string> = {
  6: "/FacLevel",                     // إدارة التكافل الاجتماعي
  4: "/Family-Faclevel/events",       // إدارة الأسر الطلابية و الاتحادات
  1: "/Events-Faclevel/Home",         // إدارة النشاط الثقافي و الفنى
  2: "/Events-Faclevel/Home",         // إدارة النشاط الاجتماعي
  3: "/Events-Faclevel/Home",         // إدارة النشاط الرياضي و الرحلات
  5: "/Events-Faclevel/Home",         // إدارة النشاط العلمى و التكنولوجي
  7: "/Events-Faclevel/Home",         // إدارة الجوالة و الرحلات و المعسكرات
};

const UNI_ROUTE_MAP: Record<number, string> = {
  6: "/uni-level",                    // إدارة التكافل الاجتماعي
  4: "/uni-level-family",             // إدارة الأسر الطلابية و الاتحادات
  3: "/uni-level-activities/Home",    // إدارة النشاط الرياضي و الرحلات
  1: "/uni-level-activities/Home",    // إدارة النشاط الثقافي و الفنى
  2: "/uni-level-activities/Home",    // إدارة النشاط الاجتماعي
  5: "/uni-level-activities/Home",    // إدارة النشاط العلمى و التكنولوجي
  7: "/uni-level-scouts/Home",        // إدارة الجوالة و الرحلات و المعسكرات
};

function getFirstRoute(
  departments: Dept[],
  map: Record<number, string>,
  fallback: string
): string | null {
  for (const dept of departments) {
    // Use the mapped route, or the fallback for any unknown/future dept_id
    const route = map[dept.dept_id] ?? fallback;
    if (route) return route;
  }
  return null;
}

export default function LoginPage({ onClose, onSwitchToSignup }: LoginPageProps) {
  const { showToast } = useToast();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

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
      const res = await fetch(`${baseUrl}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        showToast("بريد إلكتروني خاطئ أو كلمة مرور خاطئة ❌", "error");
        return;
      }

      // ── Map role → roleKey ─────────────────────────────────────────────────
      let roleKey = "";
      if (data.user_type === "admin") {
        const role = data.role?.trim();
        if      (role === "مشرف النظام") roleKey = "super_admin";
        else if (role === "مدير ادارة")  roleKey = "uni_manager";
        else if (role === "مسؤول كلية")  roleKey = "fac_manager";
        else if (role === "مدير كلية")   roleKey = "fac_head";
        else if (role === "مدير عام")    roleKey = "General_admin";
      }

      // ── Collect dept_ids from the response ────────────────────────────────
      // Prefer explicit dept_ids array; fall back to extracting from departments
      const depts: Dept[] = data.departments ?? [];
      const deptIds: number[] = (data.dept_ids && data.dept_ids.length > 0)
        ? data.dept_ids
        : depts.map((d: Dept) => d.dept_id);

      // ── Non-sensitive display/routing data ────────────────────────────────
      const sessionData = {
        user_type:    data.user_type,
        roleKey,
        role:         data.role,
        name:         data.name,
        faculty_name: data.faculty_name ?? "",
        admin_id:     data.admin_id ?? null,
        student_id:   data.student_id ?? null,
        departments:  depts,
        dept_ids:     deptIds,
        faculty_id:   data.faculty_id ?? null,
      };

      // Middleware reads these as separate cookies (edge runtime can't parse JSON)
      const cookieOpts = "path=/; max-age=604800; SameSite=Lax";
      document.cookie = `user_type=${data.user_type}; ${cookieOpts}`;
      document.cookie = `roleKey=${roleKey}; ${cookieOpts}`;
      // ✅ NEW: flat comma-separated dept_ids cookie for middleware route guards
      document.cookie = `dept_ids=${deptIds.join(",")}; ${cookieOpts}`;
      // Full session data (used by app components, not middleware)
      document.cookie = `session_meta=${encodeURIComponent(JSON.stringify(sessionData))}; ${cookieOpts}`;

      // ── Determine post-login destination ──────────────────────────────────
      let destination = "/";

      if (data.user_type === "admin") {
        if (roleKey === "super_admin") {
          destination = "/CreateAdmins";
        } else if (roleKey === "uni_manager") {
          const route = getFirstRoute(depts, UNI_ROUTE_MAP, "/uni-level-activities/Home");
          if (!route) {
            showToast("لا توجد أقسام مخصصة لهذا المستخدم، تواصل مع الدعم", "error");
            return;
          }
          destination = route;
        } else if (roleKey === "fac_manager") {
          const route = getFirstRoute(depts, FAC_ROUTE_MAP, "/Events-Faclevel/Home");
          if (!route) {
            showToast("لا توجد أقسام مخصصة لهذا المستخدم، تواصل مع الدعم", "error");
            return;
          }
          destination = route;
        } else if (roleKey === "fac_head") {
          destination = "/FacultyHead";
        } else if (roleKey === "General_admin") {
          destination = "/GeneralAdmin";
        } else {
          showToast("دور المستخدم غير معروف، تواصل مع الدعم", "error");
          return;
        }
      } else if (data.user_type === "student") {
        destination = "/Student";
      }

      // Hard navigate so browser sends all cookies with the first request
      window.location.href = destination;

    } catch (error) {
      console.error(error);
      showToast("حدث خطأ أثناء تسجيل الدخول ❌", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Google Login ───────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    try {
      const initRes = await fetch(
        `${getBaseUrl()}/api/auth/google/init/`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      const initData = await initRes.json();
      if (!initRes.ok) {
        showToast("فشل في الاتصال بـ Google ❌", "error");
        return;
      }
      window.location.href = initData.authorization_url;
    } catch (error) {
      console.error(error);
      showToast("خطأ في عملية تسجيل الدخول بـ Google ❌", "error");
    }
  };

  return (
    <div className={styles.loginBox}>
      <button className={styles.closeBtn} onClick={onClose}>✕</button>

      <div className={styles.logoContainer}>
        <Image src={logo} alt="Logo" width={150} height={150} draggable={false} />
      </div>

      <h2 className={styles.loginTitle}>تسجيل الدخول</h2>

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
          <button
            type="button"
            className={styles.forgotLink}
            onClick={() => setShowForgotPassword(true)}
          >
            نسيت كلمة المرور؟
          </button>
        </p>

        {errors.general && <p className={styles.errorMsg}>{errors.general}</p>}

        <button type="submit" disabled={loading} className={styles.loginButton}>
          {loading ? "جاري التحقق..." : "تسجيل الدخول"}
        </button>
      </form>

      <button type="button" className={styles.googleButton} onClick={handleGoogleLogin}>
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

      <p className={styles.signupText}>
        ليس لديك حساب؟{" "}
        <span className={styles.linkSwitch} onClick={onSwitchToSignup}>إنشاء حساب جديد</span>
      </p>

      {showForgotPassword && (
        <ForgotPasswordModal
          onClose={() => setShowForgotPassword(false)}
          onSuccess={() => showToast("تم تغيير كلمة المرور. سجّل الدخول بالكلمة الجديدة.", "success")}
        />
      )}
    </div>
  );
}