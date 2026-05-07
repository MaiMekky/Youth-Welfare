"use client";
import React from "react";
import styles from "../styles/headerCard.module.css";

interface HeaderCardProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const filters = [
  { id: "info", label: "معلومات الدعم" },
  { id: "apply", label: "تقديم طلب" },
  { id: "myRequests", label: "طلباتي" },
];

export default function HeaderCard({ activeTab, onTabChange }: HeaderCardProps) {
  return (
    <div className={styles["header-card-container"]}>
      {/* ── Hero card (no tabs inside) ── */}
      <div className={styles["header-card"]}>
        <h1 className={styles["header-title"]}>التكافل الاجتماعي</h1>
        <p className={styles["header-subtitle"]}>
          نظام الدعم المالي والاجتماعي لطلاب جامعة العاصمة
        </p>
      </div>

      {/* ── Gold segmented tab card ── */}
      <div className={styles["tab-card-wrapper"]}>
        <div className={styles["tab-card"]}>
          {filters.map((filter) => (
            <button
              key={filter.id}
              className={`${styles["tab-segment"]} ${
                activeTab === filter.id ? styles["active"] : ""
              }`}
              onClick={() => onTabChange(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}