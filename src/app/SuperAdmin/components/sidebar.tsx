"use client";
import React from "react";
import styles from "../Styles/sidebar.module.css";

export default function Sidebar() {
  return (
    <aside className={styles.saSidebar}>
      <div className={styles.profileSection}>
        <div className={styles.profileAvatar}></div>
        <div className={styles.profileInfo}>
          <h3> مشرف النظام</h3>
          <p style={{ textAlign: "center" }}>نظام إدارة الفعاليات</p>
        </div>
      </div>

      <nav className={styles.sidebarMenu}>
        <a href="#" className={styles.menuItem}> صلاحيات الوصول</a>
        <a href="#" className={styles.menuItem}> سجلات النشاط</a>
        <a href="#" className={styles.menuItem}> إدارة الفعاليات</a>
        <a href="#" className={styles.menuItem}> إحصائيات الزوار</a>
        <a href="#" className={`${styles.menuItem} ${styles.active}`}> التكافل الاجتماعي</a>
      </nav>
    </aside>
  );
}
