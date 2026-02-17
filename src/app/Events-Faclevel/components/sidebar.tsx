"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "@/app/FacLevel/Styles/Sidbar.module.css";

import { CalendarDays, TrendingUp, Menu, X, User, Users } from "lucide-react";

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

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

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
              <h2>إدارة الفعاليات</h2>
              <p>نظام إدارة الفعاليات لجامعة حلوان</p>
            </div>

            <button
              className={styles.closeBtn}
              onClick={() => setIsOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Profile */}
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
            {/* إدارة الفعاليات */}
            <button
              onClick={() => handleNavigation("/Events-Faclevel")}
              className={
                pathname === "/Events-Faclevel" ? styles.active : ""
              }
            >
              <CalendarDays size={18} />
              <span>إدارة الفعاليات</span>
            </button>

                {/* إدارة الخطط */}
            <button
              onClick={() => handleNavigation("/Events-Faclevel/plans")}
              className={pathname === "/Events-Faclevel/plans" ? styles.active : ""}
            >
              <Users size={18} />
              <span>خطط الكلية</span>
            </button>

            {/* الإنجازات والتقارير */}
            <button
              onClick={() => handleNavigation("/Events-Faclevel/reports")}
              className={pathname === "/Events-Faclevel/reports" ? styles.active : ""}
            >
              <TrendingUp size={18} />
              <span>الإنجازات والتقارير</span>
            </button>

          </nav>

          <div className={styles.footer}>
            <p>الإصدار 1.0.0 | النظام نشط</p>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}
