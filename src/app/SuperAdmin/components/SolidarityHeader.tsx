"use client";

import React from "react";
import styles from "../Styles/solidarityHeader.module.css";

export default function SolidarityHeader() {
  return (
    <div className={styles.headerContainer}>
      <div className={styles.textSection}>
        <h1 className={styles.title}>إدارة التكافل الاجتماعي</h1>
        <p className={styles.subtitle}>
          متابعة طلبات الدعم الاجتماعي للطلاب وإدارة حالات القبول والرفض
        </p>
      </div>
    </div>
  );
}