"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import "@/app/Styles/Sidebar.css";
import { X, User, Shield, Users, GitBranch, Home } from "lucide-react";
import Image from "next/image";
import logo from "../../assets/logo.png";
import { getSessionMeta } from "@/utils/cookieHelpers";

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (v: boolean) => void;
}

export default function Sidebar({ isOpen = false, setIsOpen = () => {} }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminInfo, setAdminInfo] = useState({ name: "", role: "" });

  useEffect(() => {
    const meta = getSessionMeta();
    if (meta) setAdminInfo({ name: meta.name || "مدير النظام", role: meta.role || "" });
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

  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  const go = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  return (
    <>
      <aside id="sidebar" className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-wrapper">
              <div className="logo-circle">
                <Image
                  src={logo}
                  alt="شعار الجامعة"
                  className="sidebar-logo"
                  width={96}
                  height={96}
                  priority
                />
              </div>
            </div>
          </div>
          <h2 className="sidebar-title">إدارة الكشافة</h2>
          <p className="sidebar-subtitle">جامعة العاصمة - قسم الكشافة والخدمة العامة</p>
          <button
            className="sidebar-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="إغلاق القائمة"
          >
            <X size={20} />
          </button>
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
            onClick={() => go("/uni-level-scouts/home")}
            className={pathname === "/uni-level-scouts/home" ? "active" : ""}
          >
            <Home size={18} />
            <span>الرئيسية</span>
          </button>
          <button
            className={pathname === "/uni-level-scouts" ? "active" : ""}
            onClick={() => go("/uni-level-scouts")}
          >
            <Shield size={18} />
            <span>العشائر</span>
          </button>
          <button
            className={pathname.startsWith("/uni-level-scouts/members") ? "active" : ""}
            onClick={() => go("/uni-level-scouts/members")}
          >
            <Users size={18} />
            <span>الأعضاء</span>
          </button>
          <button
            className={pathname.startsWith("/uni-level-scouts/groups") ? "active" : ""}
            onClick={() => go("/uni-level-scouts/groups")}
          >
            <GitBranch size={18} />
            <span>المجموعات</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <span>الإصدار 1.0.0 | النظام نشط</span>
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
