"use client";
import React from "react";
import styles from "../styles/TrackReqButton.module.css";

interface TrackReqButtonProps {
  onCreateClick?: () => void;
  onReviewClick?: () => void;
}

const TrackReqButton: React.FC<TrackReqButtonProps> = ({ onCreateClick, onReviewClick }) => {
  const handleCreateClick = () => {
    if (onCreateClick) {
      onCreateClick();
    }
  };

  const handleReviewClick = () => {
    if (onReviewClick) {
      onReviewClick();
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.buttonGroup}>
        <button
          className={`${styles.actionButton} ${styles.buttonSecondary}`}
          onClick={handleCreateClick}
        >
          <span className={styles.icon}>+</span>
          انشاء طلب تكوين اسرة
        </button>
        <button
          className={`${styles.actionButton} ${styles.buttonPrimary}`}
          onClick={handleReviewClick}
        >
          <span className={styles.icon}>📄</span>
          مراجعة طلب إنشاء أسرتك
        </button>
      </div>
    </div>
  );
};

export default TrackReqButton;