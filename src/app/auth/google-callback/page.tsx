"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"info" | "error" | "success">("info");

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const errorParam = searchParams.get("error");

        if (errorParam) {
          setMessageType("error");
          setMessage("❌ حدث خطأ: " + errorParam);
          setTimeout(() => router.push("/"), 2000);
          return;
        }

        if (!code) {
          setMessageType("error");
          setMessage("❌ لم يتم استلام كود التحقق");
          setTimeout(() => router.push("/"), 2000);
          return;
        }

        const loginRes = await authFetch(`${getBaseUrl()}/api/auth/google/login/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code })
        });

        const loginData = await loginRes.json();

        if (!loginRes.ok) {
          if (loginRes.status === 404) {
            // ✅ Email not registered - show message and redirect
            setMessageType("info");
            setMessage("⚠️ هذا البريد غير مسجل في النظام. سيتم تحويلك للصفحة الرئيسية");
            
            // Clear any stored data
            sessionStorage.removeItem("google_code");
            sessionStorage.removeItem("google_email");
            
            // Redirect to home after 2 seconds
            setTimeout(() => router.push("/"), 3000);
            return;
          }

          setMessageType("error");
          setMessage("❌ فشل تسجيل الدخول: " + (loginData.error || "حاول مرة أخرى"));
          setTimeout(() => router.push("/"), 2000);
          return;
        }

        // ✅ Success - login user
        setMessageType("success");
        setMessage("✅ تم تسجيل الدخول بنجاح");
        
        const data = loginData as Record<string, unknown>;

        // Store session data in cookies (same pattern as normal login)
        const sessionData = {
          user_type:    "student",
          roleKey:      "",
          role:         "",
          name:         String(data.name ?? ""),
          faculty_name: "",
          admin_id:     null,
          student_id:   data.user_id ?? null,
          departments:  [],
          dept_ids:     [],
        };

        const cookieOpts = "path=/; max-age=604800; SameSite=Lax";
        document.cookie = `user_type=student; ${cookieOpts}`;
        document.cookie = `roleKey=; ${cookieOpts}`;
        document.cookie = `session_meta=${encodeURIComponent(JSON.stringify(sessionData))}; ${cookieOpts}`;

        // Redirect to dashboard
        window.location.href = "/Student";

      } catch (error) {
        console.error("Error:", error);
        setMessageType("error");
        setMessage("❌ حدث خطأ تقني");
        setTimeout(() => router.push("/"), 2000);
      }
    };

    handleGoogleCallback();
  }, [searchParams, router]);

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#f5f5f5",
      flexDirection: "column",
      gap: "20px"
    }}>
      <div style={{
        textAlign: "center",
        padding: "40px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        maxWidth: "400px"
      }}>
        <div style={{
          fontSize: "48px",
          marginBottom: "15px"
        }}>
          {messageType === "success" ? "✅" : messageType === "error" ? "❌" : "⏳"}
        </div>

        <h2 style={{
          color: messageType === "success" ? "#22c55e" : messageType === "error" ? "#dc2626" : "#2563eb",
          margin: "0 0 10px",
          fontSize: "18px"
        }}>
          {messageType === "success" 
            ? "نجاح" 
            : messageType === "error" 
            ? "خطأ" 
            : "جاري المعالجة"}
        </h2>

        <p style={{
          color: "#666",
          fontSize: "15px",
          margin: "0 0 15px",
          lineHeight: "1.6"
        }}>
          {message}
        </p>

        <p style={{
          color: "#999",
          fontSize: "12px",
          margin: 0
        }}>
          سيتم تحويلك تلقائياً...
        </p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f5f5f5"
      }}>
        <div style={{
          textAlign: "center",
          padding: "40px",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "15px" }}>⏳</div>
          <p style={{ color: "#666" }}>جاري المعالجة...</p>
        </div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}