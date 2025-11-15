import api from "./api";
import { saveTokens } from "./tokenService";

export const loginUser = async (email, password) => {
  try {
    const res = await api.post("/login/", {
      email,
      password,
    });

    const { access, refresh, role } = res.data;

    // Save tokens
    saveTokens(access, refresh);

    return { success: true, role };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Login failed",
    };
  }
};

export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};