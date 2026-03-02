"use client";

import React from "react";
import styles from "../styles/EventsPage.module.css";
import { CalendarDays, CheckCircle2, Clock, Users } from "lucide-react";

export type StatItem = {
  title: string;
  value: string;
  meta?: string;
  icon: "clock" | "check" | "users" | "calendar";
  accent: "amber" | "green" | "indigo" | "gold";
};

const IconMap = {
  clock: Clock,
  check: CheckCircle2,
  users: Users,
  calendar: CalendarDays,
};

export default function StatsGrid({ items }: { items: StatItem[] }) {
  return (
    <div className={styles.statsRow}>
      {items.map((s, idx) => {
        const Icon = IconMap[s.icon] ?? Clock;

        // ✅ mapping للـ accents على الكلاسات الموجودة عندك
        const accentClass =
          s.accent === "gold"
            ? styles.statAmber
            : s.accent === "green"
            ? styles.statGreen
            : s.accent === "indigo"
            ? styles.statIndigo
            : styles.statBlue;

        return (
          <div key={idx} className={`${styles.statCard} ${accentClass}`}>
            <div className={styles.statIcon}>
              <Icon size={22} />
            </div>

            <div className={styles.statText}>
              <div className={styles.statLabel}>{s.title}</div>
              <div className={styles.statValue}>{s.value}</div>

              {!!s.meta && (
                <div style={{ marginTop: 6, opacity: 0.8, fontWeight: 800, fontSize: 13 }}>
                  {s.meta}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}