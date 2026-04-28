"use client";
import Image from "next/image";
import "../Styles/Header.css";
import logo from "../../assets/capital-uni-logo.png";
import { useState, useEffect } from "react";
import { LogOut, Menu } from "lucide-react";
import { getBaseUrl } from "@/utils/globalFetch";
import { getSessionMeta } from "@/utils/cookieHelpers";

interface HeaderProps {
  onSidebarOpen?: () => void;
}

export default function Header({ onSidebarOpen }: HeaderProps) {
  const [adminInfo, setAdminInfo] = useState({
    name: "مدير الكلية",
    email: "admin@university.edu",
  });

  useEffect(() => {
    const meta = getSessionMeta();
    if (meta) setAdminInfo({ name: meta.name || "مدير الكلية", email: "admin@university.edu" });
  }, []);

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