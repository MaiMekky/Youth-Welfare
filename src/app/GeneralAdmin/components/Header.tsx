"use client";
import "../Styles/Header.css";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, LogOut, Menu } from "lucide-react";
import Image from "next/image";
import logo from "@/app/assets/capital-uni-logo.png";

interface HeaderProps {
  onSidebarOpen?: () => void;
}

export default function Header({ onSidebarOpen }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    const isProd = process.env.NODE_ENV === "production";
    const cookieEnd = `path=/; max-age=0; SameSite=Lax${isProd ? "; Secure" : ""}`;
    ["access", "refresh", "user_type", "roleKey", "role"].forEach((k) => {
      document.cookie = `${k}=; ${cookieEnd}`;
    });
    window.location.replace("/");
  };
      
  return (
    <header className="header">
      {/* Subtle top accent line */}
      <div className="headerAccentLine" />

      <div className="headerContent">
        {/* RIGHT side in RTL: toggle + logo + title */}
        <div className="headerBrand">
          {onSidebarOpen && (
            <button
              className="headerSidebarToggle"
              onClick={onSidebarOpen}
              aria-label="فتح القائمة الجانبية"
            >
              <Menu size={20} />
            </button>
          )}
          <div className="headerLogoWrap">
            <Image
              src={logo}
              alt="شعار النظام"
              width={80}
              height={80}
              className="headerLogoImg"
              style={{ objectFit: "contain", width: "100%", height: "100%" }}
              priority
            />
          </div>
          <div className="headerDivider" />
          <div className="headerTitle">
            <h1 className="headerTitleH1">نظام إدارة رعاية الطلاب</h1>
            <p className="headerTitleP">لوحة تحكم المدير العام</p>
          </div>
        </div>

        {/* LEFT side in RTL: user dropdown */}
        <div className="headerActions">
          <div className="userDropdownWrap" ref={dropdownRef}>
            <button
              className="userBtn"
              onClick={() => setDropdownOpen((v) => !v)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              
              <div className="userInfo">
                <span className="userName">دكتور/ {adminInfo.name}</span>
                <span className="userRole">المدير العام</span>
              </div>
              <ChevronDown
                size={14}
                className={`chevron ${dropdownOpen ? "open" : ""}`}
              />
            </button>

            {dropdownOpen && (
              <div className="dropdown" role="menu">
                <div className="dropdownHeader">
                  {/* <div className="dropdownAvatar">{getInitials(adminInfo.name)}</div> */}
                  <div className="dropdownHeaderInfo">
                    <div className="dropdownName">{adminInfo.name}</div>
                    <div className="dropdownEmail">{adminInfo.email}</div>
                  </div>
                </div>
                <div className="dropdownDivider" />
                <button
                  className="dropdownItem logout"
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