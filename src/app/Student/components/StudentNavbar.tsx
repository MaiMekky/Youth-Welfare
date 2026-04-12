"use client";
import React, { useState, useEffect, useRef } from "react";
import "../styles/studentNavbar.css";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logo from "../../assets/capital-uni-logo.png";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";

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

/* ── Component ──────────────────────────────────────────────── */
const StudentNavbar: React.FC = () => {
  const [mobileOpen, setMobileOpen]         = useState(false);
  const [scrolled, setScrolled]             = useState(false);
  const [isElderBrother, setIsElderBrother] = useState(false);
  const menuRef  = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null;

  useEffect(() => {
    if (!token) return;

    const checkRole = async () => {
      try {
        const baseUrl = getBaseUrl();
        const res = await authFetch(`${baseUrl}/api/family/student/families/`, {

          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;

        const response = await res.json();

        let families: { role: string }[] = [];
        if (Array.isArray(response))               families = response;
        else if (Array.isArray(response.data))     families = response.data;
        else if (Array.isArray(response.results))  families = response.results;
        else if (Array.isArray(response.families)) families = response.families;

        const hasElderRole = families.some(f => f.role === 'أخ أكبر');
        setIsElderBrother(hasElderRole);
      } catch {
        // silent fail
      }
    };

    checkRole();
  }, [token]);

  const baseNavItems: NavItem[] = [
    { key: "home",       label: "أنشطتي",            icon: <IconHome />,       href: "/Student/MainPage"   },
    { key: "activities", label: "الأنشطة",            icon: <IconActivities />, href: "/Student/Activities" },
    { key: "families",   label: "الأسر الطلابية",     icon: <IconFamily />,     href: "/Student/Families"   },
    { key: "takafol",    label: "التكافل الاجتماعي",  icon: <IconTakafol />,    href: "/Student/takafol"    },
    { key: "profile",    label: "ملفي الشخصي",        icon: <IconProfile />,    href: "/Student/profile"    },
  ];

  const navItems: NavItem[] = isElderBrother
    ? [
        ...baseNavItems.slice(0, 3),
        { key: "familyManage", label: "إدارة الأسر", icon: <IconFamilyManage />, href: "/Student/manage" },
        ...baseNavItems.slice(3),
      ]
    : baseNavItems;

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
  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 900) setMobileOpen(false); };
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
      <div className="navbar-inner">

        {/* ── Brand ── */}
        <Link href="/Student/MainPage" className="brand" aria-label="رعاية الطلاب - الرئيسية">
          <div className="brand-mark">
            <Image
              src={logo}
              alt="شعار جامعة العاصمة"
              className="brand-logo-img"
              width={82}
              height={82}
              style={{ objectFit: "contain", width: "100%", height: "100%" }}
              priority
              draggable={false}
              quality={100}
            />
          </div>
          <div className="brand-text">
            <span className="brand-name">رعاية الطلاب</span>
            <span className="brand-sub">جامعة العاصمة</span>
          </div>
        </Link>

        <div className="brand-divider" aria-hidden />

        {/* ── Desktop Nav ── */}
        <nav className="nav" role="navigation" aria-label="قائمة التصفح الرئيسية">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={isActive(item.href)
                ? "nav-link active-pill"
                : "nav-link"}
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

        {/* ── Actions ── */}
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

      {/* ── Mobile Menu ── */}
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