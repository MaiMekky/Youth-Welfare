"use client";
import Image from "next/image";
import "../Styles/Header.css";
import logo from "../../assets/capital-uni-logo.png";
import { useState, useEffect } from "react";
import { LogOut, Menu } from "lucide-react";

interface HeaderProps {
  onSidebarOpen?: () => void;
}

export default function Header({ onSidebarOpen }: HeaderProps) {
  const [adminInfo, setAdminInfo] = useState({
    name: "مدير الكلية",
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
    localStorage.clear();

    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Logout failed");
    } catch (err) {
      console.error("Logout API failed:", err);
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 100));
      window.location.replace("/");
    }
  };

  return (
    <header className="hdr" dir="rtl">
      <div className="hdr-accent-line" />

      <div className="hdr-inner">

        {/* ── Brand ── */}
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