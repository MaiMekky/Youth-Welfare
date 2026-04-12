"use client";
import React, { useState, useEffect } from "react";
import styles from "../Styles/Header.module.css";
import { User, Menu } from "lucide-react";
import Image from "next/image";
import logo from "../../assets/capital-uni-logo.png";

interface HeaderProps {
  onSidebarOpen?: () => void;
}

export default function Header({ onSidebarOpen }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState<{ name?: string; role?: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try { setUserData(JSON.parse(storedUser)); } catch {}
    }
  }, []);

const handleLogout = async () => {
  localStorage.clear();

  try {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include", // ← ensures cookies are sent/received
    });
  } catch (err) {
    console.error("Logout API failed:", err);
  }

  // Use ?logout=1 to bypass the middleware auto-redirect
  window.location.replace("/?logout=1");
};

  return (
    <header className={styles.header}>
      <div className={styles.inner}>

        {/* ── RIGHT: sidebar toggle + logo + brand text ── */}
        <div className={styles.brand}>
          {onSidebarOpen && (
            <button
              className={styles.sidebarToggleBtn}
              onClick={onSidebarOpen}
              aria-label="فتح القائمة الجانبية"
            >
              <Menu size={22} />
            </button>
          )}

          {/* Transparent logo — same style as student navbar */}
          <div className={styles.logoWrap}>
            <Image
              src={logo}
              alt="شعار جامعة العاصمة"
              width={80}
              height={80}
              className={styles.logoImg}
              style={{ objectFit: "contain", width: "100%", height: "100%" }}
              priority
              draggable={false}
              quality={90}
            />
          </div>

          <div className={styles.brandDivider} aria-hidden />

          <div className={styles.brandText}>
            <h1 className={styles.title}>نظام إدارة رعاية الطلاب</h1>
            <p className={styles.subtitle}>طلبات الدعم المالي والأنشطة المعتمدة للطلاب</p>
          </div>
        </div>

        {/* ── LEFT: profile + logout + mobile hamburger ── */}
        <div className={styles.controls}>
          <div className={styles.profileBox}>
            <div className={styles.profileIcon}>
              <User size={20} />
            </div>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{userData?.name || "اسم المستخدم"}</span>
              <span className={styles.profileRole}>{userData?.role || "الدور"}</span>
            </div>
          </div>

          <button className={styles.logoutBtn} onClick={handleLogout} aria-label="تسجيل الخروج">
            تسجيل خروج
          </button>

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