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

  const tabOpenedAt = Number(sessionStorage.getItem("tabOpenedAt") || 0);
  const secondsSinceOpen = (Date.now() - tabOpenedAt) / 1000;

  // clear auth data first
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