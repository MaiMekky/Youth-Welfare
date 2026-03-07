"use client";
import React, { useState, useEffect, useRef } from "react";
// ✅ Own CSS — never conflicts with shared Sidebar.css
import "../Styles/Sidebar.css";
import { X, Briefcase, Calendar } from "lucide-react";
import Image from "next/image";
import logo from "@/utils/logo.png";

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (v: boolean) => void;
  onNavigate?: (view: string) => void;
  currentView?: string;
}

const NAV = [
  { id: "activities", label: "الفعاليات العامة", Icon: Briefcase },
  { id: "plan",       label: "تقارير الكليات",   Icon: Calendar  },
];

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function Sidebar({
  isOpen = false,
  setIsOpen = () => {},
  onNavigate,
  currentView,
}: SidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null);
  const [adminInfo, setAdminInfo] = useState({ name: "المدير العام", role: "المدير العام للإدارة" });

  // Load user info
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        setAdminInfo({
          name: u.name || "المدير العام",
          role: u.role || "المدير العام للإدارة",
        });
      }
    } catch {}
  }, []);

  // Outside-click — deferred to avoid race with toggle button
  useEffect(() => {
    if (!isOpen) return;

    const handleOutside = (e: MouseEvent) => {
      if (sidebarRef.current?.contains(e.target as Node)) return;
      setTimeout(() => setIsOpen(false), 0);
    };

    document.addEventListener("mousedown", handleOutside);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleNavigate = (view: string) => {
    onNavigate?.(view);
    setIsOpen(false);
  };

  return (
    <>
      <aside
        ref={sidebarRef}
        className={`ga-sidebar${isOpen ? " open" : ""}`}
        dir="rtl"
      >
        <div className="ga-sidebar-header">
          <div className="ga-logo-wrap">
            <Image src={logo} alt="شعار الجامعة" className="ga-logo-img" width={44} height={44} priority />
          </div>
          <div className="ga-brand">
            <span className="ga-brand-title">جامعة العاصمة</span>
            <span className="ga-brand-sub">إدارة رعاية الطلاب</span>
          </div>

          <button className="ga-close-btn" onClick={() => setIsOpen(false)} aria-label="إغلاق القائمة">
            <X size={18} />
          </button>
        </div>

        <div className="ga-divider" />

        <div className="ga-profile-card">
          <div className="ga-profile-avatar">{getInitials(adminInfo.name)}</div>
          <div className="ga-profile-info">
            <span className="ga-profile-name">{adminInfo.name}</span>
            <span className="ga-profile-role">{adminInfo.role}</span>
          </div>
        </div>

        <nav className="ga-nav">
          {NAV.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={currentView === id ? "active" : ""}
              onClick={() => handleNavigate(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="ga-sidebar-footer"><span>الإصدار 1.0.0 | النظام نشط</span></div>
      </aside>

      {isOpen && (
        <div className="ga-overlay" onClick={() => setIsOpen(false)} aria-hidden="true" />
      )}
    </>
  );
}