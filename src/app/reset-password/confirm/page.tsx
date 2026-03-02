"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle, XCircle, Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Main form (needs Suspense because of useSearchParams) ────
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
      const res = await fetch(`${API_BASE}/api/auth/password-reset/confirm/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          token,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setStatusMsg(
          data.detail || data.error || data.message ||
          "فشل تغيير كلمة المرور. قد يكون الرابط منتهي الصلاحية، يرجى طلب رابط جديد."
        );
      } else {
        setStatus("success");
        setStatusMsg("تم تغيير كلمة المرور بنجاح! جاري تحويلك...");
        setTimeout(() => router.push("/"), 2500);
      }
    } catch {
      setStatus("error");
      setStatusMsg("حدث خطأ في الاتصال. تأكد من الاتصال بالإنترنت وحاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  // Password strength
  const strength = (() => {
    if (!newPassword) return 0;
    let s = 0;
    if (newPassword.length >= 6)          s++;
    if (newPassword.length >= 10)         s++;
    if (/[A-Z]/.test(newPassword))        s++;
    if (/[0-9]/.test(newPassword))        s++;
    if (/[^A-Za-z0-9]/.test(newPassword)) s++;
    return s;
  })();
  const strengthLabel = ["", "ضعيفة جداً", "ضعيفة", "متوسطة", "قوية", "قوية جداً"][strength];
  const strengthColor = ["", "#ef4444",    "#f97316", "#eab308", "#22c55e", "#16a34a"][strength];

  return (
    <div style={pageStyle} dir="rtl">
      {/* Blobs */}
      <div style={{ position:"fixed", top:"-10%", right:"-5%", width:"400px", height:"400px", borderRadius:"50%", background:"rgba(167,139,250,0.15)", filter:"blur(80px)", pointerEvents:"none" }} />
      <div style={{ position:"fixed", bottom:"-10%", left:"-5%", width:"350px", height:"350px", borderRadius:"50%", background:"rgba(99,102,241,0.2)", filter:"blur(80px)", pointerEvents:"none" }} />

      <div style={cardStyle}>
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:"2rem" }}>
          <div style={{ width:"64px", height:"64px", borderRadius:"16px", background:"linear-gradient(135deg,#818cf8,#a78bfa)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1rem", boxShadow:"0 8px 24px rgba(129,140,248,0.4)" }}>
            <Lock size={28} color="#fff" />
          </div>
          <h1 style={{ color:"#fff", fontSize:"1.5rem", fontWeight:700, margin:0 }}>إعادة تعيين كلمة المرور</h1>
          <p style={{ color:"rgba(255,255,255,0.5)", marginTop:"0.4rem", fontSize:"0.875rem" }}>الإدارة العامة لرعاية الشباب</p>
        </div>

        {/* Invalid link */}
        {invalidLink && (
          <div style={alertBox("#ef4444")}>
            <XCircle size={40} color="#ef4444" style={{ margin:"0 auto 0.75rem", display:"block" }} />
            <p style={{ color:"#fca5a5", fontWeight:600, margin:"0 0 0.5rem", textAlign:"center" }}>رابط غير صالح</p>
            <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.85rem", margin:"0 0 1.25rem", textAlign:"center" }}>
              يرجى طلب رابط إعادة تعيين جديد من صفحة تسجيل الدخول.
            </p>
            <button onClick={() => router.push("/")} style={btnStyle}>العودة للرئيسية</button>
          </div>
        )}

        {/* Success */}
        {!invalidLink && status === "success" && (
          <div style={alertBox("#22c55e")}>
            <CheckCircle size={48} color="#22c55e" style={{ margin:"0 auto 0.75rem", display:"block" }} />
            <p style={{ color:"#86efac", fontWeight:700, fontSize:"1.1rem", margin:"0 0 0.5rem", textAlign:"center" }}>تم بنجاح! 🎉</p>
            <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"0.9rem", margin:0, textAlign:"center" }}>{statusMsg}</p>
          </div>
        )}

        {/* Error banner */}
        {!invalidLink && status === "error" && (
          <div style={{ background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:"12px", padding:"1rem", marginBottom:"1.25rem", display:"flex", gap:"0.5rem", alignItems:"flex-start" }}>
            <XCircle size={18} color="#ef4444" style={{ flexShrink:0, marginTop:"2px" }} />
            <p style={{ color:"#fca5a5", margin:0, fontSize:"0.875rem" }}>{statusMsg}</p>
          </div>
        )}

        {/* Form */}
        {!invalidLink && status !== "success" && (
          <form onSubmit={handleSubmit}>
            {/* New password */}
            <div style={{ marginBottom:"1rem" }}>
              <label style={labelStyle}>كلمة المرور الجديدة</label>
              <div style={inputWrap(!!errors.newPassword)}>
                <Lock size={17} color="rgba(255,255,255,0.4)" style={{ flexShrink:0 }} />
                <input
                  type={showNew ? "text" : "password"}
                  placeholder="أدخل كلمة مرور قوية"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  style={inputStyle}
                  autoFocus
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} style={eyeBtn}>
                  {showNew ? <EyeOff size={16} color="rgba(255,255,255,0.4)" /> : <Eye size={16} color="rgba(255,255,255,0.4)" />}
                </button>
              </div>
              {newPassword && (
                <div style={{ marginTop:"6px" }}>
                  <div style={{ display:"flex", gap:"4px", marginBottom:"3px" }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{ flex:1, height:"4px", borderRadius:"99px", background: i <= strength ? strengthColor : "rgba(255,255,255,0.1)", transition:"background 0.3s" }} />
                    ))}
                  </div>
                  <span style={{ fontSize:"0.75rem", color:strengthColor }}>{strengthLabel}</span>
                </div>
              )}
              {errors.newPassword && <p style={errStyle}>{errors.newPassword}</p>}
            </div>

            {/* Confirm password */}
            <div style={{ marginBottom:"1.5rem" }}>
              <label style={labelStyle}>تأكيد كلمة المرور</label>
              <div style={inputWrap(!!errors.confirmPassword)}>
                <Lock size={17} color="rgba(255,255,255,0.4)" style={{ flexShrink:0 }} />
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="أعد إدخال كلمة المرور"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={inputStyle}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={eyeBtn}>
                  {showConfirm ? <EyeOff size={16} color="rgba(255,255,255,0.4)" /> : <Eye size={16} color="rgba(255,255,255,0.4)" />}
                </button>
              </div>
              {errors.confirmPassword && <p style={errStyle}>{errors.confirmPassword}</p>}
            </div>

            <button type="submit" disabled={loading} style={{ ...btnStyle, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading
                ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}>
                    <Loader2 size={18} style={{ animation:"spin 1s linear infinite" }} />
                    جاري الحفظ...
                  </span>
                : "تغيير كلمة المرور"
              }
            </button>
          </form>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.3) !important; }
        input { color: white !important; }
      `}</style>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────
