"use client";
import React from "react";
import { ClipboardList, Clock, FileSearch, CheckCircle } from "lucide-react";
import styles from "../Styles/StatsGrid.module.css";

export default function StatsGrid() {
  const stats = [
    { icon: ClipboardList, label: "تم الاستلام", value: "8", color: "statTotal" },
    { icon: Clock, label: "في الانتظار", value: "5", color: "statPending" },
    { icon: FileSearch, label: "موافقة مبدئية", value: "2", color: "statReview" },
    { icon: CheckCircle, label: "تم الموافقة", value: "1", color: "statApproved" },
  ];

  return (
    <div className={styles.statsGrid}>
      {stats.map((stat, i) => (
        <div key={i} className={styles.statCard}>
          <div className={styles.statContent}>
            <div>
              <p className={styles.statLabel}>{stat.label}</p>
              <p className={styles.statValue}>{stat.value}</p>
            </div>
            <div className={`${styles.statIcon} ${styles[stat.color]}`}>
              <stat.icon size={24} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}