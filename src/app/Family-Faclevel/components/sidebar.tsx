"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "../styles/Sidbar.module.css";

import {
  Home,
  FileText,
  BarChart3,
  User,
  Menu,
  X,
  ClipboardList,
  Users,
  PlusCircle,
  CalendarRange
} from "lucide-react";

export default function FacLevelSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

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

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  return (
    <>
      <button className={styles.mobileMenuBtn} onClick={() => setIsOpen(true)}>
        <Menu size={24} />
      </button>

     <aside
      id="sidebar"
      className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}
    >
      <div className={styles.sidebarContent}>
        {/* ===== Header ===== */}
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h2>إدارة الاسر الطلابية</h2>
            <p>جامعة حلوان - قسم خدمات الاسر الطلابية</p>
          </div>

          <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* ===== Profile ===== */}
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

        {/* ===== Nav ===== */}
        <nav className={styles.nav}>
          <button
            onClick={() => handleNavigation("/Family-Faclevel/events")}
            className={pathname === "/Family-Faclevel/events" ? styles.active : ""}
          >
            <CalendarRange size={18} />
            <span>إدارة الفعليات</span>
          </button>

          <button
            onClick={() => handleNavigation("/Family-Faclevel/families-reports")}
            className={pathname === "/Family-Faclevel/families-reports" ? styles.active : ""}
          >
            <BarChart3 size={18} />
            <span>تقارير الاسر</span>
          </button>

          <button
            onClick={() => handleNavigation("/Family-Faclevel/families-requests")}
            className={pathname === "/Family-Faclevel/families-requests" ? styles.active : ""}
          >
            <ClipboardList size={18} />
            <span>طلبات الاسر</span>
          </button>

          <button
            onClick={() => handleNavigation("/Family-Faclevel/environment-friends")}
            className={pathname === "/Family-Faclevel/environment-friends" ? styles.active : ""}
          >
            <PlusCircle size={18} />
            <span>إنشاء أسرة أصدقاء البيئة</span>
          </button>

          <button
            onClick={() => handleNavigation("/Family-Faclevel/leaders")}
            className={pathname === "/Family-Faclevel/leaders" ? styles.active : ""}
          >
            <User size={18} />
            <span>قادة الاسر</span>
          </button>
        </nav>
      </div>
      
        {/* ===== Footer ===== */}
        <div className={styles.footer}>
          <p>الإصدار 1.0.0 | النظام نشط</p>
        </div>
    </aside>

      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}></div>
      )}
    </>
  );
}
