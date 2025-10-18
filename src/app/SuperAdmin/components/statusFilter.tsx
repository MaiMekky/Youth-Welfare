"use client";
import React from "react";
import styles from "../Styles/statusFilter.module.css";

export default function StatusFilter() {
  return (
    <div className={styles.statusBar}>
      <div className={styles.approvedBadge}>✅ تم الموافقة (6)</div>
      <span className={styles.studentsCount}>عرض 6 من 6 طلاب</span>
    </div>
  );
}
