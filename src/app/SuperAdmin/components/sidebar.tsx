"use client";
import React from "react";
import styles from "../Styles/sidebar.module.css";
import Image from "next/image";
import Logo from "../../assets/logo1.png";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen?: boolean;
  closeSidebar?: () => void;
}

export default function Sidebar({ isOpen = false, closeSidebar }: SidebarProps) {
  const pathname = usePathname(); // current route
  
  const menuItems = [
    { label: "صلاحيات الوصول", href: "/CreateAdmins" },
    { label: "سجلات النشاط", href: "/ActivityLogs" },
    { label: "إدارة الفعاليات", href: "#" },
    { label: "إحصائيات الزوار", href: "#" },
    { label: "التكافل الاجتماعي", href: "/SuperAdmin" },
    { label: "الاسر الطلابية", href: "/SuperAdmin-family" },
  ];

  const handleLinkClick = () => {
    // Close sidebar on mobile when link is clicked
    if (closeSidebar) {
      closeSidebar();
    }
  };

  return (
    <aside className={`${styles.saSidebar} ${isOpen ? styles.open : ""}`}>
      {/* Close button for mobile */}
      <button 
        className={styles.closeButton} 
        onClick={closeSidebar}
        aria-label="إغلاق القائمة"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className={styles.profileSection}>
        <div className={styles.profileAvatar}>
          <Image
            src={Logo}
            alt="Logo"
            width={60}
            height={60}
            className={styles.logoImage}
          />
        </div>
        <div className={styles.profileInfo}>
          <h3>مشرف النظام</h3>
          <p style={{ textAlign: "center" }}>نظام إدارة الفعاليات</p>
        </div>
      </div>

      <nav className={styles.sidebarMenu}>
        {menuItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            onClick={handleLinkClick}
            className={`${styles.menuItem} ${
              pathname === item.href ? styles.active : ""
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}