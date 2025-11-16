// ===============================
// Token Storage
// ===============================

// Save tokens
export const saveTokens = (access, refresh) => {
  if (access) localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
};

// Get Access Token
export const getAccessToken = () => localStorage.getItem("access_token");

// Get Refresh Token
export const getRefreshToken = () => localStorage.getItem("refresh_token");

// Clear tokens
export const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

// ===============================
// Refresh Access Token
// ===============================

export const refreshToken = async () => {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const response = await fetch("http://127.0.0.1:8000/api/auth/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) return null;

    const data = await response.json();

    if (data?.access) {
      localStorage.setItem("access_token", data.access);
      return data.access;
    }

    return null;
  } catch (err) {
    console.error("Refresh error:", err);
    return null;
  }
};
