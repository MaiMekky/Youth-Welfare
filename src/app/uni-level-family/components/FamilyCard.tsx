"use client";
import React from "react";
import styles from "../Styles/FamilyCard.module.css";
import { useRouter } from "next/navigation";

export default function FamilyCard({ family, showActions }: any) {
  const router = useRouter();

  return (
    <div className={styles.familyCard}>
      {/* Title + Description + Badges */}
      <div className={styles.cardHeader}>
        <div className={styles.titleDescContainer}>
          <h3 className={styles.familyTitle}>{family.title}</h3>
          <p className={styles.familyDescription}>{family.description}</p>
        </div>
        <div className={styles.statusBadges}>
          {family.badge && (
            <span className={styles.badge} style={{ backgroundColor: family.badgeColor }}>
              {family.badge}
            </span>
          )}
          <span className={styles.badge} style={{ backgroundColor: family.statusColor }}>
            {family.status}
          </span>
        </div>
      </div>

      {/* Members */}
      <div className={styles.familyMeta}>
        <div className={styles.metaItem}>
          <span className={styles.metaIcon}> <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#2C3A5F" }}>
          <path d="M16 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM8 11c1.657 0 3-1.343 3-3S9.657 5 8 5 5 6.343 5 8s1.343 3 3 3z" />
          <path d="M8 13c-2.67 0-8 1.337-8 4v2h9.5c.634-.744 2.02-2 6.5-2 4.48 0 5.866 1.256 6.5 2H24v-2c0-2.663-5.33-4-8-4H8z" />
        </svg></span>
          <span>{family.members} عضو</span>
        </div>
      </div>

      {/* Family Info */}
      <div className={styles.familyInfo}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>النطاق:</span>
          <span className={styles.infoValue}>{family.scope}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>أنشئت بواسطة:</span>
          <span className={styles.infoValue}>{family.createdBy}</span>
        </div>
      </div>

      {/* Actions */}
     <div className={styles.cardActions}>
  {showActions && family.needsApproval ? (
    <>
      <div className={styles.actionRow}>
        <button className={`${styles.btn} ${styles.btnApprove}`}>موافقة</button>
        <button className={`${styles.btn} ${styles.btnReject}`}>رفض</button>
      </div>
      <button
        className={`${styles.btn} ${styles.btnDetails}`}
        onClick={() => router.push(`/uni-level-family/details/${family.id}`)}
      >
        عرض التفاصيل
      </button>
    </>
  ) : (
    <button
      className={`${styles.btn} ${styles.btnDetails}`}
      onClick={() => router.push(`/uni-level-family/details/${family.id}`)}
    >
      عرض التفاصيل
    </button>
  )}
</div>

  </div>
 
  );
}
