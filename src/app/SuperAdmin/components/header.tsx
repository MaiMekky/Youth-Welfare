"use client";
import React, { useState, useEffect } from "react";
import styles from "../Styles/Header.module.css";
import { Menu, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const router = useRouter();

  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

const handleLogout = () => {
  localStorage.clear();
  document.cookie = "access=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "refresh=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "user_type=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "roleKey=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "role=; path=/; max-age=0; SameSite=Lax";
  router.replace("/"); 
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <button className={styles.mobileToggle} onClick={toggleSidebar}>
          <Menu size={24} />
        </button>

        <div className={styles.brand}>
          <div className={styles.brandText}>
            <h1 className={styles.title}>التكافل الاجتماعي</h1>
            <p className={styles.subtitle}>طلبات الدعم المالي المعتمدة للطلاب</p>
          </div>
        </div>

        {/* بروفايل السوبر أدمن */}
        <div className={styles.profileBox}>
          <div className={styles.profileIcon}>
            <User size={32} />
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

        {/* زر تسجيل الخروج */}
        <button className={styles.logoutBtn} onClick={handleLogout}>
          تسجيل خروج
        </button>
      </div>
    </header>
  );
}
