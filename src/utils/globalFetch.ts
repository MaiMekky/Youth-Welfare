import { handleSessionExpired } from "./sessionExpired";
import { clearSession } from "./cookieHelpers";

export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000";
  }
  return "http://localhost:8000";
}

function clearAuthAndRedirect(): void {
  clearSession();

  const tabOpenedAt = Number(sessionStorage.getItem("tabOpenedAt") || 0);
  const secondsSinceOpen = (Date.now() - tabOpenedAt) / 1000;

  if (secondsSinceOpen < 3) {
    window.location.href = "/";
  } else {
    handleSessionExpired();
  }
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const isFormData = options.body instanceof FormData;

  const buildHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {};
    if (!isFormData) headers["Content-Type"] = "application/json";
    if (options.headers) {
      Object.entries(options.headers as Record<string, string>).forEach(([k, v]) => {
        if (k.toLowerCase() !== "authorization") headers[k] = v;
      });
    }
    return headers;
  };

  const res = await fetch(url, {
    ...options,
    headers: buildHeaders(),
    credentials: "include",
  });

  if (res.status === 401 || res.status === 500) {
    let body: { detail?: string } | null = null;
    try { body = await res.clone().json(); } catch { /* ignore */ }

    // Hard auth failure — wrong credentials, not an expired session
    if (body?.detail === "Invalid credentials") return res;

    // Try to refresh the token
    const refreshRes = await fetch(`${getBaseUrl()}/api/auth/token/refresh/`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      const retry = await fetch(url, {
        ...options,
        headers: buildHeaders(),
        credentials: "include",
      });
      if (retry.ok || retry.status !== 401) return retry;
    }

    // Refresh also failed — session is truly expired
    clearAuthAndRedirect();
    throw new Error("Session expired");
  }

  return res;
}