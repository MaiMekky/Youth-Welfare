"use client";
import React from "react";
import styles from "../Styles/Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
      
        <div className={styles.brand}>
          <div className={styles.brandText}>
            <h1 className={styles.title}>التكافل الاجتماعي</h1>
            <p className={styles.subtitle}>طلبات الدعم المالي المعتمدة للطلاب</p>
          </div>
        </div>

      
        <div className={styles.controls}>
          <button className={styles.exportBtn}>
            <span className={styles.exportIcon}>⬇</span> تصدير البيانات
          </button>

          <div className={styles.searchBox}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="ابحث بالاسم أو الرقم القومي أو كود التكافل..."
            />
          </div>

         

          <div className={styles.profile}>
            <div className={styles.avatar}></div>
            <div className={styles.profileInfo}>
              <div className={styles.name}>المدير العام</div>
              <div className={styles.role}>نظام إدارة الفعاليات</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
