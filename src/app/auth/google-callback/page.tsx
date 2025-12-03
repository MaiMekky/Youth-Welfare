"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const errorParam = searchParams.get("error");

        // Handle Google errors
        if (errorParam) {
          setError(`Google error: ${errorParam}`);
          setLoading(false);
          return;
        }

        if (!code) {
          setError("No authorization code received from Google");
          setLoading(false);
          return;
        }

        console.log("✅ Authorization code received:", code);

        // Send code to backend for login
        const loginRes = await fetch("http://localhost:8000/api/auth/google/login/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code })
        });

        const loginData = await loginRes.json();

        if (!loginRes.ok) {
          // Check if account doesn't exist (404)
          if (loginRes.status === 404) {
            console.log("Account doesn't exist, redirecting to signup");
            sessionStorage.setItem("google_code", code);
            sessionStorage.setItem("google_email", loginData.google_email || "");
            router.push("/signup?method=google");
            return;
          }

          setError(loginData.error || "Login failed");
          setLoading(false);
          return;
        }

        console.log("✅ Login successful");

        // Save tokens
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

        // Set cookies
        document.cookie = `access=${loginData.access_token}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `refresh=${loginData.refresh_token}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `user_type=student; path=/; max-age=604800; SameSite=Lax`;

        // Redirect to dashboard
        router.push("/Student");

      } catch (error) {
        console.error("❌ Error:", error);
        setError("An error occurred during login");
        setLoading(false);
      }
    };

    handleGoogleCallback();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f5f5f5"
      }}>
        <div style={{
          textAlign: "center",
          padding: "40px"
        }}>
          <h2>جاري معالجة دخولك...</h2>
          <p>يرجى الانتظار</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ color: "red" }}>خطأ في عملية الدخول</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.href = "/"}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#4285F4",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return null;
}