"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import "../styles/Sidebar.css";
import { Menu, X, FileText, BarChart3, User } from "lucide-react";
import Image from "next/image";
import logo from "../../assets/logo1.png";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  const [adminInfo, setAdminInfo] = useState({
    name: "",
    email: "",
    role: "",
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
    const tokenData = localStorage.getItem("access");
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setAdminInfo({
          name: userData.name || "مدير النظام",
          email: userData.email || "admin@helwan.edu.eg",
          role: userData.role || "",
        });
      } catch (error) {
        console.error("فشل في قراءة بيانات المدير من localStorage", error);
      }
    }
  }, []);

  const handleReportsClick = () => {
    router.push("/uni-level/reports");
    if (isMobile) setIsOpen(false);
  };

  const handleAllApplicationsClick = () => {
    router.push("/uni-level");
    if (isMobile) setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      if (isOpen && sidebar && !sidebar.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile menu button - only show on mobile */}
      {isMobile && (
        <button className="mobileMenuBtn" onClick={() => setIsOpen(true)}>
          <Menu size={24} />
        </button>
      )}

      <aside id="sidebar" className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>إدارة التكافل الاجتماعي</h2>
          <p>جامعة حلوان - قسم خدمات الطلاب</p>  
          <div className="headerIcon">
            <Image src={logo} alt="logo" className="headerLogo" width={50} height={50} />
          </div>
          {/* Close button - only show on mobile */}
          {isMobile && (
            <button className="closeBtn" onClick={() => setIsOpen(false)}>
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
            {adminInfo.role && <p>{adminInfo.role}</p>}
          </div>
        </div>
        
        <nav className="nav">
          <button
            className={pathname === "/uni-level/reports" ? "active" : ""}
            onClick={handleReportsClick}
          >
            <BarChart3 size={18} />
            <span>تقارير الكليات</span>
          </button>

          <button
            className={pathname === "/uni-level" ? "active" : ""}
            onClick={handleAllApplicationsClick}
          >
            <FileText size={18} />
            <span>إدارة الطلبات</span>
          </button>
        </nav>
      </aside>

      {/* Overlay - only show on mobile when sidebar is open */}
      {isMobile && isOpen && <div className="overlay" onClick={() => setIsOpen(false)} />}
    </>
  );
}