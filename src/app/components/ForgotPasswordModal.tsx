"use client";

import React, { useState, useCallback, useEffect } from "react";
import { X, Mail, Lock, ArrowRight } from "lucide-react";
import styles from "../Styles/components/ForgotPasswordModal.module.css";
import { authFetch } from "@/utils/globalFetch";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Step = "email" | "confirm" | "success";

interface ForgotPasswordModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ForgotPasswordModal({ onClose, onSuccess }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [uid, setUid] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const showMessage = useCallback((text: string, type: "success" | "error" | "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // If uid & token are present in the URL (from email link), pre-fill and jump to confirm step
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const urlUid = params.get("uid");
    const urlToken = params.get("token");
    if (urlUid && urlToken) {
      setUid(urlUid);
      setToken(urlToken);
      setStep("confirm");
    }
  }, []);

  const validateEmail = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = "البريد الإلكتروني مطلوب";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      e.email = "أدخلي بريدًا إلكترونيًا صالحًا";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateConfirmStep = () => {
    const e: Record<string, string> = {};
    if (!newPassword.trim()) e.newPassword = "كلمة المرور الجديدة مطلوبة";
    else if (newPassword.length < 6) e.newPassword = "كلمة المرور 6 أحرف على الأقل";
    if (newPassword !== confirmPassword) e.confirmPassword = "كلمتا المرور غير متطابقتين";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Backend: POST { email } → sends password-reset email (with uid + token in link)
  const handleRequestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail()) return;
    setLoading(true);
    setErrors({});
    try {
      const res = await authFetch(`${API_BASE}/api/auth/password-reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showMessage(
          data.detail || data.message || "فشل إرسال رابط إعادة التعيين. تأكدي من صحة البريد أو حاولي لاحقًا.",
          "error"
        );
        setLoading(false);
        return;
      }
      showMessage(
        "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك. افتحي الرابط من بريدك الإلكتروني لإكمال العملية.",
        "success"
      );
    } catch (err) {
      console.error(err);
      showMessage("حدث خطأ في الاتصال. تأكدي من الاتصال بالإنترنت ثم حاولي مرة أخرى.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Backend: POST { uid, token, new_password, confirm_password } → confirms reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateConfirmStep()) return;

    // Safety check — uid/token must exist (they come from the URL)
    if (!uid || !token) {
      showMessage("رابط إعادة التعيين غير صالح. يرجى النقر على الرابط الموجود في بريدك مرة أخرى.", "error");
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const res = await authFetch(`${API_BASE}/api/auth/password-reset/confirm/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: uid.trim(),
          token: token.trim(),
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showMessage(
          data.detail || data.message || "فشل تغيير كلمة المرور. قد يكون الرابط منتهي الصلاحية، حاولي طلب رابط جديد.",
          "error"
        );
        setLoading(false);
        return;
      }
      setStep("success");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2500);
    } catch (err) {
      console.error(err);
      showMessage("حدث خطأ في الاتصال. حاولي مرة أخرى.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep("email");
    setUid("");
    setToken("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
    setMessage(null);
    // Clear uid/token from URL without page reload
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("uid");
      url.searchParams.delete("token");
      window.history.replaceState({}, "", url.toString());
    }
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="forgot-password-title">
      <div className={styles.box} dir="rtl">
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="إغلاق"
        >
          <X size={22} />
        </button>

        <h2 id="forgot-password-title" className={styles.title}>
          {step === "email" && "نسيت كلمة المرور"}
          {step === "confirm" && "تعيين كلمة مرور جديدة"}
          {step === "success" && "تم بنجاح"}
        </h2>

        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        {/* ── Step 1: Enter email ── */}
        {step === "email" && (
          <>
            <p className={styles.subtitle}>
              أدخلي بريدك الجامعي وسنرسل لك رابطًا لإعادة تعيين كلمة المرور.
            </p>
            <form onSubmit={handleRequestEmail} className={styles.form}>
              <div className={styles.inputWrap}>
                <Mail className={styles.inputIcon} size={18} />
                <input
                  type="email"
                  placeholder="البريد الجامعي"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? styles.invalid : ""}
                  autoComplete="email"
                  autoFocus
                />
              </div>
              {errors.email && <p className={styles.errorMsg}>{errors.email}</p>}
              <button type="submit" disabled={loading} className={styles.primaryBtn}>
                {loading ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
              </button>
            </form>
          </>
        )}

        {/* ── Step 2: Set new password (uid & token come from URL, hidden from user) ── */}
        {step === "confirm" && (
          <>
            <p className={styles.subtitle}>
              أدخلي كلمة المرور الجديدة لحسابك.
            </p>
            <form onSubmit={handleResetPassword} className={styles.form}>
              <div className={styles.inputWrap}>
                <Lock className={styles.inputIcon} size={18} />
                <input
                  type="password"
                  placeholder="كلمة المرور الجديدة"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={errors.newPassword ? styles.invalid : ""}
                  autoComplete="new-password"
                  autoFocus
                />
              </div>
              {errors.newPassword && <p className={styles.errorMsg}>{errors.newPassword}</p>}

              <div className={styles.inputWrap}>
                <Lock className={styles.inputIcon} size={18} />
                <input
                  type="password"
                  placeholder="تأكيد كلمة المرور الجديدة"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? styles.invalid : ""}
                  autoComplete="new-password"
                />
              </div>
              {errors.confirmPassword && <p className={styles.errorMsg}>{errors.confirmPassword}</p>}

              <button type="submit" disabled={loading} className={styles.primaryBtn}>
                {loading ? "جاري الحفظ..." : "تغيير كلمة المرور"}
              </button>

              <button
                type="button"
                className={styles.backBtn}
                onClick={handleBackToEmail}
                disabled={loading}
              >
                <ArrowRight size={16} />
                إرسال رابط جديد
              </button>
            </form>
          </>
        )}

        {/* ── Step 3: Success ── */}
        {step === "success" && (
          <div className={styles.successBlock}>
            <div className={styles.successIcon}>✓</div>
            <p className={styles.successText}>تم تغيير كلمة المرور بنجاح.</p>
            <p className={styles.successSub}>جاري تحويلك لتسجيل الدخول...</p>
          </div>
        )}
      </div>
    </div>
  );
}