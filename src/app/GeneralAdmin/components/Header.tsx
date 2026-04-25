"use client";
import Image from "next/image";
import "../../FacultyHead/Styles/Header.css";
import logo from "@/app/assets/capital-uni-logo.png";
import { useState, useRef, useEffect } from "react";
import { LogOut, ChevronDown, Menu } from "lucide-react";

interface HeaderProps {
  onSidebarOpen?: () => void;
}

export default function Header({ onSidebarOpen }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [adminInfo, setAdminInfo] = useState({
    name: "المدير العام",
    email: "admin@university.edu",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        setAdminInfo({
          name: u.name || "المدير العام",
          email: u.email || "admin@university.edu",
        });
      }
    } catch {}
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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
    <header className="hdr" dir="rtl">
      <div className="hdr-accent-line" />

      <div className="hdr-inner">

        {/* Brand */}
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
              alt="شعار النظام"
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
            <h1 className="hdr-title">نظام إدارة رعاية الطلاب</h1>
            <p className="hdr-sub">لوحة تحكم المدير العام</p>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="hdr-actions">
          <button
            className="hdr-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>تسجيل الخروج</span>
          </button>
        </div>

      </div>
    </header>
  );
}
