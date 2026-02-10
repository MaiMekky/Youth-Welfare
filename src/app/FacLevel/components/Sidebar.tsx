"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "../Styles/Sidbar.module.css";

import { Home, FileText, BarChart3, User, Menu, X } from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const [userData, setUserData] = useState<any>(null);

  // Load user data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      const menuBtn = document.querySelector(`.${styles.mobileMenuBtn}`);
      
      if (
        isOpen && 
        sidebar && 
        !sidebar.contains(e.target as Node) &&
        menuBtn &&
        !menuBtn.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Navigate to page and close sidebar on mobile
  const handleNavigation = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className={styles.mobileMenuBtn} 
        onClick={() => setIsOpen(true)}
        aria-label="فتح القائمة"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}
      >
        <div className={styles.sidebarContent}>
          <div className={styles.header}>
            <div className={styles.headerText}>
              <h2>إدارة التكافل الاجتماعي</h2>
              <p>جامعة حلوان - قسم خدمات الطلاب</p>
            </div>
            <button 
              className={styles.closeBtn} 
              onClick={() => setIsOpen(false)}
              aria-label="إغلاق القائمة"
            >
              <X size={20} />
            </button>
          </div>

          {/* Profile Section */}
          {userData && (
            <div className={styles.profile}>
              <div className={styles.profileIcon}>
                <User size={28} />
              </div>
              <div className={styles.profileInfo}>
                <h3>{userData.name}</h3>
                <p>{userData.faculty_name}</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className={styles.nav}>
            <button
              onClick={() => handleNavigation("/FacultyReport")}
              className={pathname === "/FacultyReport" ? styles.active : ""}
            >
              <BarChart3 size={18} />
              <span>تقرير الكلية</span>
            </button>

            <button
              onClick={() => handleNavigation("/FacLevel")}
              className={pathname === "/FacLevel" ? styles.active : ""}
            >
              <FileText size={18} />
              <span>إدارة الطلبات</span>
            </button>
          </nav>

          <div className={styles.footer}>
            <p>الإصدار 1.0.0 | النظام نشط</p>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}