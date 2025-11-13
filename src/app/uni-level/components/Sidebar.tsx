"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "../styles/Sidebar.css";
import { Menu, X, FileText, BarChart3, User } from "lucide-react";
import Image from "next/image";
import logo from "../../assets/logo1.png";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleReportsClick = () => {
    router.push("/uni-level/reports");
    setIsOpen(false);
  };

  const handleAllApplicationsClick = () => {
    router.push("/uni-level");
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
      <button className="mobileMenuBtn" onClick={() => setIsOpen(true)}>
        <Menu size={24} />
      </button>

      <aside id="sidebar" className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>النظام الإداري</h2>
          <p>إدارة التكافل الاجتماعي</p>
          <div className="headerIcon">
            
            <Image src={logo} alt="logo" className="headerLogo" width={50} height={50} />
          </div>
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

      {isOpen && <div className="overlay" onClick={() => setIsOpen(false)} />}
    </>
  );
}