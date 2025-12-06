"use client";

import React from "react";
import styles from "../Styles/StatsGrid.module.css";

interface Stat {
  id: number;
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  badge?: string | number;
}

interface StatsGridProps {
  stats: Stat[];
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => (
  <div className={styles.statsGrid}>
    {stats.map((stat) => (
      <div key={stat.id} className={styles.statCard}>
         <div className={styles.statIcon}>{stat.icon}</div>
        {/* Badge on the left */}
        {stat.badge && <div className={styles.statBadge}>{stat.badge}</div>}

        {/* Center content */}
        <div className={styles.statContent}>
          <div className={styles.statLabel}>{stat.label}</div>
          <div className={styles.statValue} style={{ color: stat.color || "#2C3A5F" }}>
            {stat.value}
          </div>
        </div>

        {/* Icon on the right */}
       
      </div>
    ))}
  </div>
);

export default StatsGrid;
