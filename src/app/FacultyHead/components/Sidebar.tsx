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
  
  const [adminInfo, setAdminInfo] = useState({
    name: "",
  });

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setAdminInfo({
          name: userData.name || "مدير النظام",
        });
      } catch (error) {
        console.error("فشل في قراءة بيانات المدير من localStorage", error);
      }
    }
  }, []);

  const handleNavigate = (view: string) => {
    if (onNavigate) {
      onNavigate(view);
    }
    if (isMobile) setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      const mobileBtn = document.querySelector(".mobile-menu-btn");
      
      if (isOpen && sidebar && !sidebar.contains(e.target as Node) && !mobileBtn?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen && isMobile) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isMobile]);

  return (
    <>
      {/* Mobile menu button - only show on mobile */}
      {isMobile && (
        <button className="mobile-menu-btn" onClick={() => setIsOpen(true)}>
          <Menu size={24} />
        </button>
      )}

      <aside id="sidebar" className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="headerIcon">
            <div className="logoCircle">
              <Image src={logo} alt="logo" className="headerLogo" />
            </div>
          </div>
          <h2>المشرف العام للكلية</h2>
          {/* Close button - only show on mobile */}
          {isMobile && (
            <button className="sidebar-close-btn" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          )}
        </div>

        <div className="profile-card">
          <div className="profile-icon">
            <User size={22} />
          </div>
          <div className="admin-info">
            <h3>{adminInfo.name}</h3>
          </div>
        </div>
        
        <nav className="nav">
          <button
            className={currentView === "activities" ? "active" : ""}
            onClick={() => handleNavigate("activities")}
          >
            <Briefcase size={18} />
            <span>إدارة الفعاليات</span>
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
            <span>خطة الكلية</span>
          </button>
        </nav>
      </aside>

      {/* Overlay - only show on mobile when sidebar is open */}
      {isMobile && isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}
    </>
  );
}