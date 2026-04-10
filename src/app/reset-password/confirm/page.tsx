"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import logo from "@/utils/logo.png";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
const API_BASE = getBaseUrl();

/* ── Inline styles ───────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy:        #1a2744;
    --navy-mid:    #243358;
    --navy-light:  #2e4070;
    --gold:        #c9972a;
    --gold-bright: #e0aa35;
    --gold-pale:   rgba(201,151,42,0.12);
    --gold-border: rgba(201,151,42,0.25);
    --white:       #ffffff;
    --off-white:   #f4f6fc;
    --text-light:  rgba(255,255,255,0.65);
    --text-muted:  rgba(255,255,255,0.4);
    --danger:      #e05252;
    --danger-bg:   rgba(224,82,82,0.12);
    --danger-bdr:  rgba(224,82,82,0.3);
    --success:     #22c55e;
    --success-bg:  rgba(34,197,94,0.12);
    --success-bdr: rgba(34,197,94,0.3);
    --radius:      14px;
    --radius-sm:   9px;
    --trans:       0.22s cubic-bezier(0.4,0,0.2,1);
  }

  .rp-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(145deg, #101828 0%, #1a2744 45%, #243358 75%, #1d2e52 100%);
    font-family: 'Cairo', sans-serif;
    direction: rtl;
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
  }

  /* ── Decorative background shapes ─────────── */
  .rp-page::before {
    content: '';
    position: fixed;
    top: -15%;
    right: -10%;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201,151,42,0.1) 0%, transparent 70%);
    pointer-events: none;
  }
  .rp-page::after {
    content: '';
    position: fixed;
    bottom: -15%;
    left: -8%;
    width: 450px;
    height: 450px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(46,64,112,0.6) 0%, transparent 70%);
    pointer-events: none;
  }

  .rp-blob {
    position: fixed;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
    z-index: 0;
  }
  .rp-blob-1 {
    top: 10%;
    left: 15%;
    width: 300px;
    height: 300px;
    background: rgba(201,151,42,0.07);
  }
  .rp-blob-2 {
    bottom: 12%;
    right: 12%;
    width: 280px;
    height: 280px;
    background: rgba(36,51,88,0.7);
  }

  /* ── Card ──────────────────────────────────── */
  .rp-card {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 480px;
    background: rgba(255,255,255,0.04);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 24px;
    padding: 2.75rem 2.5rem 2.5rem;
    box-shadow:
      0 32px 64px rgba(0,0,0,0.45),
      0 0 0 1px rgba(201,151,42,0.1),
      inset 0 1px 0 rgba(255,255,255,0.06);
  }

  /* top gold accent line */
  .rp-card::before {
    content: '';
    position: absolute;
    top: 0; left: 10%; right: 10%;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--gold), var(--gold-bright), var(--gold), transparent);
    border-radius: 0 0 99px 99px;
  }

  /* ── Logo ──────────────────────────────────── */
  .rp-logo-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 2rem;
  }
  .rp-logo-ring {
    width: 100px;
    height: 100px;
    border-radius: 22px;
    background: var(--white);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    box-shadow:
      0 8px 28px rgba(0,0,0,0.35),
      0 0 0 1px var(--gold-border),
      inset 0 1px 0 rgba(255,255,255,0.9);
    margin-bottom: 1.2rem;
  }
  .rp-logo-img {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain;
  }
  .rp-heading {
    font-size: 1.45rem;
    font-weight: 800;
    color: var(--white);
    letter-spacing: 0.01em;
    text-align: center;
    line-height: 1.25;
    margin-bottom: 0.35rem;
  }
  .rp-sub {
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--gold-bright);
    text-align: center;
    letter-spacing: 0.04em;
    opacity: 0.85;
  }

  /* ── Divider ───────────────────────────────── */
  .rp-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    margin: 1.5rem 0;
  }

  /* ── Alert boxes ───────────────────────────── */
  .rp-alert {
    border-radius: var(--radius-sm);
    padding: 1.25rem 1.25rem;
    margin-bottom: 1.25rem;
  }
  .rp-alert-error  { background: var(--danger-bg);  border: 1px solid var(--danger-bdr); }
  .rp-alert-success{ background: var(--success-bg); border: 1px solid var(--success-bdr);}
  .rp-alert-icon { display: block; margin: 0 auto 0.75rem; }
  .rp-alert-title {
    font-size: 1rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 0.4rem;
  }
  .rp-alert-title-error   { color: #fca5a5; }
  .rp-alert-title-success { color: #86efac; }
  .rp-alert-body {
    font-size: 0.85rem;
    color: var(--text-light);
    text-align: center;
    line-height: 1.6;
  }

  /* inline error banner */
  .rp-inline-error {
    display: flex;
    gap: 0.6rem;
    align-items: flex-start;
    background: var(--danger-bg);
    border: 1px solid var(--danger-bdr);
    border-radius: var(--radius-sm);
    padding: 0.9rem 1rem;
    margin-bottom: 1.25rem;
  }
  .rp-inline-error svg { flex-shrink: 0; margin-top: 1px; }
  .rp-inline-error span { font-size: 0.85rem; color: #fca5a5; line-height: 1.5; }

  /* ── Form ──────────────────────────────────── */
  .rp-field { margin-bottom: 1.1rem; }
  .rp-label {
    display: block;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-light);
    margin-bottom: 7px;
    letter-spacing: 0.02em;
  }
  .rp-input-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 52px;
    border-radius: var(--radius-sm);
    padding: 0 14px;
    background: rgba(255,255,255,0.055);
    border: 1px solid rgba(255,255,255,0.1);
    transition: border-color var(--trans), background var(--trans), box-shadow var(--trans);
  }
  .rp-input-wrap:focus-within {
    border-color: var(--gold-border);
    background: rgba(255,255,255,0.07);
    box-shadow: 0 0 0 3px rgba(201,151,42,0.12);
  }
  .rp-input-wrap.has-error {
    border-color: var(--danger-bdr);
  }
  .rp-input-wrap.has-error:focus-within {
    box-shadow: 0 0 0 3px rgba(224,82,82,0.12);
  }
  .rp-input-icon { flex-shrink: 0; color: var(--text-muted); }
  .rp-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--white);
    font-family: 'Cairo', sans-serif;
    font-size: 0.95rem;
    direction: rtl;
  }
  .rp-input::placeholder { color: var(--text-muted); }
  .rp-eye-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 3px;
    display: flex;
    align-items: center;
    color: var(--text-muted);
    transition: color var(--trans);
  }
  .rp-eye-btn:hover { color: var(--text-light); }

  .rp-field-error {
    font-size: 0.76rem;
    color: var(--danger);
    margin-top: 5px;
  }

  /* ── Strength bar ──────────────────────────── */
  .rp-strength-bars {
    display: flex;
    gap: 4px;
    margin: 6px 0 2px;
  }
  .rp-strength-bar {
    flex: 1;
    height: 4px;
    border-radius: 99px;
    transition: background 0.3s;
  }
  .rp-strength-label {
    font-size: 0.74rem;
    font-weight: 600;
  }

  /* ── Submit button ─────────────────────────── */
  .rp-submit {
    width: 100%;
    height: 52px;
    margin-top: 0.5rem;
    border: none;
    border-radius: var(--radius-sm);
    background: linear-gradient(135deg, var(--gold) 0%, var(--gold-bright) 50%, #b8881e 100%);
    color: var(--navy);
    font-family: 'Cairo', sans-serif;
    font-size: 1rem;
    font-weight: 800;
    letter-spacing: 0.03em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all var(--trans);
    box-shadow: 0 6px 20px rgba(201,151,42,0.35);
  }
  .rp-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(201,151,42,0.5);
    background: linear-gradient(135deg, var(--gold-bright) 0%, #f0c040 50%, var(--gold) 100%);
  }
  .rp-submit:active:not(:disabled) { transform: translateY(0); }
  .rp-submit:disabled { opacity: 0.65; cursor: not-allowed; }

  .rp-back-btn {
    width: 100%;
    height: 46px;
    margin-top: 0.75rem;
    border: 1px solid var(--gold-border);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--gold-bright);
    font-family: 'Cairo', sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    transition: all var(--trans);
  }
  .rp-back-btn:hover {
    background: var(--gold-pale);
    border-color: var(--gold);
  }

  /* ── Spin ──────────────────────────────────── */
  @keyframes rp-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .rp-spin { animation: rp-spin 1s linear infinite; }

  /* ── Icons (inline SVG) ────────────────────── */
  .rp-icon-lock, .rp-icon-check, .rp-icon-x {
    display: inline-block;
    vertical-align: middle;
  }
