"use client";

import React from "react";
import styles from "../styles/EventsPage.module.css";
import { CalendarDays, CheckCircle2, Clock, Users } from "lucide-react";

export type Stats = {
  activeEvents: number;
  registeredStudents: number;
  completedEvents: number;
  pendingApproval: number;
  totalEvents: number;
};

export default function StatsGrid({ stats }: { stats: Stats }) {
  return (
    <div className={styles.statsRow}>
      <div className={`${styles.statCard} ${styles.statAmber}`}>
        <div className={styles.statIcon}>
          <CalendarDays size={22} />
        </div>
        <div className={styles.statText}>
          <div className={styles.statLabel}>الفعاليات النشطة</div>
          <div className={styles.statValue}>{stats.activeEvents}</div>
        </div>
      </div>

      <div className={`${styles.statCard} ${styles.statIndigo}`}>
        <div className={styles.statIcon}>
          <Users size={22} />
        </div>
        <div className={styles.statText}>
          <div className={styles.statLabel}>الطلاب المسجلين</div>
          <div className={styles.statValue}>{stats.registeredStudents}</div>
        </div>
      </div>

      <div className={`${styles.statCard} ${styles.statGreen}`}>
        <div className={styles.statIcon}>
          <CheckCircle2 size={22} />
        </div>
        <div className={styles.statText}>
          <div className={styles.statLabel}>الفعاليات المكتملة</div>
          <div className={styles.statValue}>{stats.completedEvents}</div>
        </div>
      </div>

      <div className={`${styles.statCard} ${styles.statBlue}`}>
        <div className={styles.statIcon}>
          <Clock size={22} />
        </div>
        <div className={styles.statText}>
          <div className={styles.statLabel}>في انتظار الموافقة</div>
          <div className={styles.statValue}>{stats.pendingApproval}</div>
        </div>
      </div>
    </div>
  );
}
