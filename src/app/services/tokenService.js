// Save tokens
export const saveTokens = (access, refresh) => {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
};

// Get access token
export const getAccessToken = () => {
  return localStorage.getItem("access_token");
};

// Get refresh token
export const getRefreshToken = () => {
  return localStorage.getItem("refresh_token");
};

// Refresh token API
export const refreshToken = async () => {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const res = await fetch("http://127.0.0.1:8000/api/login/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    const data = await res.json();

    if (data?.access) {
      localStorage.setItem("access_token", data.access);
      return data.access;
    }

    return null;
  } catch (err) {
    return null;
  }
};