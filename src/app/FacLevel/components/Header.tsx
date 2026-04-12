"use client";
import React, { useState, useEffect } from "react";
import styles from "../Styles/Header.module.css";
import Image from "next/image";
import logo from "@/app/assets/capital-uni-logo.png";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";


interface HeaderProps {
  onSidebarOpen?: () => void;
}

// ── Department name groups ────────────────────────────────────
const TKAFOL_NAMES  = new Set(["التكافل الإجتماعي", "التكافل الاجتماعي"]);
const FAMILY_NAMES  = new Set(["الأسر الطلابية"]);
const ACTIVITY_NAMES = new Set([
  "الأنشطة الرياضية",
  "الأنشطة الثقافية",
  "الأنشطة البيئية",
  "الأنشطة الاجتماعية",
  "الأنشطة العلمية",
]);

interface Dept { dept_id: number; dept_name: string; }

function readDepts(): Dept[] {
  try {
    const raw = localStorage.getItem("departments");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export default function Header({ onSidebarOpen }: HeaderProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Dept-based visibility — computed once on mount
  const [showTkafol,   setShowTkafol]   = useState(true);
  const [showFamily,   setShowFamily]   = useState(true);
  const [showActivity, setShowActivity] = useState(true);

  useEffect(() => {
    const depts = readDepts();
    if (!depts.length) return; // no restriction — show all buttons (super_admin / fac_head etc.)

    const names = depts.map((d) => d.dept_name.trim());

    setShowTkafol(names.some((n) => TKAFOL_NAMES.has(n)));
    setShowFamily(names.some((n) => FAMILY_NAMES.has(n)));
    setShowActivity(names.some((n) => ACTIVITY_NAMES.has(n)));
  }, []);

  const handleLogout = () => {
    localStorage.clear();

    ["access","refresh","user_type","roleKey","role"].forEach((k) => {
      document.cookie = `${k}=; path=/; max-age=0`;
    });

    router.replace("/");
  };

  const nav = (path: string) => { router.push(path); setIsMenuOpen(false); };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>

        {/* RIGHT: sidebar toggle + logo + title */}
        <div className={styles.headerLeft}>
          {onSidebarOpen && (
            <button className={styles.sidebarToggleBtn} onClick={onSidebarOpen} aria-label="فتح القائمة الجانبية">
              <Menu size={22} />
            </button>
          )}
          <div className={styles.headerIcon}>
            <Image className={styles.headerLogo} src={logo} alt="شعار جامعة العاصمة" priority draggable={false} />
          </div>
          <div className={styles.headerTitle}>
            <h1 className={styles.headerTitleH1}>إدارة رعاية الطلاب</h1>
            <p className={styles.headerTitleP}>جامعة العاصمة - قسم خدمات الطلاب</p>
          </div>
        </div>

        {/* LEFT: conditional nav buttons */}
        <div className={styles.headerRight}>
          {showTkafol && (
            <button className={styles.navBtn} onClick={() => nav("/FacLevel")}>
              التكافل الاجتماعي
            </button>
          )}
          {showFamily && (
            <button className={styles.navBtn} onClick={() => nav("/Family-Faclevel/events")}>
              الأسر الطلابية
            </button>
          )}
          {showActivity && (
            <button className={styles.navBtn} onClick={() => nav("/Events-Faclevel")}>
              الأنشطة
            </button>
          )}
          <button className={styles.logoutBtn} onClick={handleLogout}>
            تسجيل خروج
          </button>

          <button
            className={styles.navHamburger}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="قائمة التنقل"
            aria-expanded={isMenuOpen}
          >
            <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.open : ""}`} />
            <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.open : ""}`} />
            <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.open : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown — same conditional logic */}
      {isMenuOpen && (
        <nav className={styles.mobileNavDropdown}>
          {showTkafol && (
            <button className={styles.dropdownBtn} onClick={() => nav("/FacLevel")}>
              التكافل الاجتماعي
            </button>
          )}
          {showFamily && (
            <button className={styles.dropdownBtn} onClick={() => nav("/Family-Faclevel/events")}>
              الأسر الطلابية
            </button>
          )}
          {showActivity && (
            <button className={styles.dropdownBtn} onClick={() => nav("/Events-Faclevel")}>
              الأنشطة
            </button>
          )}
          <button className={styles.dropdownLogoutBtn} onClick={handleLogout}>
            تسجيل خروج
          </button>
        </nav>
      )}
    </header>
  );
}