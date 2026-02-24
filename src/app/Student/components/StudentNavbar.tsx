"use client";
import React, { useState, useEffect, useRef } from "react";
import "../styles/studentNavbar.css";
import { usePathname } from "next/navigation";
import Link from "next/link";

type NavItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  href: string;
};

/* ── Icons ─────────────────────────────────────────────────── */
const IconHome = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M3 10.5L12 4l9 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 21V11.5h14V21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconActivities = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// const IconUnion = () => (
//   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
//     <path d="M17 21v-2a3 3 0 00-3-3H8a3 3 0 00-3 3v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
//     <circle cx="11" cy="8" r="3" stroke="currentColor" strokeWidth="1.8"/>
//     <path d="M20 8v4M22 10h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
//   </svg>
// );

const IconFamily = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconFamilyManage = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M17 21v-2a3 3 0 00-3-3H8a3 3 0 00-3 3v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="10" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.8"/>
    <circle cx="19.5" cy="17.5" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M19.5 15v-1M19.5 21v-1M17 17.5h-1M23 17.5h-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const IconTakafol = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 21s-7-5.5-7-10A5 5 0 0112 6a5 5 0 017 5c0 4.5-7 10-7 10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

const IconProfile = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M5.5 21v-1.5A6.5 6.5 0 0119 19.5V21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* University emblem SVG — geometric laurel / tower motif */
const UniversityEmblem = () => (
  <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="brand-emblem">
    {/* Base */}
    <rect x="10" y="19" width="8" height="4" rx="1" fill="rgba(255,255,255,0.55)"/>
    {/* Tower body */}
    <rect x="11.5" y="9" width="5" height="11" rx="1" fill="rgba(255,255,255,0.75)"/>
    {/* Battlements */}
    <rect x="11.5" y="7" width="1.8" height="3" rx="0.5" fill="rgba(255,255,255,0.9)"/>
    <rect x="14.7" y="7" width="1.8" height="3" rx="0.5" fill="rgba(255,255,255,0.9)"/>
    {/* Door */}
    <rect x="12.8" y="15" width="2.4" height="5" rx="1" fill="rgba(0,0,0,0.2)"/>
    {/* Left wing */}
    <path d="M11.5 13 L7 15 L7 19 L11.5 19 Z" fill="rgba(255,255,255,0.4)"/>
    {/* Right wing */}
    <path d="M16.5 13 L21 15 L21 19 L16.5 19 Z" fill="rgba(255,255,255,0.4)"/>
    {/* Star / sun at top */}
    <circle cx="14" cy="5.5" r="1.8" fill="rgba(255,255,255,0.95)"/>
  </svg>
);

/* ── Component ──────────────────────────────────────────────── */
const StudentNavbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { key: "home",         label: "الرئيسية",         icon: <IconHome />,         href: "/Student/MainPage"    },
    { key: "activities",   label: "الأنشطة",           icon: <IconActivities />,   href: "/Student/Activities", badge: 3 },
    // { key: "union",     label: "اتحاد الطلبة",      icon: <IconUnion />,        href: "/Student/StudentUnion" },
    { key: "families",     label: "الأسر الطلابية",    icon: <IconFamily />,       href: "/Student/Families"    },
    { key: "familyManage", label: "إدارة الأسر",       icon: <IconFamilyManage />, href: "/Student/manage"      },
    { key: "takafol",      label: "التكافل الاجتماعي", icon: <IconTakafol />,      href: "/Student/takafol"     },
    { key: "profile",      label: "ملفي الشخصي",       icon: <IconProfile />,      href: "/Student/profile"     },
  ];

  const handleLogout = () => {
    localStorage.clear();
    const isProd = process.env.NODE_ENV === "production";
    const end = `path=/; max-age=0; SameSite=Lax${isProd ? "; Secure" : ""}`;
    ["access", "refresh", "user_type", "roleKey", "role"].forEach(k => {
      document.cookie = `${k}=; ${end}`;
    });
    window.location.replace("/");
  };

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!mobileOpen || !menuRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!menuRef.current.contains(e.target)) setMobileOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [mobileOpen]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <header className={`navbar${scrolled ? " scrolled" : ""}`}>
      <div className="navbar-inner container">

        {/* Brand */}
        <Link href="/Student/MainPage" className="brand" aria-label="رعاية الطلاب - الرئيسية">
          <div className="brand-mark">
            <UniversityEmblem />
          </div>
          <div className="brand-text">
            <span className="brand-name">رعاية الطلاب</span>
            <span className="brand-sub">جامعة العاصمة</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="nav" role="navigation" aria-label="قائمة التصفح الرئيسية">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={isActive(item.href) ? "nav-link nav-link-with-icon active-pill" : "nav-link nav-link-with-icon"}
              aria-current={isActive(item.href) ? "page" : undefined}
              title={item.label}
            >
              <span className="nav-icon" aria-hidden>
                {item.icon}
                {item.badge && item.badge > 0 && (
                  <span className="notification-badge" aria-label={`${item.badge} إشعارات`}>
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="nav-actions">
          <button className="logout" onClick={handleLogout} aria-label="تسجيل الخروج">
            <span className="logout-icon" aria-hidden><IconLogout /></span>
            <span className="logout-text">تسجيل خروج</span>
          </button>

          <button
            className={`hamburger${mobileOpen ? " open" : ""}`}
            aria-label={mobileOpen ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={(e) => { e.stopPropagation(); setMobileOpen(s => !s); }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path className="line top"    d="M3 6h18"  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <path className="line middle" d="M3 12h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <path className="line bottom" d="M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        ref={menuRef}
        className={`mobile-menu${mobileOpen ? " open" : ""}`}
        role="menu"
        aria-hidden={!mobileOpen}
      >
        <div className="mobile-menu-inner">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              role="menuitem"
              className={isActive(item.href) ? "mobile-item mobile-item-active" : "mobile-item"}
              onClick={() => setMobileOpen(false)}
            >
              <span className="mobile-icon" aria-hidden>
                {item.icon}
                {item.badge && item.badge > 0 && (
                  <span className="notification-badge-mobile">{item.badge > 9 ? "9+" : item.badge}</span>
                )}
              </span>
              <span className="mobile-label">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default StudentNavbar;