"use client";
import React from "react";
import styles from "../Styles/Tabs.module.css";

type TabType = "central" | "quality";

interface Props {
  activeTab: TabType;
  setActiveTab: (t: TabType) => void;
  pendingCount?: number;
}

export default function Tabs({ activeTab, setActiveTab }: Props) {
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
          <span className={styles.tabText}>أسر نوعية و أصدقاء البيئة</span>
        </button>

      </div>
    </div>
  );
}
