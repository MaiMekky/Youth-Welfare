"use client";
import React from "react";
import styles from "../Styles/Tabs.module.css";

type TabType = "central" | "quality" | "eco";

interface Props {
  activeTab: TabType;
  setActiveTab: (t: TabType) => void;
  qualityPendingCount?: number;
  ecoPendingCount?: number;
}

export default function Tabs({ activeTab, setActiveTab, qualityPendingCount, ecoPendingCount }: Props) {
  return (
    <div className={styles.tabsContainer}>
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
        >
          <span className={styles.tabText}>أسر نوعية</span>
          {qualityPendingCount && qualityPendingCount > 0 && (
            <span className={styles.pendingBadge}>{qualityPendingCount}</span>
          )}
        </button>

        <button
          className={`${styles.tab} ${activeTab === "eco" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("eco")}
        >
          <span className={styles.tabText}>أصدقاء البيئة</span>
          {ecoPendingCount && ecoPendingCount > 0 && (
            <span className={styles.pendingBadge}>{ecoPendingCount}</span>
          )}
        </button>

      </div>
    </div>
  );
}