const pageStyle: React.CSSProperties = {
  minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
  background:"linear-gradient(135deg,#1e1b4b 0%,#312e81 40%,#4c1d95 100%)",
  fontFamily:"'Tajawal','Cairo',sans-serif", padding:"1rem",
};
const cardStyle: React.CSSProperties = {
  background:"rgba(255,255,255,0.05)", backdropFilter:"blur(20px)",
  border:"1px solid rgba(255,255,255,0.12)", borderRadius:"24px",
  padding:"2.5rem", width:"100%", maxWidth:"460px",
  boxShadow:"0 25px 50px rgba(0,0,0,0.4)",
};
const alertBox = (color: string): React.CSSProperties => ({
  background:`${color}26`, border:`1px solid ${color}4d`, borderRadius:"12px", padding:"1.5rem",
});
const labelStyle: React.CSSProperties = {
  display:"block", color:"rgba(255,255,255,0.7)", fontSize:"0.85rem", fontWeight:500, marginBottom:"6px",
};
const inputWrap = (hasError: boolean): React.CSSProperties => ({
  display:"flex", alignItems:"center", gap:"10px",
  background:"rgba(255,255,255,0.07)",
  border:`1px solid ${hasError ? "#ef4444" : "rgba(255,255,255,0.12)"}`,
  borderRadius:"12px", padding:"0 14px", height:"50px",
});
const inputStyle: React.CSSProperties = {
  flex:1, background:"transparent", border:"none", outline:"none",
  color:"#fff", fontSize:"0.95rem", direction:"rtl",
};
const eyeBtn: React.CSSProperties = {
  background:"none", border:"none", cursor:"pointer", padding:"2px", display:"flex",
};
const errStyle: React.CSSProperties = {
  color:"#f87171", fontSize:"0.78rem", margin:"4px 0 0",
};
const btnStyle: React.CSSProperties = {
  width:"100%", padding:"14px", marginTop:"0.5rem",
  background:"linear-gradient(135deg,#818cf8,#a78bfa)",
  border:"none", borderRadius:"12px", color:"#fff",
  fontSize:"1rem", fontWeight:700,
  boxShadow:"0 8px 20px rgba(129,140,248,0.35)",
};

// ── Page export — Suspense مطلوب لـ useSearchParams في App Router ──
export default function Page() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#1e1b4b" }}>
        <Loader2 size={32} color="#818cf8" style={{ animation:"spin 1s linear infinite" }} />
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}