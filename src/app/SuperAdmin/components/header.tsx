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
    // Clear localStorage
    localStorage.clear();

    // Clear all cookies
    const cookies = [
      "access",
      "refresh",
      "user_type",
      "roleKey",
      "role"
    ];

    cookies.forEach(cookie => {
      document.cookie = `${cookie}=; path=/; max-age=0; SameSite=Lax`;
    });

    // Redirect to home
    router.replace("/");
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Brand Section */}
        <div className={styles.brand}>
          <div className={styles.brandText}>
            <h1 className={styles.title}>التكافل الاجتماعي</h1>
            <p className={styles.subtitle}>طلبات الدعم المالي المعتمدة للطلاب</p>
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