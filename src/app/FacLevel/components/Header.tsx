// app/components/Header/Header.tsx
import React from "react";
import styles from "../Styles/Header.module.css";
import { Home, FileText, User } from "lucide-react";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><Home size={24} /></div>
          <div className={styles.headerTitle}>
            <h1 className={styles.headerTitleH1}>إدارة التكافل الاجتماعي</h1>
            <p className={styles.headerTitleP}>جامعة حلوان - قسم خدمات الطلاب</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.btnAddRequest}>
            <FileText size={18} />
            <span>إضافة الطلبات</span>
          </button>
          <div className={styles.userInfo}>
            <User size={20} />
            <div>
              <p className={styles.userName}>د.أحمد حسن</p>
              <p className={styles.userRole}>كلية الهندسة</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
