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

/**
 * Attempts to refresh the access token using the refresh token
 * Returns the new access token if successful, null if refresh fails
 */
async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = localStorage.getItem("refresh");
    if (!refreshToken) {
      console.warn("No refresh token available");
      return null;
    }

    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/auth/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      console.error("Token refresh failed:", response.status);
      return null;
    }

    const data = await response.json();
    const newAccessToken = data.access;

    if (newAccessToken) {
      localStorage.setItem("access", newAccessToken);
      return newAccessToken;
    }

    return null;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
}

/**
 * Clears all authentication tokens and redirects to login
 */
function clearAuthAndRedirect(): void {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");

  document.cookie = "access=; path=/; max-age=0";
  document.cookie = "refresh=; path=/; max-age=0";
  document.cookie = "user_type=; path=/; max-age=0";
  document.cookie = "roleKey=; path=/; max-age=0";

  const tabOpenedAt = Number(sessionStorage.getItem("tabOpenedAt") || 0);
  const secondsSinceOpen = (Date.now() - tabOpenedAt) / 1000;

  if (secondsSinceOpen < 3) {
    window.location.href = "/";
  } else {
    handleSessionExpired();
  }
}

export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {

  const token = localStorage.getItem("access");
  const isFormData = options.body instanceof FormData;

  // Build headers for initial request
  const buildHeaders = (authToken: string | null) => {
    const headers: Record<string, string> = {};
    
    // Add Content-Type if not FormData
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }
    
    // Add custom headers from options (excluding Authorization)
    if (options.headers) {
      const optionsHeaders = options.headers as Record<string, string>;
      Object.entries(optionsHeaders).forEach(([key, value]) => {
        if (key.toLowerCase() !== "authorization") {
          headers[key] = value;
        }
      });
    }
    
    // Add Authorization header with the provided token
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }
    
    return headers;
  };

  const res = await fetch(url, {
    ...options,
    headers: buildHeaders(token),
  });

  // ✅ Handle 401 Unauthorized and 500 Internal Server Error (might be expired token)
  if (res.status === 401 || res.status === 500) {
    let data: { detail?: string } | null = null;

    try {
      data = await res.clone().json();
    } catch {
      // ignore if no JSON
    }

    // ❌ Case 1: Wrong login credentials (DO NOT refresh) - only for 401
    if (res.status === 401 && data?.detail === "Invalid credentials") {
      console.log("Invalid credentials - not attempting refresh");
      return res; // let login page handle it
    }

    // ✅ Case 2: Token expired (401 or 500) - attempt refresh
    console.log(`${res.status} error - attempting token refresh...`);
    const newAccessToken = await refreshAccessToken();
    console.log("Refresh result:", newAccessToken ? "SUCCESS" : "FAILED");

    if (newAccessToken) {
      // Retry the original request with the new token
      console.log("Retrying original request with new token...");
      const retryRes = await fetch(url, {
        ...options,
        headers: buildHeaders(newAccessToken),
      });

      console.log("Retry response status:", retryRes.status);

      // If retry succeeds, return it
      if (retryRes.ok) {
        console.log("Retry succeeded!");
        return retryRes;
      }

      // If retry fails with 401, clear auth and redirect
      if (retryRes.status === 401) {
        console.error("Retry request failed with 401");
        clearAuthAndRedirect();
        throw new Error("Session expired - refresh failed");
      }

      // If retry fails with 500 or other error, return the response (real server error)
      console.warn(`Retry returned ${retryRes.status} - returning response`);
      return retryRes;
    }

    // Refresh failed - clear auth and redirect
    console.error("Token refresh failed");
    clearAuthAndRedirect();
    throw new Error("Session expired - refresh failed");
  }

  return res;
}