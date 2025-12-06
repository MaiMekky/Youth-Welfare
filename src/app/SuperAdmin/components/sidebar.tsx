"use client";
import React, { useState, useEffect } from "react";
import styles from "../Styles/sidebar.module.css";
import Image from "next/image";
import Logo from "../../assets/logo1.png";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { label: "صلاحيات الوصول", href: "/CreateAdmins" },
    { label: "سجلات النشاط", href: "/ActivityLogs" },
    { label: "إدارة الفعاليات", href: "#" },
    { label: "إحصائيات الزوار", href: "#" },
    { label: "التكافل الاجتماعي", href: "/SuperAdmin" },
  ];

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

  // Handle click outside to close sidebar
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

  const handleMenuItemClick = () => {
    if (isMobile) setIsOpen(false);
  };

  return (
    <>
      {/* Mobile menu button - only show on mobile */}
      {isMobile && (
        <button className={styles.mobileMenuBtn} onClick={() => setIsOpen(true)}>
          <Menu size={24} />
        </button>
      )}

      <aside id="sidebar" className={`${styles.saSidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.profileSection}>
          {/* Close button - only show on mobile */}
          {isMobile && (
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          )}

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
              className={`${styles.menuItem} ${pathname === item.href ? styles.active : ""
                }`}
              onClick={handleMenuItemClick}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Overlay - only show on mobile when sidebar is open */}
      {isMobile && isOpen && <div className={styles.overlay} onClick={() => setIsOpen(false)} />}
    </>
  );
}
