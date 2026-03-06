"use client";
import React, { useEffect, useState } from "react";
import "@/app/Styles/Sidebar.css";
import Image from "next/image";
import Logo from "../../assets/logo.png";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const menuItems = [
    { label: "صلاحيات الوصول", href: "/CreateAdmins" },
    { label: "سجلات النشاط", href: "/ActivityLogs" },
    { label: "إدارة الفعاليات", href: "/SuperAdmin/Events" },
    { label: "إحصائيات الزوار", href: "#" },
    { label: "التكافل الاجتماعي", href: "/SuperAdmin" },
    { label: "الاسر الطلابية", href: "/SuperAdmin-family" },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const sidebarEl = document.getElementById("superadmin-sidebar");
      const menuBtn = document.querySelector(".mobileMenuBtn");
      if (
        isOpen &&
        sidebarEl &&
        !sidebarEl.contains(e.target as Node) &&
        menuBtn &&
        !(menuBtn as HTMLElement).contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleLinkClick = () => setIsOpen(false);

  return (
    <>
      <button
        className="mobileMenuBtn"
        onClick={() => setIsOpen(true)}
        aria-label="فتح القائمة"
      >
        <Menu size={24} />
      </button>

      <aside
        id="superadmin-sidebar"
        className={`sidebar ${isOpen ? "open" : ""}`}
      >
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
          <div className="profile-icon">
            <User size={22} />
          </div>
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
              onClick={handleLinkClick}
              className={pathname === item.href ? "active" : ""}
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
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
