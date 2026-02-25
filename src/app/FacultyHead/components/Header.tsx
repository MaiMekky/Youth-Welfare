"use client";
import Image from "next/image";
import "../Styles/Header.css";
import logo from "../../assets/logo1.png";
import { useState, useRef, useEffect } from "react";
import { LogOut, ChevronDown, Bell, Settings } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    localStorage.clear();
    const isProd = process.env.NODE_ENV === "production";
    const cookieEnd = `path=/; max-age=0; SameSite=Lax${isProd ? "; Secure" : ""}`;
    ["access", "refresh", "user_type", "roleKey", "role"].forEach(k => {
      document.cookie = `${k}=; ${cookieEnd}`;
    });
    window.location.replace("/");
  };

  // Close dropdown on outside click
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
      <div className="hdr-inner">

        {/* ── Brand ── */}
        <div className="hdr-brand">
          <div className="hdr-logo-wrap">
            <Image src={logo} alt="شعار الجامعة" width={38} height={38} className="hdr-logo-img" />
          </div>
          <div className="hdr-brand-text">
            <h1 className="hdr-title">النظام الإداري</h1>
            <p className="hdr-sub">لوحة تحكم المشرف العام للكلية</p>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="hdr-actions">

          {/* Notification */}
          <button className="hdr-icon-btn" aria-label="الإشعارات">
            <Bell size={17} />
            <span className="hdr-notif-dot" />
          </button>

          {/* User menu */}
          <div className="hdr-user-wrap" ref={menuRef}>
            <button
              className={`hdr-user-btn${menuOpen ? " hdr-user-open" : ""}`}
              onClick={() => setMenuOpen(o => !o)}
            >
              <span className="hdr-avatar">م</span>
              <span className="hdr-user-name">المشرف العام</span>
              <ChevronDown size={13} className="hdr-chevron" />
            </button>

            {menuOpen && (
              <div className="hdr-dropdown">
                <div className="hdr-dropdown-header">
                  <span className="hdr-avatar hdr-avatar-lg">م</span>
                  <div>
                    <p className="hdr-dd-name">المشرف العام</p>
                    <p className="hdr-dd-role">مشرف الكلية</p>
                  </div>
                </div>
                <div className="hdr-dropdown-divider" />
                <button className="hdr-dd-item">
                  <Settings size={14} /> الإعدادات
                </button>
                <button className="hdr-dd-item hdr-dd-logout" onClick={handleLogout}>
                  <LogOut size={14} /> تسجيل الخروج
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}