`;

/* ── SVG icons ───────────────────────────────────────────────── */
const LockIcon = ({ size = 18, cls = "" }) => (
  <svg className={`rp-icon-lock ${cls}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const CheckCircleIcon = ({ size = 48 }) => (
  <svg className="rp-icon-check" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#22c55e" }}>
    <circle cx="12" cy="12" r="10"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);
const XCircleIcon = ({ size = 40 }) => (
  <svg className="rp-icon-x" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#e05252" }}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);
const XSmallIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e05252" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

/* ── Strength helpers ────────────────────────────────────────── */
const calcStrength = (pw: string) => {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 6)          s++;
  if (pw.length >= 10)         s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};
const STRENGTH_LABELS = ["", "ضعيفة جداً", "ضعيفة", "متوسطة", "قوية", "قوية جداً"];
const STRENGTH_COLORS = ["", "#ef4444", "#f97316", "#eab308", "#22c55e", "#16a34a"];

/* ── Main form ───────────────────────────────────────────────── */
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const uid   = searchParams.get("uid")   || "";
  const token = searchParams.get("token") || "";

  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew,         setShowNew]         = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [errors,          setErrors]          = useState<Record<string, string>>({});
  const [loading,         setLoading]         = useState(false);
  const [status,          setStatus]          = useState<"idle" | "success" | "error">("idle");
  const [statusMsg,       setStatusMsg]       = useState("");

  const invalidLink = !uid || !token;
  const strength      = calcStrength(newPassword);
  const strengthLabel = STRENGTH_LABELS[strength];
  const strengthColor = STRENGTH_COLORS[strength];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!newPassword) e.newPassword = "كلمة المرور الجديدة مطلوبة";
    else if (newPassword.length < 6) e.newPassword = "كلمة المرور 6 أحرف على الأقل";
    if (!confirmPassword) e.confirmPassword = "تأكيد كلمة المرور مطلوب";
    else if (newPassword !== confirmPassword) e.confirmPassword = "كلمتا المرور غير متطابقتين";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/auth/password-reset/confirm/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, token, new_password: newPassword, confirm_password: confirmPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setStatusMsg(data.detail || data.error || data.message || "فشل تغيير كلمة المرور. قد يكون الرابط منتهي الصلاحية، يرجى طلب رابط جديد.");
      } else {
        setStatus("success");
        setStatusMsg("تم تغيير كلمة المرور بنجاح! جاري تحويلك إلى صفحة الدخول...");
        setTimeout(() => router.push("/"), 2800);
      }
    } catch {
      setStatus("error");
      setStatusMsg("حدث خطأ في الاتصال. تأكد من الاتصال بالإنترنت وحاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rp-page">
      <style>{styles}</style>

      {/* Decorative blobs */}
      <div className="rp-blob rp-blob-1" />
      <div className="rp-blob rp-blob-2" />

      <div className="rp-card">

        {/* ── Logo + Heading ── */}
        <div className="rp-logo-wrap">
          <div className="rp-logo-ring">
            <Image
              src={logo}
              alt="شعار جامعة العاصمة"
              className="rp-logo-img"
              width={88}
              height={88}
              priority
            />
          </div>
          <h1 className="rp-heading">إعادة تعيين كلمة المرور</h1>
          <p className="rp-sub">الإدارة العامة لرعاية الشباب — جامعة العاصمة</p>
        </div>

        <div className="rp-divider" />

        {/* ── Invalid link ── */}
        {invalidLink && (
          <div className="rp-alert rp-alert-error">
            <XCircleIcon size={44} />
            <p className="rp-alert-title rp-alert-title-error" style={{ marginTop: "0.75rem" }}>رابط غير صالح</p>
            <p className="rp-alert-body">يرجى طلب رابط إعادة تعيين جديد من صفحة تسجيل الدخول.</p>
            <button className="rp-back-btn" style={{ marginTop: "1.25rem" }} onClick={() => router.push("/")}>
              العودة للرئيسية
            </button>
          </div>
        )}

        {/* ── Success ── */}
        {!invalidLink && status === "success" && (
          <div className="rp-alert rp-alert-success">
            <CheckCircleIcon size={52} />
            <p className="rp-alert-title rp-alert-title-success" style={{ marginTop: "0.75rem", fontSize: "1.1rem" }}>
              تم بنجاح 🎉
            </p>
            <p className="rp-alert-body">{statusMsg}</p>
          </div>
        )}

        {/* ── Error banner ── */}
        {!invalidLink && status === "error" && (
          <div className="rp-inline-error">
            <XSmallIcon />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* ── Form ── */}
        {!invalidLink && status !== "success" && (
          <form onSubmit={handleSubmit} noValidate>

            {/* New password */}
            <div className="rp-field">
              <label className="rp-label">كلمة المرور الجديدة</label>
              <div className={`rp-input-wrap${errors.newPassword ? " has-error" : ""}`}>
                <LockIcon size={17} cls="rp-input-icon" />
                <input
                  className="rp-input"
                  type={showNew ? "text" : "password"}
                  placeholder="أدخل كلمة مرور قوية"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  autoFocus
                  autoComplete="new-password"
                />
                <button type="button" className="rp-eye-btn" onClick={() => setShowNew(s => !s)}>
                  {showNew
                    ? <EyeOff size={16} />
                    : <Eye size={16} />
                  }
                </button>
              </div>

              {/* Strength indicator */}
              {newPassword && (
                <div>
                  <div className="rp-strength-bars">
                    {[1,2,3,4,5].map(i => (
                      <div
                        key={i}
                        className="rp-strength-bar"
                        style={{ background: i <= strength ? strengthColor : "rgba(255,255,255,0.1)" }}
                      />
                    ))}
                  </div>
                  <span className="rp-strength-label" style={{ color: strengthColor }}>{strengthLabel}</span>
                </div>
              )}
              {errors.newPassword && <p className="rp-field-error">{errors.newPassword}</p>}
            </div>

            {/* Confirm password */}
            <div className="rp-field" style={{ marginBottom: "1.5rem" }}>
              <label className="rp-label">تأكيد كلمة المرور</label>
              <div className={`rp-input-wrap${errors.confirmPassword ? " has-error" : ""}`}>
                <LockIcon size={17} cls="rp-input-icon" />
                <input
                  className="rp-input"
                  type={showConfirm ? "text" : "password"}
                  placeholder="أعد إدخال كلمة المرور"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button type="button" className="rp-eye-btn" onClick={() => setShowConfirm(s => !s)}>
                  {showConfirm
                    ? <EyeOff size={16} />
                    : <Eye size={16} />
                  }
                </button>
              </div>
              {errors.confirmPassword && <p className="rp-field-error">{errors.confirmPassword}</p>}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="rp-submit">
              {loading
                ? <><Loader2 size={18} className="rp-spin" /> جاري الحفظ...</>
                : "تغيير كلمة المرور"
              }
            </button>

            {/* Back */}
            <button type="button" className="rp-back-btn" onClick={() => router.push("/")}>
              العودة لصفحة الدخول
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ── Page export ─────────────────────────────────────────────── */
export default function Page() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a2744" }}>
        <Loader2 size={34} color="#c9972a" style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
