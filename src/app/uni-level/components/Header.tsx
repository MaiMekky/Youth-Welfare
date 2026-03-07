"use client";
import Image from "next/image";
import styles from "../styles/Header.module.css";
import logo from "@/utils/logo.png";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";

interface HeaderProps {
  onSidebarOpen?: () => void;
}

const TKAFOL_NAMES   = new Set(["التكافل الإجتماعي", "التكافل الاجتماعي"]);
const FAMILY_NAMES   = new Set(["الأسر الطلابية"]);
const ACTIVITY_NAMES = new Set([
  "الأنشطة الرياضية",
  "الأنشطة الثقافية",
  "الأنشطة البيئية",
  "الأنشطة الاجتماعية",
  "الأنشطة العلمية",
]);

interface Dept { dept_id: number; dept_name: string; }

function readDepts(): Dept[] | null {
  try {
    const raw = localStorage.getItem("departments");
    if (!raw) return null;            // key doesn't exist → unrestricted role
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch { return null; }
}

export default function Header({ onSidebarOpen }: HeaderProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Start all as FALSE — only flip to true once we know the user can see them
  const [showTkafol,   setShowTkafol]   = useState(false);
  const [showFamily,   setShowFamily]   = useState(false);
  const [showActivity, setShowActivity] = useState(false);

  useEffect(() => {
    const depts = readDepts();

    if (depts === null) {
      // No departments key in storage → unrestricted role (super_admin, fac_head, etc.)
      // Show all buttons
      setShowTkafol(true);
      setShowFamily(true);
      setShowActivity(true);
      return;
    }

    // Departments key exists → restricted role: only show what's in the list
    const names = depts.map((d) => d.dept_name.trim());
    setShowTkafol(names.some((n) => TKAFOL_NAMES.has(n)));
    setShowFamily(names.some((n) => FAMILY_NAMES.has(n)));
    setShowActivity(names.some((n) => ACTIVITY_NAMES.has(n)));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    const isProd = process.env.NODE_ENV === "production";
    const cookieEnd = `path=/; max-age=0; SameSite=Lax${isProd ? "; Secure" : ""}`;
    ["access", "refresh", "user_type", "roleKey", "role"].forEach(
      (k) => (document.cookie = `${k}=; ${cookieEnd}`)
    );
    window.location.replace("/");
  };

  const nav = (path: string) => { router.push(path); setOpen(false); };

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
            <Image className={styles.headerLogo} src={logo} alt="شعار الجامعة" priority />
          </div>
          <div className={styles.headerTitle}>
            <h1 className={styles.headerTitleH1}>النظام الإداري</h1>
            <p className={styles.headerTitleP}>إدارة رعاية الطلاب</p>
          </div>
        </div>

        {/* LEFT: conditional nav buttons */}
        <div className={styles.headerRight}>
          {showTkafol && (
            <button className={styles.navBtn} onClick={() => nav("/uni-level")}>
              التكافل الاجتماعي
            </button>
          )}
          {showFamily && (
            <button className={styles.navBtn} onClick={() => nav("/uni-level-family")}>
              الأسر الطلابية
            </button>
          )}
          {showActivity && (
            <button className={styles.navBtn} onClick={() => nav("/uni-level-activities")}>
              الأنشطة
            </button>
          )}
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
          {showTkafol && (
            <button className={styles.dropdownBtn} onClick={() => nav("/uni-level")}>
              التكافل الاجتماعي
            </button>
          )}
          {showFamily && (
            <button className={styles.dropdownBtn} onClick={() => nav("/uni-level-family")}>
              الأسر الطلابية
            </button>
          )}
          {showActivity && (
            <button className={styles.dropdownBtn} onClick={() => nav("/uni-level-activities")}>
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