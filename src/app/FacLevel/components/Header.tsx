"use client";

import React, { useState } from "react";
import styles from "../Styles/Header.module.css";
import Image from "next/image";
import logo from "@/app/assets/logo1.png";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = "access=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "refresh=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "user_type=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "roleKey=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "role=; path=/; max-age=0; SameSite=Lax";

    router.push("/");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavClick = (path: string) => {
    router.push(path);
    setIsMenuOpen(false); // Close menu after navigation
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Image className={styles.headerLogo} src={logo} alt="logo" />
          </div>
          <div className={styles.headerTitle}>
            <h1 className={styles.headerTitleH1}>إدارة رعاية الشباب</h1>
            <p className={styles.headerTitleP}>جامعة حلوان - قسم خدمات الطلاب</p>
          </div>
        </div>

        {/* Hamburger Menu Button (Mobile) */}
        <button 
          className={styles.hamburger}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.open : ''}`}></span>
          <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.open : ''}`}></span>
          <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.open : ''}`}></span>
        </button>

        {/* Navigation Buttons */}
        <div className={`${styles.headerRight} ${isMenuOpen ? styles.mobileMenuOpen : ''}`}>
          <button
            className={styles.navBtn}
            onClick={() => handleNavClick("/FacLevel")}
          >
            التكافل الاجتماعي
          </button>

          <button
            className={styles.navBtn}
            onClick={() => handleNavClick("/Family-Faclevel/events")}
          >
            الاسر الطلابية
          </button>

          <button
            className={styles.navBtn}
            onClick={() => handleNavClick("/activities")}
          >
            الانشطة
          </button>

          <button className={styles.logoutBtn} onClick={handleLogout}>
            تسجيل خروج
          </button>
        </div>
      </div>
    </header>
  );
}