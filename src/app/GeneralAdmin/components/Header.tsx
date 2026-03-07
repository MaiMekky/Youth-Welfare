"use client";
import "../Styles/Header.css";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, LogOut, Menu } from "lucide-react";

interface HeaderProps {
  onSidebarOpen?: () => void;
}

export default function Header({ onSidebarOpen }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [adminInfo, setAdminInfo] = useState({ name: "المدير العام", email: "admin@university.edu" });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        setAdminInfo({ name: u.name || "المدير العام", email: u.email || "admin@university.edu" });
      }
    } catch {}
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    const isProd = process.env.NODE_ENV === "production";
    const cookieEnd = `path=/; max-age=0; SameSite=Lax${isProd ? "; Secure" : ""}`;
    ["access", "refresh", "user_type", "roleKey", "role"].forEach(k => {
      document.cookie = `${k}=; ${cookieEnd}`;
    });
    window.location.replace("/");
  };

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <header className="header">
      <div className="headerContent">

        {/* RIGHT side in RTL: toggle + title */}
        <div className="headerLeft">
          {/* Gold ☰ — opens sidebar on ALL screen sizes */}
          {onSidebarOpen && (
            <button
              className="headerSidebarToggle"
              onClick={onSidebarOpen}
              aria-label="فتح القائمة الجانبية"
            >
              <Menu size={20} />
            </button>
          )}
          <div className="headerTitle">
            <h1 className="headerTitleH1">نظام إدارة رعاية الطلاب</h1>
            <p className="headerTitleP">لوحة تحكم المدير العام</p>
          </div>
        </div>

        {/* LEFT side in RTL: user dropdown */}
        <div className="headerActions">
          <div className="userDropdownWrap" ref={dropdownRef}>
            <button className="userBtn" onClick={() => setDropdownOpen((v) => !v)}>
              <div className="userAvatar">{getInitials(adminInfo.name)}</div>
              <div className="userInfo">
                <span className="userName">{adminInfo.name}</span>
              </div>
              <ChevronDown size={16} className={`chevron ${dropdownOpen ? "open" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="dropdown">
                <div className="dropdownHeader">
                  <div className="dropdownAvatar">{getInitials(adminInfo.name)}</div>
                  <div>
                    <div className="dropdownName">{adminInfo.name}</div>
                    <div className="dropdownEmail">{adminInfo.email}</div>
                  </div>
                </div>
                <div className="dropdownDivider" />
                <button className="dropdownItem logout" onClick={handleLogout}>
                  <LogOut size={15} />
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