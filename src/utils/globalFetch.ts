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

// Prevent concurrent refresh attempts — if one is already in flight, wait for it
let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch(`${getBaseUrl()}/api/auth/token/refresh/`, {
    method: "POST",
    credentials: "include",
  })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => { refreshPromise = null; });

  return refreshPromise;
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

  // Only attempt refresh on 401 (expired token), not on 403 (permission denied) or 500 (server error)
  if (res.status !== 401 && res.status !== 403 && res.status !== 500) return res;

  let body: { detail?: string; code?: string } | null = null;
  try { body = await res.clone().json(); } catch { /* ignore */ }

  // Wrong credentials — not an expired session, return as-is
  if (body?.detail === "Invalid credentials") return res;

  // Token is invalid/expired — try to refresh
  const refreshed = await tryRefresh();

  if (refreshed) {
    // Retry the original request with the new access_token cookie
    return fetch(url, {
      ...options,
      headers: buildHeaders(),
      credentials: "include",
    });
  }

  // Refresh failed — session is truly expired
  clearAuthAndRedirect();
  throw new Error("Session expired");
}