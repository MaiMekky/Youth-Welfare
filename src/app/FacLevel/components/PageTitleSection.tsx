"use client";
import React from "react";
import styles from "../Styles/PageTitleSection.module.css";
import { FileText, Printer } from "lucide-react";

export default function PageTitleSection() {
  return (
    <div className={styles.pageTitleSection}>
      <div className={styles.pageTitleLeft}>
        {/* <div className={styles.pageIcon}>
          <FileText size={24} />
        </div> */}
        <div>
          <h2 className={styles.pageTitleH2}>كلية الهندسة - طلبات الدعم المالي</h2>
          <p className={styles.pageTitleP}>المسؤول: د.أحمد حسن</p>
        </div>
      </div>

      <div className={styles.pageActions}>
        <button className={styles.btnSecondary}>
          <Printer size={18} />
          <span>طباعة</span>
        </button>
        <button className={styles.btnSecondary}>
          <FileText size={18} />
          <span>تصدير</span>
        </button>
        
      </div>
    </div>
  );
}
