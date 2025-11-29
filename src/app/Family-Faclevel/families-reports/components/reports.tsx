"use client";

import React from "react";
import styles from "../styles/report.module.css";
import { useRouter } from "next/navigation";

export default function ReportCard({ family }: any) {
  const router = useRouter();

  const handleDelete = () => {
    // Add your delete logic here (API call or state update)
    alert(`تم حذف الأسرة: ${family.name}`);
  };

  return (
    <div className={styles.reportCard}>
      <div className={styles.reportContent}>
        <div className={styles.reportMainInfo}>
          <h2 className={styles.familyName}>{family.name}</h2>

          <div className={styles.reportDetailsGrid}>
            <div className={styles.detailRow}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>الاخت الكبري:</span>
                <span className={styles.detailValue}>{family.coordinator}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>الاخ الاكبر:</span>
                <span className={styles.detailValue}>{family.supervisor}</span>
              </div>
            </div>

            <div className={styles.detailRow}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>عدد الأعضاء:</span>
                <span className={styles.detailValue}>
                  {family.membersCount} عضو
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>تاريخ التأسيس:</span>
                <span className={styles.detailValue}>{family.foundingDate}</span>
              </div>
            </div>

            <div className={`${styles.detailRow} ${styles.singleItem}`}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>الفئة:</span>
                <span className={styles.detailValue}>{family.category}</span>
              </div>
            </div>
          </div>

          <div className={styles.statsRow}>
            <div className={`${styles.statItem} ${styles.goals}`}>
              <span className={styles.statIcon}></span>
              <span className={styles.statText}>{family.goals} أهداف</span>
            </div>
            <div className={`${styles.statItem} ${styles.activities}`}>
              <span className={styles.statIcon}></span>
              <span className={styles.statText}>{family.activities} أنشطة</span>
            </div>
            <div className={`${styles.statItem} ${styles.enrolled}`}>
              <span className={styles.statIcon}></span>
              <span className={styles.statText}>
                {family.enrolled} طلاب مسجلين
              </span>
            </div>
          </div>
        </div>

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

          <button
            className={styles.deleteBtn}
            onClick={handleDelete}
          >
            <span className={styles.btnIcon}>
              {/* Trash SVG icon */}
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
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6l-1 14H6L5 6"></path>
                <path d="M10 11v6"></path>
                <path d="M14 11v6"></path>
              </svg>
            </span>
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}
