import axios from "axios";
import { getAccessToken, refreshToken } from "./tokenService";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", 
  withCredentials: true,
});

// Attach access token automatically
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = Bearer `${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// If access token expires → automatically refresh it
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newAccess = await refreshToken();
      if (newAccess) {
        api.defaults.headers.Authorization = Bearer `${newAccess}`;
        originalRequest.headers.Authorization = Bearer `${newAccess}`;
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default api;