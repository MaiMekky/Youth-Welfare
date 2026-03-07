"use client";
import React, { useState, useEffect } from "react";
import "@/app/Styles/Sidebar.css";
import { Menu, X, User, Briefcase, BarChart3, Calendar } from "lucide-react";
import Image from "next/image";
import logo from "../../assets/logo.png";

interface SidebarProps {
  onNavigate?: (view: string) => void;
  currentView?: string;
}

export default function Sidebar({ onNavigate, currentView }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [adminInfo, setAdminInfo] = useState({ name: "" });

  useEffect(() => {
    try {
      const u = localStorage.getItem("user");
      if (u) setAdminInfo({ name: JSON.parse(u).name || "مدير النظام" });
    } catch {}
  }, []);

  const handleNavigate = (view: string) => {
    onNavigate?.(view);
    setIsOpen(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      const menuBtn = document.querySelector(".mobile-menu-btn");
      if (
        isOpen &&
        sidebar &&
        !sidebar.contains(e.target as Node) &&
        menuBtn &&
        !(menuBtn as HTMLElement).contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handler);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.removeEventListener("mousedown", handler);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const NAV = [
    { id: "activities", label: "إدارة الفعاليات",    Icon: Briefcase },
       { id: "plan",       label: "خطة الكلية",          Icon: Calendar   },
  ];

  return (
    <>
      <button
        className="mobile-menu-btn"
        onClick={() => setIsOpen(true)}
        aria-label="فتح القائمة"
      >
        <Menu size={22} />
      </button>

      <aside id="sidebar" className={`sidebar ${isOpen ? "open" : ""}`} dir="rtl">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-wrapper">
              <div className="logo-circle">
                <Image src={logo} alt="شعار الجامعة" className="sidebar-logo" width={110} height={110} />
              </div>
            </div>
          </div>
          <h2 className="sidebar-title">جامعة العاصمة</h2>
          <p className="sidebar-subtitle">المشرف العام للكلية</p>
          <button
            className="sidebar-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Gold divider ── */}
        <div className="sidebar-divider" />

        {/* ── Profile card ── */}
        <div className="profile-card">
          <div className="profile-icon">
            <User size={18} />
          </div>
          <div className="admin-info">
            <h3>دكتور/ {adminInfo.name || "المشرف العام"}</h3>
            
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="nav">
          {NAV.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={currentView === id ? "active" : ""}
              onClick={() => handleNavigate(id)}
            >
              <span className="nav-icon-wrap"><Icon size={16} /></span>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* ── Version ── */}
        <div className="sidebar-footer">
          <span>v1.0.9</span>
        </div>
      </aside>

      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}