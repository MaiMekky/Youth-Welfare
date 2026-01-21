"use client";
import React from "react";
import styles from "../Styles/FamilyCard.module.css";
import { useRouter } from "next/navigation";

interface FamilyCardProps {
  family: any;
  showActions: boolean;
  onApprove?: (familyId: number) => void;
  onReject?: (familyId: number) => void;
}

export default function FamilyCard({
  family,
  showActions,
  onApprove,
  onReject,
}: FamilyCardProps) {
  const router = useRouter();

  if (!family) return null;

  // دالة لتحديد لون الحالة
  const getStatusColor = (status: string) => {
    switch (status) {
      case "موافقة مبدئية":
        return "#F3F5FD"; 
      default:
        return "#E8EAF0"; 
    }
  };

  const handleApprove = () => {
    onApprove?.(family.family_id);
  };

  const handleReject = () => {
    onReject?.(family.family_id);
  };

  return (
    
    <div className={styles.familyCard}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.titleDescContainer}>
          <h3 className={styles.familyTitle}>{family.name}</h3>
          <p className={styles.familyDescription}>{family.description}</p>
        </div>

        <div className={styles.statusBadges}>
          <span
            className={styles.badge}
            style={{
              backgroundColor: getStatusColor(family.status),
              color: "#2C3A5F",
              fontWeight: 600,
            }}
          >
            {family.status}
          </span>
        </div>
      </div>

      {/* Members */}
      <div className={styles.familyMeta}>
        <div className={styles.metaItem}>
          <span className={styles.metaIcon}>👥</span>
          <span>{family.member_count} عضو</span>
        </div>
      </div>

      {/* Info */}
      <div className={styles.familyInfo}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>الكلية:</span>
          <span className={styles.infoValue}>{family.faculty_name}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>النوع:</span>
          <span className={styles.infoValue}>{family.type}</span>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.cardActions}>
        {showActions && (
          <div className={styles.actionRow}>
            <button
              className={`${styles.btn} ${styles.btnApprove}`}
              onClick={handleApprove}
            >
              موافقة نهائية
            </button>

            <button
              className={`${styles.btn} ${styles.btnReject}`}
              onClick={handleReject}
            >
              رفض
            </button>
          </div>
        )}

        {/* زر التفاصيل دايمًا موجود */}
        <button
          className={`${styles.btn} ${styles.btnDetails}`}
          onClick={() =>
            router.push(`/family-details?id=${family.family_id}`)
          }
        >
          عرض التفاصيل
        </button>
      </div>
    </div>
  );
}
