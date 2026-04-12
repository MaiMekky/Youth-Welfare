"use client";
import Image from "next/image";
import "../Styles/Header.css";
import logo from "../../assets/capital-uni-logo.png";
import { useState, useRef, useEffect } from "react";
import { LogOut, ChevronDown, Menu } from "lucide-react";

interface HeaderProps {
  onSidebarOpen?: () => void;
}

export default function Header({ onSidebarOpen }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [adminInfo, setAdminInfo] = useState({
    name: "المشرف العام",
    email: "admin@university.edu",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        setAdminInfo({
          name: u.name || "المشرف العام",
          email: u.email || "admin@university.edu",
        });
      }
    } catch {}
  }, []);

const handleLogout = async () => {
  console.log("=== LOGOUT START ===");
  console.log("Cookies BEFORE:", document.cookie);
  
  localStorage.clear();
  console.log("localStorage cleared");

  try {
    const res = await fetch("/api/logout", { method: "POST" });
    console.log("API response status:", res.status);
    const data = await res.json();
    console.log("API response data:", data);
  } catch (err) {
    console.error("API call failed:", err);
  }

  console.log("Cookies AFTER:", document.cookie);
  console.log("=== REDIRECTING ===");
  
  window.location.href = "/";
};
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="hdr" dir="rtl">
      {/* Gold top accent line */}
      <div className="hdr-accent-line" />

      <div className="hdr-inner">

        {/* ── Brand (right in RTL) ── */}
        <div className="hdr-brand">

          {onSidebarOpen && (
            <button
              className="hdr-sidebar-toggle"
              onClick={onSidebarOpen}
              aria-label="فتح القائمة الجانبية"
            >
              <Menu size={20} />
            </button>
          )}

          <div className="hdr-logo-wrap">
            <Image
              src={logo}
              alt="شعار الجامعة"
              width={80}
              height={80}
              className="hdr-logo-img"
              style={{ objectFit: "contain", width: "100%", height: "100%" }}
              priority
              draggable={false}
              quality={100}
            />
          </div>

          <div className="hdr-divider" />

          <div className="hdr-brand-text">
            <h1 className="hdr-title">النظام الإداري</h1>
            <p className="hdr-sub">النظام الإداري لرعاية الطلاب</p>
          </div>
        </div>

        {/* ── Actions (left in RTL) ── */}
        <div className="hdr-actions">
          <div className="hdr-user-wrap" ref={menuRef}>
            <button
              className={`hdr-user-btn${menuOpen ? " hdr-user-open" : ""}`}
              onClick={() => setMenuOpen(o => !o)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              <div className="hdr-user-info">
                <span className="hdr-user-name">دكتور/  {adminInfo.name}</span>
                <span className="hdr-user-role">مدير الكلية</span>
              </div>
              <ChevronDown size={14} className="hdr-chevron" />
            </button>

            {menuOpen && (
              <div className="hdr-dropdown" role="menu">
                <div className="hdr-dropdown-header">
                  <div className="hdr-dd-info">
                    <p className="hdr-dd-name">{adminInfo.name}</p>
                    <p className="hdr-dd-email">{adminInfo.email}</p>
                  </div>
                </div>
                <div className="hdr-dropdown-divider" />
                <button
                  className="hdr-dd-item hdr-dd-logout"
                  onClick={handleLogout}
                  role="menuitem"
                >
                  <LogOut size={14} />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}