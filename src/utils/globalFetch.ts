import { handleSessionExpired } from "./sessionExpired";

export async function authFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("access");

  const res = await fetch(`${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (res.status === 401) {
    handleSessionExpired();
    throw new Error("Session expired");
  }

  return res;
}