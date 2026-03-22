"use client";
import React from "react";
import styles from "../Styles/FamilyCard.module.css";
import { useRouter } from "next/navigation";

interface FamilyCardProps {
  family: Record<string, unknown>;
  showActions: boolean;
  activeTab: string;
  onApprove?: (familyId: number) => void;
  onReject?: (familyId: number) => void;
  onToast?: (message: string, type: "success" | "error" | "warning") => void;
}

export default function FamilyCard({
  family,
  showActions,
  activeTab,
  onApprove,
  onReject,
  onToast,
}: FamilyCardProps) {
  const router = useRouter();

  const isEcoFamily     = family.type === "اصدقاء البيئة";
  const isCentralFamily = family.type === "مركزية";

  if (!family) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "موافقة مبدئية": return "#F3F5FD";
      default:              return "#E8EAF0";
    }
  };

  const handleApprove = () => {
    onApprove?.(Number(family.family_id));
    onToast?.("تمت الموافقة على الأسرة بنجاح", "success");
  };

  const handleReject = () => {
    onReject?.(Number(family.family_id));
    onToast?.("تم رفض الأسرة", "warning");
  };

  const handleViewDetails = () => {
    router.push(`/uni-level-family/details/${family.family_id}?tab=${activeTab}`);
  };

  const shouldShowApproveReject = showActions && family.status === "موافقة مبدئية" && !isEcoFamily;

  return (
    <div className={styles.familyCard}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.titleDescContainer}>
          <h3 className={styles.familyTitle}>{String(family.name)}</h3>
          <p className={styles.familyDescription}>{String(family.description)}</p>
        </div>
        <div className={styles.statusBadges}>
          <span
            className={styles.badge}
            style={{ backgroundColor: getStatusColor(String(family.status)), color: "#2C3A5F", fontWeight: 600 }}
          >
            {String(family.status)}
          </span>
        </div>
      </div>

      {/* Members */}
      <div className={styles.familyMeta}>
        <div className={styles.metaItem}>
          <span className={styles.metaIcon}></span>
          <span>{String(family.member_count)} عضو</span>
        </div>
      </div>

      {/* Info — hidden for central families */}
      {!isCentralFamily && (
        <div className={styles.familyInfo}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>الكلية:</span>
            <span className={styles.infoValue}>{String(family.faculty_name)}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>النوع:</span>
            <span className={styles.infoValue}>{String(family.type)}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className={styles.cardActions}>
        {shouldShowApproveReject && (
          <div className={styles.actionRow}>
            <button className={`${styles.btn} ${styles.btnApprove}`} onClick={handleApprove}>
              موافقة نهائية
            </button>
            <button className={`${styles.btn} ${styles.btnReject}`} onClick={handleReject}>
              رفض
            </button>
          </div>
        )}
        <button className={`${styles.btn} ${styles.btnDetails}`} onClick={handleViewDetails}>
          عرض التفاصيل
        </button>
      </div>
    </div>
  );
}