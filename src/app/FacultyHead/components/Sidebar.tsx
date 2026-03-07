"use client";
import React, { useState, useEffect, useRef } from "react";
// ✅ Own CSS file — does NOT conflict with shared Sidebar.css
import "@/app/FacultyHead/styles/Sidebar.css";
import { X, User, Briefcase, Calendar } from "lucide-react";
import Image from "next/image";
import logo from "@/app/assets/logo.png";

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (v: boolean) => void;
  onNavigate?: (view: string) => void;
  currentView?: string;
}

const NAV = [
  { id: "activities", label: "إدارة الفعاليات", Icon: Briefcase },
  { id: "plan",       label: "خطة الكلية",      Icon: Calendar  },
];

export default function Sidebar({
  isOpen = false,
  setIsOpen = () => {},
  onNavigate,
  currentView,
}: SidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null);
  const [adminInfo, setAdminInfo] = useState({ name: "" });

  // Load user
  useEffect(() => {
    try {
      const u = localStorage.getItem("user");
      if (u) setAdminInfo({ name: JSON.parse(u).name || "مدير النظام" });
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
        className={`fh-sidebar${isOpen ? " open" : ""}`}
        dir="rtl"
      >
        <div className="fh-sidebar-header">
          <div className="fh-logo-container">
            <div className="fh-logo-wrapper">
              <div className="fh-logo-circle">
                <Image
                  src={logo}
                  alt="شعار الجامعة"
                  className="fh-sidebar-logo"
                  width={110}
                  height={110}
                  priority
                />
              </div>
            </div>
          </div>
          <h2 className="fh-sidebar-title">جامعة العاصمة</h2>
          <p className="fh-sidebar-subtitle">المشرف العام للكلية</p>

          <button
            className="fh-sidebar-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="إغلاق القائمة"
          >
            <X size={18} />
          </button>
        </div>

        <div className="fh-sidebar-divider" />

        <div className="fh-profile-card">
          <div className="fh-profile-icon"><User size={18} /></div>
          <div className="fh-admin-info">
            <h3>دكتور/ {adminInfo.name || "المشرف العام"}</h3>
          </div>
        </div>

        <nav className="fh-nav">
          {NAV.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={currentView === id ? "active" : ""}
              onClick={() => handleNavigate(id)}
            >
              <span className="fh-nav-icon-wrap"><Icon size={16} /></span>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="fh-sidebar-footer"><span>v1.0.9</span></div>
      </aside>

      {isOpen && (
        <div
          className="fh-sidebar-overlay"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}