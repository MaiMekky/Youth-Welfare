"use client";
import React from "react";
import styles from "../styles/TrackReqButton.module.css";
import { Plus, FileSearch } from "lucide-react";

interface TrackReqButtonProps {
  onCreateClick?: () => void;
  onReviewClick?: () => void;
}

const TrackReqButton: React.FC<TrackReqButtonProps> = ({ onCreateClick, onReviewClick }) => {
  return (
    <div className={styles.heroCard}>
      {/* Background decoration */}
      <div className={styles.heroBg} aria-hidden />

      <div className={styles.heroInner}>
        {/* Left: text block */}
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>إدارة الأسر الطلابية</h1>
          <p className={styles.heroSub}>
            أنشئ أسرتك الطلابية أو تابع حالة طلبك بكل سهولة من هنا
          </p>
        </div>

        {/* Right: action buttons */}
        <div className={styles.heroActions}>
          <button className={styles.btnPrimary} onClick={onCreateClick}>
            <Plus size={17} strokeWidth={2.5} />
            إنشاء طلب أسرة
          </button>
          <button className={styles.btnSecondary} onClick={onReviewClick}>
            <FileSearch size={17} strokeWidth={2} />
            متابعة الطلب
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackReqButton;