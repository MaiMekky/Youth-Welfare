"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "../styles/Sidebar.css";
import { Menu, X, FileText, BarChart3, User } from "lucide-react";

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleAllApplicationsClick = () => {
    router.push("/uni-level");
    setIsOpen(false);
  };

  const handleReportsClick = () => {
    router.push("/uni-level/reports");
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      if (isOpen && sidebar && !sidebar.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button className="mobileMenuBtn" onClick={() => setIsOpen(true)}>
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <aside id="sidebar" className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>النظام الإداري</h2>
          <p>إدارة التكافل الاجتماعي</p>
          <button className="closeBtn" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="profile-card">
          <div className="profile-icon">
            <User size={22} />
          </div>
          <div>
            <h3>مدير النظام</h3>
            <p>admin@helwan.edu.eg</p>
          </div>
        </div>

        <nav className="nav">
          <button className="active" onClick={handleReportsClick}>
            <BarChart3 size={18} />
            <span>تقارير الكليات</span>
          </button>

          <button onClick={handleAllApplicationsClick}>
            <FileText size={18} />
            <span>إدارة الطلبات</span>
          </button>
        </nav>

      
      </aside>

      {/* Overlay for mobile */}
      {isOpen && <div className="overlay" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default Sidebar;
