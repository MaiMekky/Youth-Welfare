/**
 * globalFetch.ts
 *
 * - Silent token refresh on 401 (one refresh call for concurrent requests)
 * - Request deduplication (same URL in-flight = share the result, not fire twice)
 */

// ── Base URL ──────────────────────────────────────────────────────────────────
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000";
  }
  return "http://localhost:8000";
}

// ── Refresh lock ──────────────────────────────────────────────────────────────
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async (): Promise<string | null> => {
    try {
      const refreshToken = localStorage.getItem("refresh");
      if (!refreshToken) return null;

      const res = await fetch(`${getBaseUrl()}/api/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!res.ok) return null;

      const data = await res.json();
      const newAccess: string | undefined = data.access;
      if (!newAccess) return null;

      localStorage.setItem("access", newAccess);
      document.cookie = `access=${newAccess}; path=/; max-age=604800; SameSite=Lax`;

      return newAccess;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ── In-flight request deduplication ──────────────────────────────────────────
// Key: url  →  Value: promise that resolves to a cloneable Response
const inflightRequests = new Map<string, Promise<Response>>();

// ── Full logout ───────────────────────────────────────────────────────────────
function handleFullLogout(): void {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("role");
  localStorage.removeItem("name");
  localStorage.removeItem("user");
  localStorage.removeItem("departments");
  localStorage.removeItem("dept_ids");
  localStorage.removeItem("admin_id");
  localStorage.removeItem("student_id");
  localStorage.removeItem("lastRoute");

  document.cookie = "access=; path=/; max-age=0";
  document.cookie = "refresh=; path=/; max-age=0";
  document.cookie = "user_type=; path=/; max-age=0";
  document.cookie = "roleKey=; path=/; max-age=0";

  window.location.href = "/";
}

// ── Build headers ─────────────────────────────────────────────────────────────
function buildHeaders(options: RequestInit, token: string | null): HeadersInit {
  const isFormData = options.body instanceof FormData;
  return {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── Core fetch logic (no deduplication — used internally after dedup check) ───
async function _doFetch(url: string, options: RequestInit): Promise<Response> {
  // 1. First attempt
  const token = localStorage.getItem("access");
  let res = await fetch(url, { ...options, headers: buildHeaders(options, token) });

  if (res.status !== 401) return res;

  // 2. Peek at detail to whitelist login errors
  let detail: string | undefined;
  try {
    detail = (await res.clone().json())?.detail;
  } catch { /* not JSON */ }

  if (detail === "Invalid credentials") return res;

  // 3. Silent refresh
  const newToken = await refreshAccessToken();
  if (!newToken) {
    handleFullLogout();
    throw new Error("Session expired");
  }

  // 4. Replay with new token
  res = await fetch(url, { ...options, headers: buildHeaders(options, newToken) });

  if (res.status === 401) {
    handleFullLogout();
    throw new Error("Session expired");
  }

  return res;
}

// ── authFetch — public API ────────────────────────────────────────────────────
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Only deduplicate GET requests — POST/PUT/DELETE must always fire
  const method = (options.method ?? "GET").toUpperCase();
  const isReadOnly = method === "GET";

  if (!isReadOnly) {
    // Mutating requests always go through directly
    return _doFetch(url, options);
  }

  // For GET: if the same URL is already in-flight, share its result
  if (inflightRequests.has(url)) {
    // Clone the response so each caller gets its own readable body stream
    const shared = await inflightRequests.get(url)!;
    return shared.clone();
  }

  // First caller for this URL — run the request and cache the promise
  const promise = _doFetch(url, options).finally(() => {
    inflightRequests.delete(url);
  });

  inflightRequests.set(url, promise);

  const res = await promise;
  // Return a clone so the cached response body stays unconsumed for others
  return res.clone();
}