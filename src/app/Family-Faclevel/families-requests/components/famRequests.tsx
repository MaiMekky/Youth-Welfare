"use client";

import React, { useState } from "react";
import styles from "../styles/famRequests.module.css";

const FamRequests = ({ request }: { request: any }) => {
  const [familyNumber, setFamilyNumber] = useState("");

  return (
    <div className={styles.requestCard}>
      <div className={styles.cardHeader}>
        <div className={styles.titleSection}>
          <h2 className={styles.familyName}>{request.familyName}</h2>
          <span className={`${styles.requestBadge} ${styles.creation}`}>طلب إنشاء</span>
          <span className={`${styles.statusBadge} ${styles.waiting}`}>في الانتظار</span>
        </div>
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>الفئة:</span>
          <span className={styles.infoValue}>{request.category}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>الرقم الجامعي:</span>
          <span className={styles.infoValue}>{request.studentId}</span>
        </div>
        <div className={`${styles.infoItem} ${styles.fullWidth}`}>
          <span className={styles.infoLabel}>مقدم الطلب:</span>
          <span className={styles.infoValue}>{request.submittedBy}</span>
        </div>
        <div className={`${styles.infoItem} ${styles.fullWidth}`}>
          <span className={styles.infoLabel}>تاريخ التقديم:</span>
          <span className={styles.infoValue}>{request.submissionDate}</span>
        </div>
      </div>

      <div className={styles.descriptionSection}>
        <p className={styles.description}>{request.description}</p>
      </div>

      <div className={styles.goalsSection}>
        <h3 className={styles.goalsTitle}>أهداف الأسرة:</h3>
        <ul className={styles.goalsList}>
          {request.goals.map((goal: string, index: number) => (
            <li key={index} className={styles.goalItem}>
              {goal}
            </li>
          ))}
        </ul>
      </div>

      {/* <div className={styles.familyNumberSection}>
        <label className={styles.familyNumberLabel}>تعيين رقم الأسرة</label>
        <input
          type="text"
          className={styles.familyNumberInput}
          placeholder="أدخل رقم الأسرة (مثال: FAM-2025-001)"
          value={familyNumber}
          onChange={(e) => setFamilyNumber(e.target.value)}
        />
      </div> */}

      <div className={styles.cardActions}>
        <button className={styles.btnReject}>
          <span className={styles.btnIcon}>✕</span> رفض الطلب
        </button>
        <button className={styles.btnApprove}>
          <span className={styles.btnIcon}>✓</span> موافقة على الإنشاء
        </button>
      </div>
    </div>
  );
};

export default FamRequests;
