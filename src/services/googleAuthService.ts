// This file handles all API communication with your Django backend

const API_BASE = "http://localhost:8000";

export const googleAuthService = {
  // Function to send Google auth code to backend
  async loginWithGoogle(code: string) {
    console.log("🔄 Sending auth code to backend:", code.substring(0, 20) + "...");
    
    try {
      const response = await fetch(`${API_BASE}/api/auth/google/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ Backend error:", data);
        throw new Error(data.error || "Google login failed");
      }

      console.log("✅ Backend returned tokens:", data);
      return data; // Returns: access_token, refresh_token, user_id, name, etc.
    } catch (error) {
      console.error("❌ Network or parsing error:", error);
      throw error;
    }
  },

  // Function to save auth data to browser storage
  saveAuthData(data: any) {
    console.log("💾 Saving auth data to localStorage");
    
    localStorage.setItem("access", data.access_token);
    localStorage.setItem("refresh", data.refresh_token);
    localStorage.setItem("student_id", data.user_id);
    localStorage.setItem("name", data.name);
    localStorage.setItem("email", data.email);
    
    // Also save as cookie
    document.cookie = `access=${data.access_token}; path=/; max-age=604800`;
    document.cookie = `refresh=${data.refresh_token}; path=/; max-age=604800`;
  },
};