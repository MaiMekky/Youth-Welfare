"use client";

import React from "react";
import styles from "../styles/report.module.css";
import { useRouter } from "next/navigation";

export default function ReportCard({
  family,
  onDeactivate,
  isDeactivating,
}: {
  family: Record<string, unknown>;
  onDeactivate?: () => void;
  isDeactivating?: boolean;
}) {
  const router = useRouter();

  const isInactive = family.status === "inactive";

  const statusColor = isInactive
    ? "#9ca3af"
    : family.status === "مقبول"
    ? "#4caf50"
    : family.status === "مرفوض"
    ? "#f44336"
    : "#ff9800";

  const statusLabel = isInactive ? "غير مفعّل" : (family.status as string);

  return (
    <div className={`${styles.reportCard} ${isInactive ? styles.inactiveCard : ""}`}>
      <div className={styles.reportContent}>

        {/* --- Family Name with Status Badge --- */}
        <div className={styles.reportHeader}>
          <h2 className={styles.familyName}>{family.name as string}</h2>
          <span
            className={styles.statusBadge}
            style={{ backgroundColor: statusColor }}
          >
            {statusLabel}
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
              <span className={styles.detailValue}>
                {family.foundingDate as string}
              </span>
            </div>
          </div>

          <div className={`${styles.detailRow} ${styles.singleItem}`}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>الفئة:</span>
              <span className={styles.detailValue}>
                {family.category as string}
              </span>
            </div>
          </div>

          {(family.description as string) && (
            <div className={`${styles.detailRow} ${styles.descriptionItem}`}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>وصف الأسرة:</span>
                <span className={styles.detailValue}>
                  {family.description as string}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* --- Actions Row --- */}
        <div className={styles.actionsRow}>
          <button
            className={styles.viewDetailsBtn}
            onClick={() =>
              router.push(`/Family-Faclevel/families-reports/${family.id}`)
            }
          >
            <span className={styles.btnIcon}>
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
                <circle cx="12" cy="12" r="3" />
                <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z" />
              </svg>
            </span>
            عرض التفاصيل الكاملة
          </button>

          {/* Hidden entirely when inactive */}
          {!isInactive && (
            <button
              className={styles.deactivateBtn}
              onClick={onDeactivate}
              disabled={isDeactivating}
            >
              <span className={styles.btnIcon}>
                {isDeactivating ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ animation: "spin 1s linear infinite" }}
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                ) : (
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
                    <circle cx="12" cy="12" r="10" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                  </svg>
                )}
              </span>
              {isDeactivating ? "جاري الإلغاء..." : "إلغاء تفعيل الأسرة"}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}