"use client";
import React, { useMemo } from "react";
import { ClipboardList, Clock, FileSearch, CheckCircle, XCircle } from "lucide-react";
import styles from "../Styles/StatsGrid.module.css";

export default function StatsGrid({ requests }: any) {
  // ✅ حساب عدد الطلبات حسب الحالة
  const statusCounts = useMemo(() => {
    const counts = {
      total: requests.length, // إجمالي الطلبات (تم الاستلام)
      received: 0, // منتظر
      review: 0,
      approved: 0,
      rejected: 0,
    };

    requests.forEach((req: any) => {
      if (req.status && counts.hasOwnProperty(req.status)) {
        counts[req.status]++;
      }
    });

    return counts;
  }, [requests]);

  // ✅ ترتيب الكروت بال labels العربية
  const stats = [
    { icon: ClipboardList, label: "تم الاستلام", value: statusCounts.total, color: "statTotal" },
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
