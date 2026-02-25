"use client";
import React, { useEffect, useState } from "react";
import styles from "../Styles/sidebar.module.css";
import Image from "next/image";
import Logo from "../../assets/logo1.png";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname(); // current route
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

  // Detect mobile viewport (same idea as uni-level sidebar)
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Close sidebar when clicking outside on mobile and lock scroll while open
  useEffect(() => {
    if (!isMobile) {
      document.body.style.overflow = "unset";
      return;
    }

    const handleClickOutside = (e: MouseEvent) => {
      const sidebarEl = document.getElementById("superadmin-sidebar");
      if (isOpen && sidebarEl && !sidebarEl.contains(e.target as Node)) {
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
  }, [isOpen, isMobile]);

  const handleLinkClick = () => {
    // Close sidebar on mobile when link is clicked
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile hamburger button – same behavior style as uni-level */}
      {isMobile && (
        <button
          className={styles.mobileMenuBtn}
          onClick={() => setIsOpen(true)}
          aria-label="فتح القائمة"
        >
          <Menu size={22} />
        </button>
      )}

      <aside
        id="superadmin-sidebar"
        className={`${styles.saSidebar} ${isOpen ? styles.open : ""}`}
      >
        {/* Close button for mobile */}
        <button
          className={styles.closeButton}
          onClick={() => setIsOpen(false)}
          aria-label="إغلاق القائمة"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
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

      {/* Overlay – only on mobile when sidebar is open */}
      {isMobile && isOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}