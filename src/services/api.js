import axios from "axios";
import { getAccessToken, refreshToken, clearTokens } from "./tokenService";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  withCredentials: true,
});

// Attach access token automatically, but skip login/refresh
api.interceptors.request.use(
  (config) => {
    if (!config.url.includes("/auth/login/") && !config.url.includes("/auth/refresh/")) {
      const token = getAccessToken();
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/login/") &&
      !originalRequest.url.includes("/auth/refresh/")
    ) {
      originalRequest._retry = true;
      const newAccess = await refreshToken();

      if (newAccess) {
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest); // retry original request
      } else {
        clearTokens();
        window.location.href = "/login"; // redirect to login
      }
    }

    return Promise.reject(error);
  }
);

export default api;
