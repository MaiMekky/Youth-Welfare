"use client";
import React from "react";
import styles from "../styles/StatsGrid.module.css";
import { Shield, CheckCircle, XCircle, Users, UserCheck, Clock } from "lucide-react";
import type { ClanStats } from "../page";

interface Props {
  stats: ClanStats;
}

export default function StatsGrid({ stats }: Props) {
  const items = [
    {
      label: "إجمالي العشائر",
      value: stats.total_clans,
      icon: Shield,
      variant: "gold",
    },
    {
      label: "العشائر النشطة",
      value: stats.active_clans,
      icon: CheckCircle,
      variant: "green",
    },
    {
      label: "العشائر غير النشطة",
      value: stats.inactive_clans,
      icon: XCircle,
      variant: "red",
    },
    {
      label: "إجمالي الأعضاء",
      value: stats.total_members,
      icon: Users,
      variant: "blue",
    },
    {
      label: "الأعضاء المقبولون",
      value: stats.total_accepted,
      icon: UserCheck,
      variant: "purple",
    },
    {
      label: "طلبات معلقة",
      value: stats.total_pending,
      icon: Clock,
      variant: "amber",
    },
  ];

  return (
    <div className={styles.grid}>
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} className={`${styles.card} ${styles[item.variant]}`}>
            <div className={styles.iconWrap}>
              <Icon size={20} strokeWidth={2.2} />
            </div>
            <div className={styles.content}>
              <span className={styles.label}>{item.label}</span>
              <span className={styles.value}>{item.value}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
