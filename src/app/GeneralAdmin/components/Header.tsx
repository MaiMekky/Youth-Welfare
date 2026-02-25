"use client";
import "../Styles/Header.css";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Bell, ChevronDown, LogOut, User, Menu } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifCount] = useState(3);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [adminInfo, setAdminInfo] = useState({ name: "المدير العام", email: "admin@university.edu" });

  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setAdminInfo({
          name: userData.name || "المدير العام",
          email: userData.email || "admin@university.edu",
        });
      } catch {}
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    const isProd = process.env.NODE_ENV === "production";
    const cookieEnd = `path=/; max-age=0; SameSite=Lax${isProd ? "; Secure" : ""}`;
    document.cookie = `access=; ${cookieEnd}`;
    document.cookie = `refresh=; ${cookieEnd}`;
    document.cookie = `user_type=; ${cookieEnd}`;
    document.cookie = `roleKey=; ${cookieEnd}`;
    document.cookie = `role=; ${cookieEnd}`;
    window.location.replace("/");
  };

  // Get initials from name
  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <header className="header">
      <div className="headerContent">

        {/* RIGHT: Title */}
        <div className="headerTitle">
          <h1 className="headerTitleH1">نظام إدارة رعاية الطلاب</h1>
          <p className="headerTitleP">لوحة تحكم المدير العام</p>
        </div>

        {/* LEFT: Action buttons */}
        <div className="headerActions">

          {/* Sidebar toggle (layout icon) */}
          <button className="headerIconBtn" title="القائمة">
            <Menu size={20} />
          </button>

          {/* Language toggle */}
          <button className="headerIconBtn langBtn" title="تغيير اللغة">
            <span>A</span>
          </button>

          {/* Notifications */}
          <button className="headerIconBtn notifBtn" title="الإشعارات">
            <Bell size={20} />
            {notifCount > 0 && <span className="notifBadge">{notifCount}</span>}
          </button>

          {/* User dropdown */}
          <div className="userDropdownWrap" ref={dropdownRef}>
            <button
              className="userBtn"
              onClick={() => setDropdownOpen((v) => !v)}
            >
              <div className="userAvatar">{getInitials(adminInfo.name)}</div>
              <div className="userInfo">
                <span className="userName">{adminInfo.name}</span>
                <span className="userEmail">{adminInfo.email}</span>
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
                <button className="dropdownItem">
                  <User size={15} />
                  <span>الملف الشخصي</span>
                </button>
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