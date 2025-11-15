"use client";

import React, { useMemo } from "react";
import { ClipboardList, Clock, FileSearch, CheckCircle, XCircle } from "lucide-react";
import styles from "../Styles/StatsGrid.module.css";

interface Request {
  id: number | string;
  status: string;
}

interface StatsGridProps {
  requests: Request[];
}

export default function StatsGrid({ requests }: StatsGridProps) {
  // Normalize status: accept english codes or Arabic labels and map them to the same set
  const normalizeStatus = (raw: string) => {
    if (!raw) return "";
    const s = raw.toString().toLowerCase().trim();
    // Common Arabic labels mapping -> english codes used internally
    if (s === "منتظر") return "received";
    if (s === "موافقة مبدئية") return "review";
    if (s === "مقبول") return "approved";
    if (s === "مرفوض") return "rejected";
    // already english
    return s;
  };

  const statusCounts = useMemo(() => {
    const counts = { total: requests.length, received: 0, review: 0, approved: 0, rejected: 0 };

    requests.forEach((req) => {
      const status = normalizeStatus(req.status || "");
      switch (status) {
        case "received":
          counts.received++;
          break;
        case "review":
          counts.review++;
          break;
        case "approved":
          counts.approved++;
          break;
        case "rejected":
          counts.rejected++;
          break;
        default:
          break;
      }
    });

    return counts;
  }, [requests]);

  const stats = [
    { icon: ClipboardList, label: "إجمالي الطلبات", value: statusCounts.total, color: "statTotal" },
    { icon: Clock, label: "منتظر", value: statusCounts.received, color: "statPending" },
    { icon: FileSearch, label: "موافقة مبدئية", value: statusCounts.review, color: "statReview" },
    { icon: CheckCircle, label: "مقبول", value: statusCounts.approved, color: "statApproved" },
    { icon: XCircle, label: "مرفوض", value: statusCounts.rejected, color: "statRejected" },
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