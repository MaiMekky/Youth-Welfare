"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "../Styles/Sidbar.module.css";

import { Home, FileText, BarChart3, User, Menu, X } from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Close sidebar when clicking outside
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

  // Navigate to page and close sidebar on mobile
  const handleNavigation = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button className={styles.mobileMenuBtn} onClick={() => setIsOpen(true)}>
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}
      >
        <div className={styles.header}>
          <h2>إدارة التكافل الاجتماعي</h2>
          <p>جامعة حلوان - قسم خدمات الطلاب</p>
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.profile}>
          <User size={28} />
          <div>
            <h3>د. أحمد حسن</h3>
            <p>كلية الهندسة</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          {/* <button
            onClick={() => handleNavigation("/")}
            className={pathname === "/" ? styles.active : ""}
          >
            <Home size={18} />
            <span>الصفحة الرئيسية</span>
          </button> */}

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
