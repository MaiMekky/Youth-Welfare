"use client";
import React, { useState, useEffect } from "react";
import "../Styles/Sidebar.css";
import { Menu, X, User, Briefcase, BarChart3, Calendar } from "lucide-react";
import Image from "next/image";
import logo from "../../assets/logo1.png";

interface SidebarProps {
  onNavigate?: (view: string) => void;
  currentView?: string;
}

export default function Sidebar({ onNavigate, currentView }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [adminInfo, setAdminInfo] = useState({ name: "" });

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth <= 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setAdminInfo({ name: userData.name || "مدير النظام" });
      } catch {}
    }
  }, []);

  const handleNavigate = (view: string) => {
    if (onNavigate) onNavigate(view);
    if (isMobile) setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      const mobileBtn = document.querySelector(".mobile-menu-btn");
      if (
        isOpen &&
        sidebar &&
        !sidebar.contains(e.target as Node) &&
        !mobileBtn?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen && isMobile) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isMobile]);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <>
      {isMobile && (
        <button className="mobile-menu-btn" onClick={() => setIsOpen(true)}>
          <Menu size={22} />
        </button>
      )}

      <aside id="sidebar" className={`sidebar ${isOpen ? "open" : ""}`}>

        {/* Header */}
        <div className="sidebar-header">
          {isMobile && (
            <button className="sidebar-close-btn" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          )}
          <div className="sidebar-logo-wrap">
            <Image
              src={logo}
              alt="شعار الجامعة"
              className="sidebar-logo-img"
              width={52}
              height={52}
            />
          </div>
          <div className="sidebar-brand">
            <span className="sidebar-brand-title">إدارة الشباب</span>
            <span className="sidebar-brand-sub">جامعة حلوان</span>
          </div>
        </div>

        <div className="sidebar-divider" />

        {/* Profile card */}
        <div className="profile-card">
          <div className="profile-avatar">
            {adminInfo.name ? getInitials(adminInfo.name) : <User size={16} />}
          </div>
          <div className="profile-info">
            
            <span className="profile-role">المدير العام للادارة</span>
          </div>
        </div>

        {/* Nav label */}
        <div className="nav-label">القائمة الرئيسية</div>

        {/* Navigation */}
        <nav className="nav">
            
          <button
            className={currentView === "activities" ? "active" : ""}
            onClick={() => handleNavigate("activities")}
          >
            <Briefcase size={18} />
            <span> الفعاليات العامة</span>
          </button>

          <button
            className={currentView === "reports" ? "active" : ""}
            onClick={() => handleNavigate("reports")}
          >
            <BarChart3 size={18} />
            <span>التقارير والإنجازات</span>
          </button>

          <button
            className={currentView === "plan" ? "active" : ""}
            onClick={() => handleNavigate("plan")}
          >
            <Calendar size={18} />
            <span>تقارير الكليات</span>
          </button>
        </nav>

        {/* Footer label */}
        <div className="sidebar-footer-label">
          <span className="sidebar-footer-top">لوحة المدير العام</span>
          <span className="sidebar-footer-bot">إدارة الشباب</span>
        </div>

      </aside>

      {isMobile && isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}