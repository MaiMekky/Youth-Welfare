"use client";
import React, { useState, useEffect, useRef } from "react";
import "../styles/studentNavbar.css"; // ensure this is imported somewhere (or in _app.tsx)
import Image from "next/image";
import Logo from "@/app/assets/logo1.png";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
type NavItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
};
const IconHome = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M3 10.5L12 4l9 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 21V11.5h14V21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconUnion = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M17 21v-2a3 3 0 00-3-3H8a3 3 0 00-3 3v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12.5" cy="7.5" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M20 8v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconFamily = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 21v-2a4 4 0 0 1 3-3.87" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconTakafol = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 20s-4-3.2-6.3-5.1C3.7 12.9 4 8.7 7.6 7.2 10.3 6 12 8 12 8s1.7-2 4.4-0.8C20 8.7 20.3 12.9 18.3 14.9 16 16.8 12 20 12 20z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.06"/>
    <path d="M9 10h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconProfile = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
    <path d="M6 20v-1a6 6 0 0112 0v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconManage = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.82 2.82l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.82-2.82l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09c.7 0 1.28-.34 1.51-1a1.65 1.65 0 00-.33-1.82L4.3 3.89A2 2 0 017.12 1.06l.06.06c.46.46 1.1.66 1.71.56.6-.1 1.07-.59 1.22-1.18l.18-.7A2 2 0 0113.9.18l.18.7c.15.59.62 1.08 1.22 1.18.61.1 1.25-.1 1.71-.56l.06-.06A2 2 0 0119.7 3.9l-.06.06c-.46.46-.66 1.1-.56 1.71.1.6.59 1.07 1.18 1.22l.7.18a2 2 0 01.12 3.72l-.7.18c-.59.15-1.08.62-1.18 1.22-.1.61.1 1.25.56 1.71z" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconActivities = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconFamilyManage = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M17 21v-2a3 3 0 00-3-3H8a3 3 0 00-3 3v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M23 21v-2a3 3 0 00-2.5-2.94" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="19" cy="19" r="2" stroke="currentColor" strokeWidth="1.6" fill="currentColor" fillOpacity="0.2"/>
  </svg>
);
  
const StudentNavbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  const router = useRouter(); // router جوا الcomponent

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    router.push("/");
  }
  
  const navItems: (NavItem & { href: string })[] = [
    { key: "home", label: "الرئيسية", icon: <IconHome />, href: "/Student/MainPage" },
    { key: "activities", label: "الأنشطة", icon: <IconActivities />, href: "/Student/Activities" },
    { key: "union", label: "اتحاد الطلبة", icon: <IconUnion />, href: "/Student/StudentUnion" },
    { key: "families", label: "الأسر الطلابية", icon: <IconFamily />, href: "/Student/families" },
    { key: "familyManage", label: "ادارة الاسر", icon: <IconFamilyManage />, href: "/Student/manage" },
    { key: "takafol", label: "التكافل الاجتماعي", icon: <IconTakafol />, href: "/Student/takafol" },
    { key: "profile", label: "ملفي الشخصي", icon: <IconProfile />, href: "/Student/profile" },
  ];
  
  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + "/");
  };

  // simple resize listener
  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth <= 860);
      if (window.innerWidth > 860) setMobileOpen(false);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // close mobile menu on click outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!mobileOpen) return;
      if (!menuRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!menuRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [mobileOpen]);
  return (
    <header className="navbar">
      <div className="navbar-inner container">
        <div className="brand" aria-hidden>
          <div className="brand-mark"><Image src={Logo} alt="Logo" width={45} height={45} style={{borderRadius : "10px"}}/>
</div>
          <div className="brand-name">
            رعاية الشباب
            <div className="brand-sub">جامعة حلوان</div>
          </div>
        </div>

        {/* Center nav - hidden on mobile */}
        <nav className="nav" role="navigation" aria-label="قائمة التصفح">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={
                isActive(item.href)
                  ? "nav-link nav-link-with-icon active-pill"
                  : "nav-link nav-link-with-icon"
              }
              aria-current={isActive(item.href) ? "page" : undefined}
              title={item.label}
            >
              <span className="nav-icon" aria-hidden>
                {item.icon}
              </span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Actions and mobile toggle */}
        <div className="nav-actions">
          <button className="logout"onClick={handleLogout}>تسجيل خروج</button>

          {/* Mobile hamburger - visible only on small screens */}
          <button
            className={`hamburger ${mobileOpen ? "open" : ""}`}
            aria-label={mobileOpen ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen((s) => !s)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path className="line top" d="M3 6h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              <path className="line middle" d="M3 12h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              <path className="line bottom" d="M3 18h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <div
        id="mobile-menu"
        ref={menuRef}
        className={`mobile-menu ${mobileOpen ? "open" : ""}`}
        role="menu"
        aria-hidden={!mobileOpen}
      >
        <div className="mobile-menu-inner">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              role="menuitem"
              className={
                isActive(item.href)
                  ? "mobile-item mobile-item-active"
                  : "mobile-item"
              }
              onClick={() => setMobileOpen(false)}
            >
              <span className="mobile-icon" aria-hidden>{item.icon}</span>
              <span className="mobile-label">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default StudentNavbar;