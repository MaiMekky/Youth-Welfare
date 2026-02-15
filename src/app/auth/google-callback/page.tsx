"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function GoogleCallbackPage() {
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

        const loginRes = await fetch("http://localhost:8000/api/auth/google/login/", {
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
        
        localStorage.setItem("access", loginData.access_token);
        localStorage.setItem("refresh", loginData.refresh_token);
        localStorage.setItem("user", JSON.stringify({
          name: loginData.name,
          email: loginData.email,
          picture: loginData.picture,
          user_type: "student"
        }));
        localStorage.setItem("student_id", loginData.user_id.toString());
        localStorage.setItem("name", loginData.name);

        document.cookie = `access=${loginData.access_token}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `refresh=${loginData.refresh_token}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `user_type=student; path=/; max-age=604800; SameSite=Lax`;

        // Redirect to dashboard
        setTimeout(() => router.push("/Student"), 1500);

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