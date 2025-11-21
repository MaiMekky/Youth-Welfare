"use client";

import React from "react";
import styles from "../Styles/Header.module.css";
import Image from "next/image";
import logo from "@/app/assets/logo1.png";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
  
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

  
    localStorage.removeItem("user");

   
    router.push("/");
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Image className={styles.headerLogo} src={logo} alt="logo" />
          </div>
          <div className={styles.headerTitle}>
            <h1 className={styles.headerTitleH1}>إدارة التكافل الاجتماعي</h1>
            <p className={styles.headerTitleP}>جامعة حلوان - قسم خدمات الطلاب</p>
          </div>
        </div>

        <div className={styles.headerRight}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            تسجيل خروج
          </button>
        </div>
      </div>
    </header>
  );
}
