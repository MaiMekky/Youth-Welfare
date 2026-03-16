"use client";
import React from "react";
import FamilyCard from "./FamilyCard";
import styles from "../Styles/FamilyCard.module.css";

export default function FamiliesGrid({ families, showActions, loading }: any) {
  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>جارٍ تحميل البيانات...</p>
      </div>
    );
  }

  if (families.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <h3 className={styles.emptyTitle}>لا توجد أسر</h3>
        <p className={styles.emptyDesc}>
          لم يتم العثور على أي أسر طلابية تطابق  البحث 
        </p>
      </div>
    );
  }

  return (
    <div className={styles.familiesGrid}>
      {families.map((f: any) => (
        <FamilyCard key={f.id} family={f} showActions={showActions} />
      ))}
    </div>
  );
}