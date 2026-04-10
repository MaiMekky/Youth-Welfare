"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
interface GoogleCallbackHandlerProps {
  onLoginSuccess: (data: Record<string, unknown>) => void;
  onLoginError: (message: string) => void;
}

export default function GoogleCallbackHandler({
  onLoginSuccess,
  onLoginError,
}: GoogleCallbackHandlerProps) {
  const searchParams = useSearchParams();
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    if (processed) return;

    const code = searchParams.get("code");
    const error = searchParams.get("error");

    console.log("🔍 Checking URL params...");
    console.log("Code:", code);
    console.log("Error:", error);

    if (!code && !error) {
      console.log("⏳ No code or error in URL");
      return;
    }

    if (error) {
      console.error("❌ Google error:", error);
      onLoginError(`خطأ من جوجول: ${error}`);
      setProcessed(true);
      return;
    }

    if (code) {
      console.log("✓ Authorization code found:", code);
      setProcessed(true);
      exchangeCodeForToken(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, processed]);

  const exchangeCodeForToken = async (code: string) => {
    try {
      console.log("🔄 Exchanging code for tokens...");

      const res = await authFetch(
        `${getBaseUrl()}/api/accounts/auth/google/login/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        }
      );

      const data = await res.json();

      console.log("📡 Backend response status:", res.status);
      console.log("📡 Backend response:", data);

      if (!res.ok) {
        if (res.status === 404) {
          onLoginError(
            "لا يوجد حساب بهذا البريد. يرجى إنشاء حساب جديد أولاً"
          );
          return;
        }

        onLoginError(data.error || "فشل تسجيل الدخول عبر جوجول");
        return;
      }

      console.log("✅ Login successful!");
      onLoginSuccess(data);
    } catch (error) {
      console.error("❌ Error:", error);
      onLoginError("حدث خطأ أثناء تسجيل الدخول");
    }
  };

  return null;
}