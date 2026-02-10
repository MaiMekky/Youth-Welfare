"use client";

import React from "react";
import styles from "../Styles/Tabs.module.css";

interface Props {
  activeTab: string;
  setActiveTab: (t: string) => void;
  qualityPendingCount?: number;
  ecoPendingCount?: number;
}

export default function Tabs({ 
  activeTab, 
  setActiveTab, 
  qualityPendingCount = 0,
  ecoPendingCount = 0 
}: Props) {
  return (
    <div className={styles.tabsContainer}>
      {/* Tabs */}
      <div className={styles.tabsWrapper}>
        
        {/* Central Families Tab */}
        <button
          className={`${styles.tab} ${activeTab === "central" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("central")}
        >
          <span className={styles.tabText}>أسرة مركزية</span>
        </button>

        {/* Quality Families Tab */}
        <button
          className={`${styles.tab} ${activeTab === "quality" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("quality")}
          style={{ position: "relative" }}
        >
          <span className={styles.tabText}>أسر نوعية</span>

          {qualityPendingCount > 0 && (
            <span className={styles.notificationBadge}>{qualityPendingCount}</span>
          )}
        </button>

        {/* Eco-Friendly Families Tab */}
        <button
          className={`${styles.tab} ${activeTab === "eco" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("eco")}
          style={{ position: "relative" }}
        >
          <span className={styles.tabText}>أصدقاء البيئة</span>

          {ecoPendingCount > 0 && (
            <span className={styles.notificationBadge}>{ecoPendingCount}</span>
          )}
        </button>

      </div>
    </div>
  );
}