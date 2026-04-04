"use client";

import React from "react";
import styles from "../styles/report.module.css";
import { useRouter } from "next/navigation";

export default function ReportCard({ family }: { family: Record<string, unknown> }) {
  const router = useRouter();



  // Determine badge color based on status
  const statusColor =
    family.status === "مقبول"
      ? "#4caf50"
      : family.status === "مرفوض"
      ? "#f44336"
      : "#ff9800";

  return (
    <div className={styles.reportCard}>
      <div className={styles.reportContent}>
        {/* --- Family Name with Status Badge --- */}
        <div className={styles.reportHeader}>
          <h2 className={styles.familyName}>{family.name as string}</h2>
          <span
            className={styles.statusBadge}
            style={{ backgroundColor: statusColor }}
          >
            {family.status as string}
          </span>
        </div>

        {/* --- Details Grid --- */}
        <div className={styles.reportDetailsGrid}>
          <div className={styles.detailRow}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>عدد الأعضاء:</span>
              <span className={styles.detailValue}>
                {family.membersCount as string} عضو
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>تاريخ التأسيس:</span>
              <span className={styles.detailValue}>{family.foundingDate as string}</span>
            </div>
          </div>

          <div className={`${styles.detailRow} ${styles.singleItem}`}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>الفئة:</span>
              <span className={styles.detailValue}>{family.category as string}</span>
            </div>
          </div>

          {/* --- Family Description below Category --- */}
          {(family.description as string) && (
            <div className={`${styles.detailRow} ${styles.descriptionItem}`}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>وصف الأسرة:</span>
                <span className={styles.detailValue}>{family.description as string}</span>
              </div>
            </div>
          )}
        </div>

        {/* --- Actions Row --- */}
        <div className={styles.actionsRow}>
          <button
            className={styles.viewDetailsBtn}
            onClick={() => router.push(`/Family-Faclevel/families-reports/${family.id}`)}
          >
            <span className={styles.btnIcon}>
              {/* Eye SVG icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"></path>
              </svg>
            </span>
            عرض التفاصيل الكاملة
          </button>
        </div>
      </div>
    </div>
  );
}
