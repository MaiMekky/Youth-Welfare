"use client";
import React, { useState, useEffect } from "react";
import styles from "../Styles/Header.module.css";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [userData, setUserData] = useState<{
    name?: string;
    role?: string;
  } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

   const handleLogout = () => {
 
  localStorage.clear();

  const isProd = process.env.NODE_ENV === "production";
  const cookieEnd = `path=/; max-age=0; SameSite=Lax${isProd ? "; Secure" : ""}`;
 
  document.cookie = `access=; ${cookieEnd}`;
  document.cookie = `refresh=; ${cookieEnd}`;
  document.cookie = `user_type=; ${cookieEnd}`;
  document.cookie = `roleKey=; ${cookieEnd}`;
  document.cookie = `role=; ${cookieEnd}`;

  window.location.replace("/");
};


  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Brand Section */}
        <div className={styles.brand}>
          <div className={styles.brandText}>
            <h1 className={styles.title}>نظام ادارة رعاية الطلاب</h1>
            <p className={styles.subtitle}>طلبات الدعم المالي و الانشطة المعتمدة للطلاب</p>
          </div>
        </div>

        {/* Profile Box */}
        <div className={styles.profileBox}>
          <div className={styles.profileIcon}>
            <User size={20} />
          </div>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>
              {userData?.name || "اسم المستخدم"}
            </span>
            <span className={styles.profileRole}>
              {userData?.role || "الدور"}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          className={styles.logoutBtn}
          onClick={handleLogout}
          aria-label="تسجيل الخروج"
        >
          تسجيل خروج
        </button>
      </div>
    </header>
  );
}