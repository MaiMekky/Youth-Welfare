import { handleSessionExpired } from "./sessionExpired";

export async function authFetch(url: string, options: RequestInit = {}) {
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
    handleSessionExpired();
    throw new Error("Session expired");
  }

  return res;
}