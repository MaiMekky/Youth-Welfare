"use client";
import React, { useState, useEffect } from "react";
import styles from "../Styles/Header.module.css";
import { User, Menu } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onSidebarOpen?: () => void;
}

export default function Header({ onSidebarOpen }: HeaderProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState<{ name?: string; role?: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try { setUserData(JSON.parse(storedUser)); } catch {}
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

        {/* ── RIGHT: sidebar toggle + brand ── */}
        <div className={styles.brand}>

          {/* Gold ☰ — opens sidebar on all screen sizes */}
          {onSidebarOpen && (
            <button
              className={styles.sidebarToggleBtn}
              onClick={onSidebarOpen}
              aria-label="فتح القائمة الجانبية"
            >
              <Menu size={22} />
            </button>
          )}

          <div className={styles.brandText}>
            <h1 className={styles.title}>نظام إدارة رعاية الطلاب</h1>
            <p className={styles.subtitle}>طلبات الدعم المالي والأنشطة المعتمدة للطلاب</p>
          </div>
        </div>

        {/* ── LEFT: profile + logout + mobile hamburger ── */}
        <div className={styles.controls}>

          {/* Profile box */}
          <div className={styles.profileBox}>
            <div className={styles.profileIcon}>
              <User size={20} />
            </div>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{userData?.name || "اسم المستخدم"}</span>
              <span className={styles.profileRole}>{userData?.role || "الدور"}</span>
            </div>
          </div>

          {/* Logout */}
          <button className={styles.logoutBtn} onClick={handleLogout} aria-label="تسجيل الخروج">
            تسجيل خروج
          </button>

          {/* Mobile hamburger — toggles profile/logout dropdown */}
          <button
            className={styles.navHamburger}
            onClick={() => setOpen(!open)}
            aria-label="القائمة"
            aria-expanded={open}
          >
            <span className={`${styles.hamburgerLine} ${open ? styles.lineOpen : ""}`} />
            <span className={`${styles.hamburgerLine} ${open ? styles.lineOpen : ""}`} />
            <span className={`${styles.hamburgerLine} ${open ? styles.lineOpen : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className={styles.mobileDropdown}>
          <div className={styles.dropdownProfile}>
            <User size={18} />
            <div>
              <p className={styles.dropdownName}>{userData?.name || "اسم المستخدم"}</p>
              <p className={styles.dropdownRole}>{userData?.role || "الدور"}</p>
            </div>
          </div>
          <button className={styles.dropdownLogoutBtn} onClick={handleLogout}>
            تسجيل خروج
          </button>
        </div>
      )}
    </header>
  );
}