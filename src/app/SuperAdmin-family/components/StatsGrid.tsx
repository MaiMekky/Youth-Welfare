"use client";

import React from "react";
import styles from "../Styles/StatsGrid.module.css";

interface Stat {
  id: number;
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  badge?: string | number;
}

interface StatsGridProps {
  stats: Stat[];
}

const cardVariants = [
  styles.statTotal,
  styles.statSecond,
  styles.statThird,
  styles.statFourth,
];

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => (
  <div className={styles.statsGrid}>
    {stats.map((stat, index) => (
      <div key={stat.id} className={`${styles.statCard} ${cardVariants[index] ?? ""}`}>
        <div className={styles.statNum}>{stat.value}</div>
        <div className={styles.statLabel}>{stat.label}</div>
      </div>
    ))}
  </div>
);

export default StatsGrid;
