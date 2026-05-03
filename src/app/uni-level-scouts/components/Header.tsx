"use client";
import Image from "next/image";
import styles from "@/app/uni-level/styles/Header.module.css";
import logo from "../../assets/capital-uni-logo.png";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { getBaseUrl } from "@/utils/globalFetch";

interface HeaderProps {
  onSidebarOpen?: () => void;
}

export default function Header({ onSidebarOpen }: HeaderProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch(`${getBaseUrl()}/api/auth/logout/`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    }

    const wipe = "path=/; max-age=0";
    document.cookie = `user_type=; ${wipe}`;
    document.cookie = `roleKey=; ${wipe}`;
    document.cookie = `session_meta=; ${wipe}`;

    // Set a short-lived cookie so middleware knows this is a logout
    document.cookie = `logging_out=1; path=/; max-age=5`;

    window.location.replace("/");
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>

        {/* RIGHT: sidebar toggle + logo + title */}
        <div className={styles.headerLeft}>
          {onSidebarOpen && (
            <button
              className={styles.sidebarToggleBtn}
              onClick={onSidebarOpen}
              aria-label="فتح القائمة الجانبية"
            >
              <Menu size={22} />
            </button>
          )}
          <div className={styles.headerIcon}>
            <Image
              className={styles.headerLogo}
              src={logo}
              alt="شعار الجامعة"
              width={80}
              height={80}
              style={{ objectFit: "contain", width: "100%", height: "100%" }}
              priority
              draggable={false}
              quality={100}
            />
          </div>
          <div className={styles.headerTitle}>
            <h1 className={styles.headerTitleH1}>إدارة الكشافة</h1>
            <p className={styles.headerTitleP}>جامعة العاصمة - قسم الكشافة والخدمة العامة</p>
          </div>
        </div>

        {/* LEFT: logout button */}
        <div className={styles.headerRight}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            تسجيل خروج
          </button>

          <button
            className={styles.navHamburger}
            onClick={() => setOpen(!open)}
            aria-label="قائمة التنقل"
            aria-expanded={open}
          >
            <span className={`${styles.hamburgerLine} ${open ? styles.open : ""}`} />
            <span className={`${styles.hamburgerLine} ${open ? styles.open : ""}`} />
            <span className={`${styles.hamburgerLine} ${open ? styles.open : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <nav className={styles.mobileNavDropdown}>
          <button className={styles.dropdownLogoutBtn} onClick={handleLogout}>
            تسجيل خروج
          </button>
        </nav>
      )}
    </header>
  );
}
