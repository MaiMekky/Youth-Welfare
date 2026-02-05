"use client";

import React from "react";
import styles from "../Styles/Tabs.module.css";

interface Props {
  activeTab: string;
  setActiveTab: (t: string) => void;
  pendingCount?: number;
}

export default function Tabs({ activeTab, setActiveTab, pendingCount = 0 }: Props) {
  return (
    <div className={styles.tabsContainer}>
    

      {/* Tabs */}
      <div className={styles.tabsWrapper}>
        
        <button
          className={`${styles.tab} ${activeTab === "central" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("central")}
        >
          <span className={styles.tabText}>أسرة مركزية</span>
        </button>

        <button
          className={`${styles.tab} ${activeTab === "quality" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("quality")}
          style={{ position: "relative" }}
        >
          <span className={styles.tabText}>أسر نوعية و أصدقاء البيئة</span>

          {/* {pendingCount > 0 && (
            <span className={styles.notificationBadge}>{pendingCount}</span>
          )} */}
        </button>

      </div>

    </div>
  );
}
