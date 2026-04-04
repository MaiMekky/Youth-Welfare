
"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import "@/app/Styles/Sidebar.css";
import { X, Users ,User } from "lucide-react";
import Image from "next/image";
import logo from "../../assets/logo.png";

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (v: boolean) => void;
}

export default function Sidebar({ isOpen = false, setIsOpen = () => {} }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminInfo, setAdminInfo] = useState({ name: "", role: "" });

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        const u = JSON.parse(raw);
        setAdminInfo({ name: u.name || "مدير النظام", role: u.role || "" });
      } catch {}
    }
  }, []);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      if (isOpen && sidebar && !sidebar.contains(e.target as Node)) setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, setIsOpen]);

  useEffect(() => { setIsOpen(false); }, [pathname, setIsOpen]);

  const go = (path: string) => { router.push(path); setIsOpen(false); };

  return (
    <>
      <aside id="sidebar" className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-wrapper">
              <div className="logo-circle">
                <Image src={logo} alt="شعار جامعة العاصمة" className="sidebar-logo" width={96} height={96} priority />
              </div>
            </div>
          </div>
          <h2 className="sidebar-title">إدارة الأسر الطلابية</h2> <p className="sidebar-subtitle">جامعة العاصمة - قسم خدمات الطلاب</p> <button className="sidebar-close-btn" onClick={() => setIsOpen(false)} aria-label="إغلاق القائمة"> <X size={20} /> </button>
        </div>

        <div className="profile-card">
          <div className="profile-icon"><User size={22} /></div>
          <div className="admin-info">
            <h3>{adminInfo.name}</h3>
            {adminInfo.role && <p>{adminInfo.role}</p>}
          </div>
        </div>

        <nav className="nav">
          <button className={pathname === "/uni-level-family" ? "active" : ""} onClick={() => go("/uni-level-family")}>
            <Users size={18} /><span>ادارة الأسر</span>
          </button>
        </nav>

        <div className="sidebar-footer"><span>الإصدار 1.0.0 | النظام نشط</span></div>
      </aside>

      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} aria-hidden="true" />}
    </>
  );
}