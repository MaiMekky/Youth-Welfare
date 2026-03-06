"use client";
import React, { useState, useEffect } from "react";
import "@/app/Styles/Sidebar.css";
import { Menu, X, User, Briefcase, Calendar } from "lucide-react";
import Image from "next/image";
import logo from "@/utils/logo.png";

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

  return (
    <>
      {isMobile && (
        <button
          className="mobile-menu-btn"
          onClick={() => setIsOpen(true)}
          aria-label="فتح القائمة"
        >
          <Menu size={22} />
        </button>
      )}

      <aside id="sidebar" className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-container" aria-hidden="true">
            <div className="logo-wrapper">
              <div className="logo-circle">
                <Image
                  src={logo}
                  alt="شعار جامعة العاصمة"
                  className="sidebar-logo"
                  width={96}
                  height={96}
                  priority
                />
              </div>
            </div>
          </div>
          <h2 className="sidebar-title">إدارة رعاية الطلاب</h2>
          <p className="sidebar-subtitle">جامعة العاصمة</p>
          {isMobile && (
            <button
              className="sidebar-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="إغلاق القائمة"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="profile-card">
          <div className="profile-icon">
            <User size={22} />
          </div>
          <div className="admin-info">
            <h3>{adminInfo.name || "المدير العام"}</h3>
            <p>المدير العام للإدارة</p>
          </div>
        </div>

        <nav className="nav">
          <button
            className={currentView === "activities" ? "active" : ""}
            onClick={() => handleNavigate("activities")}
          >
            <Briefcase size={18} />
            <span>الفعاليات العامة</span>
          </button>
          <button
            className={currentView === "plan" ? "active" : ""}
            onClick={() => handleNavigate("plan")}
          >
            <Calendar size={18} />
            <span>تقارير الكليات</span>
          </button>
        </nav>
      </aside>

      {isMobile && isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
