"use client";
import React, { useState, useEffect, useRef } from "react";
import "@/app/Styles/Sidebar.css";
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
  { id: "plan",       label: "خطط الكلية",      Icon: Calendar  },
];

export default function Sidebar({
  isOpen = false,
  setIsOpen = () => {},
  onNavigate,
  currentView,
}: SidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null);
  const [adminInfo, setAdminInfo] = useState({ name: "" });

  useEffect(() => {
    try {
      const u = localStorage.getItem("user");
      if (u) setAdminInfo({ name: JSON.parse(u).name || "مدير النظام" });
    } catch {}
  }, []);

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
  }, [isOpen, setIsOpen]);

  const handleNavigate = (view: string) => {
    onNavigate?.(view);
    setIsOpen(false);
  };

  return (
    <>
      <aside
        ref={sidebarRef}
        className={`sidebar${isOpen ? " open" : ""}`}
        dir="rtl"
      >
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-wrapper">
              <div className="logo-circle">
                <Image
                  src={logo}
                  alt="شعار الجامعة"
                  className="sidebar-logo"
                  width={110}
                  height={110}
                  priority
                />
              </div>
            </div>
          </div>
          <h2 className="sidebar-title">جامعة العاصمة</h2>
          <p className="sidebar-subtitle">مدير الكلية</p>
          <button
            className="sidebar-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="إغلاق القائمة"
          >
            <X size={20} />
          </button>
        </div>

        <div className="profile-card">
          <div className="profile-icon"><User size={22} /></div>
          <div className="admin-info">
            <h3>دكتور/ {adminInfo.name || "المشرف العام"}</h3>
          </div>
        </div>

        <nav className="nav">
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
