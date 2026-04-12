import { handleSessionExpired } from "./sessionExpired";
import { toastEvent } from "@/app/context/ToastContext";

/**
 * getBaseUrl()
 *
 * Dev  : reads NEXT_PUBLIC_API_URL = http://localhost:8000
 * Prod : reads NEXT_PUBLIC_API_URL = http://193.227.34.82
 *        (port 80 through Nginx — accessible by all users)
 */
export function getBaseUrl(): string {
  // ── Single source of truth ──
  if (process.env.NEXT_PUBLIC_API_URL) {
    // Remove trailing slash if any
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }

  // ── Fallback for server-side rendering ──
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "")
      || "http://localhost:8000";
  }

  // ── Last resort: dev default ──
  return "http://localhost:8000";
}


export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem("access");
  const isFormData = options.body instanceof FormData;

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (res.status === 401) {
      const tabOpenedAt = Number(sessionStorage.getItem("tabOpenedAt") || 0);
      const secondsSinceOpen = (Date.now() - tabOpenedAt) / 1000;

      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      document.cookie = "access=; path=/; max-age=0";
      document.cookie = "refresh=; path=/; max-age=0";
      document.cookie = "user_type=; path=/; max-age=0";
      document.cookie = "roleKey=; path=/; max-age=0";

      if (secondsSinceOpen < 3) {
        window.location.href = "/";
      } else {
        handleSessionExpired();
      }
      throw new Error("Session expired");
    }

    if (!res.ok) {
      // Map common errors to Arabic
      let errorMessage = "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";

      if (res.status === 400) {
        try {
          const errorData = await res.clone().json();
          if (errorData && typeof errorData === 'object') {
            const fieldMapping: Record<string, string> = {
              name: "الاسم",
              email: "البريد الإلكتروني",
              phone_number: "رقم الهاتف",
              address: "العنوان",
              faculty: "الكلية",
              dept: "القسم",
              title: "العنوان",
              description: "الوصف",
              st_date: "تاريخ البداية",
              end_date: "تاريخ النهاية",
              cost: "التكلفة",
              location: "المكان",
              s_limit: "الحد الأقصى",
              password: "كلمة المرور",
              nid: "الرقم القومي",
              uid: "رقم الجامعة",
            };

            // Try to extract a friendly error message from the object
            const firstKey = Object.keys(errorData)[0];
            const firstError = errorData[firstKey];
            const friendlyKey = fieldMapping[firstKey] || firstKey;

            if (Array.isArray(firstError)) {
              errorMessage = `خطأ في ${friendlyKey}: ${firstError[0]}`;
            } else if (typeof firstError === 'string') {
              errorMessage = friendlyKey !== firstKey ? `${friendlyKey}: ${firstError}` : firstError;
            } else if (errorData.detail) {
              errorMessage = errorData.detail;
            } else if (errorData.message) {
              errorMessage = errorData.message;
            } else {
              errorMessage = "البيانات المرسلة غير صحيحة. يرجى التحقق.";
            }
          } else {
            errorMessage = "البيانات المرسلة غير صحيحة. يرجى التحقق.";
          }
        } catch {
          errorMessage = "البيانات المرسلة غير صحيحة. يرجى التحقق.";
        }
      } else if (res.status === 403) {
        errorMessage = "ليس لديك صلاحية للقيام بهذا الإجراء.";
      } else if (res.status === 404) {
        errorMessage = "المورد المطلوب غير موجود.";
      } else if (res.status >= 500) {
        errorMessage = "خطأ في السيرفر الداخلي. يرجى التواصل مع الدعم.";
      }

      toastEvent.emit(errorMessage, "error");
    }

    return res;
  } catch (error) {
    if (error instanceof Error && error.message === "Session expired") throw error;

    toastEvent.emit("فشل الاتصال بالسيرفر. يرجى التأكد من اتصال الإنترنت.", "error");
    throw error;
  }
}