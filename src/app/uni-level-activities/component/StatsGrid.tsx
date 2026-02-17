"use client";

import React from "react";
import styles from "../styles/StatsGrid.module.css";
import { CalendarDays, CheckCircle2, Clock3, Users } from "lucide-react";

export type StatItem = {
  title: string;
  value: string;
  meta: string;
  icon: "clock" | "check" | "users" | "calendar";
  accent: "amber" | "green" | "indigo" | "gold";
};

const IconMap = {
  clock: Clock3,
  check: CheckCircle2,
  users: Users,
  calendar: CalendarDays,
};

export default function StatsGrid({ items }: { items: StatItem[] }) {
  return (
  <div className={styles.statsGrid}>
    {items.map((s, idx) => {
      const Icon = IconMap[s.icon];
      return (
        <div key={idx} className={`${styles.statsCard} ${styles[s.accent]}`}>
          <div className={styles.statsIconWrap}>
            <Icon size={22} />
          </div>

          <div className={styles.statsContent}>
            <div className={styles.statsTitle}>{s.title}</div>

            <div className={styles.statsRow}>
              <div className={styles.statsValue}>{s.value}</div>
              <div className={styles.statsMeta}>{s.meta}</div>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);
}
