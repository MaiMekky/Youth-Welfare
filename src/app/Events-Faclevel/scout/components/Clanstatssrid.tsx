"use client";
import React from "react";
import styles from "../styles/ClanStatsGrid.module.css";
import { Users, UserCheck, UserX, Clock, GitBranch, UserMinus } from "lucide-react";
import type { ClanStats } from "../page";

interface Props {
  stats: ClanStats;
}

export default function ClanStatsGrid({ stats }: Props) {
  const items = [
    {
      label: "إجمالي الأعضاء",
      value: stats.total_members,
      icon: Users,
      variant: "blue",
    },
    {
      label: "الأعضاء المقبولون",
      value: stats.accepted_count,
      icon: UserCheck,
      variant: "green",
    },
    {
      label: "في انتظار القبول",
      value: stats.pending_count,
      icon: Clock,
      variant: "amber",
    },
    {
      label: "الأعضاء المرفوضون",
      value: stats.rejected_count,
      icon: UserX,
      variant: "red",
    },
    {
      label: "عدد المجموعات",
      value: stats.groups_count,
      icon: GitBranch,
      variant: "purple",
    },
    {
      label: "أعضاء بلا مجموعة",
      value: stats.unassigned_count,
      icon: UserMinus,
      variant: "gray",
    },
  ];

  return (
    <div className={styles.grid}>
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} className={`${styles.card} ${styles[item.variant]}`}>
            <div className={styles.iconWrap}>
              <Icon size={20} />
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