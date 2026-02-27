"use client";

import React, { useState, useCallback, useEffect } from "react";
import { X, Mail, KeyRound, Lock, ArrowRight } from "lucide-react";
import styles from "../Styles/components/ForgotPasswordModal.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Step = "email" | "code" | "success";

interface ForgotPasswordModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ForgotPasswordModal({ onClose, onSuccess }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const showMessage = useCallback((text: string, type: "success" | "error" | "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const validateEmail = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = "البريد الإلكتروني مطلوب";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      e.email = "أدخل بريدًا إلكترونيًا صالحًا";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateCodeStep = () => {
    const e: Record<string, string> = {};
    if (!code.trim()) e.code = "أدخل الكود المرسل إلى بريدك";
    if (!newPassword.trim()) e.newPassword = "كلمة المرور الجديدة مطلوبة";
    else if (newPassword.length < 6) e.newPassword = "كلمة المرور 6 أحرف على الأقل";
    if (newPassword !== confirmPassword) e.confirmPassword = "كلمة المرور غير متطابقة";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Backend: POST body { email } → send OTP/code to email
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail()) return;
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch(`${API_BASE}/api/auth/request-password-reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showMessage(data.detail || data.message || "فشل إرسال الكود. تحقق من البريد أو حاول لاحقًا.", "error");
        setLoading(false);
        return;
      }
      setStep("code");
      showMessage("تم إرسال كود إعادة التعيين إلى بريدك الإلكتروني. تحقق من صندوق الوارد أو الرسائل غير المرغوبة.", "success");
    } catch (err) {
      console.error(err);
      showMessage("حدث خطأ في الاتصال. تأكد من الاتصال بالإنترنت وحاول مرة أخرى.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCodeStep()) return;
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim(),
          new_password: newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showMessage(data.detail || data.message || "فشل تغيير كلمة المرور. تحقق من الكود وحاول مرة أخرى.", "error");
        setLoading(false);
        return;
      }
      setStep("success");
      showMessage("تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.", "success");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      showMessage("حدث خطأ في الاتصال. حاول مرة أخرى.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep("email");
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
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
          {step === "code" && "إدخال الكود وكلمة المرور الجديدة"}
          {step === "success" && "تم بنجاح"}
        </h2>

        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        {step === "email" && (
          <>
            <p className={styles.subtitle}>
              أدخل بريدك الجامعي وسنرسل لك كودًا لإعادة تعيين كلمة المرور.
            </p>
            <form onSubmit={handleRequestCode} className={styles.form}>
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
                {loading ? "جاري الإرسال..." : "إرسال الكود"}
              </button>
            </form>
          </>
        )}

        {step === "code" && (
          <>
            <p className={styles.subtitle}>
              أدخل الكود الذي وصلك على <strong>{email}</strong> وكلمة المرور الجديدة.
            </p>
            <form onSubmit={handleResetPassword} className={styles.form}>
              <div className={styles.inputWrap}>
                <KeyRound className={styles.inputIcon} size={18} />
                <input
                  type="text"
                  placeholder="الكود المرسل إلى البريد"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={errors.code ? styles.invalid : ""}
                  autoComplete="one-time-code"
                  autoFocus
                />
              </div>
              {errors.code && <p className={styles.errorMsg}>{errors.code}</p>}

              <div className={styles.inputWrap}>
                <Lock className={styles.inputIcon} size={18} />
                <input
                  type="password"
                  placeholder="كلمة المرور الجديدة"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={errors.newPassword ? styles.invalid : ""}
                  autoComplete="new-password"
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
                تغيير البريد الإلكتروني
              </button>
            </form>
          </>
        )}

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
