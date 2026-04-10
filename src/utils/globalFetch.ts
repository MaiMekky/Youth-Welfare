import { handleSessionExpired } from "./sessionExpired";

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

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401) {
    const tabOpenedAt      = Number(sessionStorage.getItem("tabOpenedAt") || 0);
    const secondsSinceOpen = (Date.now() - tabOpenedAt) / 1000;

    // Clear all auth data
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

  return res;
}