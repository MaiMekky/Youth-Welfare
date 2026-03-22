
"use client";
import React, { useEffect } from "react";
import "@/app/Styles/Sidebar.css";
import Image from "next/image";
import Logo from "../../assets/logo.png";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, User } from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (v: boolean) => void;
}

export default function Sidebar({ isOpen = false, setIsOpen = () => {} }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { label: "صلاحيات الوصول",  href: "/CreateAdmins" },
    { label: "سجلات النشاط",    href: "/ActivityLogs" },
    { label: "إدارة الفعاليات", href: "/SuperAdmin/Events" },
    // { label: "إحصائيات الزوار", href: "#" },
    { label: "التكافل الاجتماعي", href: "/SuperAdmin" },
    { label: "الأسر الطلابية",  href: "/SuperAdmin-family" },
  ];

  // Close on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const el = document.getElementById("superadmin-sidebar");
      if (isOpen && el && !el.contains(e.target as Node)) setIsOpen(false);
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

  // Close on route change
  useEffect(() => { setIsOpen(false); }, [pathname, setIsOpen]);

  return (
    <>
      <aside id="superadmin-sidebar" className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-container" aria-hidden="true">
            <div className="logo-wrapper">
              <div className="logo-circle">
                <Image
                  src={Logo}
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
          <p className="sidebar-subtitle">نظام إدارة الفعاليات</p>
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
            <h3>مشرف النظام</h3>
            <p>نظام إدارة الفعاليات</p>
          </div>
        </div>

        <nav className="nav sidebar-menu">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={pathname === item.href ? "active" : ""}
            >
              <span>{item.label}</span>
            </Link>
          ))}
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