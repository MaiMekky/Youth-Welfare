"use client";
import React from "react";
import styles from "../styles/headerCard.module.css";

interface HeaderCardProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const filters = [
  { id: "info",       label: "معلومات الدعم" },
  { id: "apply",      label: "تقديم طلب"     },
  { id: "myRequests", label: "طلباتي"         },
];

export default function HeaderCard({ activeTab, onTabChange }: HeaderCardProps) {
  return (
    <div className={styles["header-card-container"]}>
      {/*
        Hero card — tabs live INSIDE at the bottom,
        matching the StudentHero .student-hero pattern.
      */}
      <div className={styles["header-card"]}>

        {/* ── Text content ── */}
        <div className={styles["header-card__inner"]}>
          <div className={styles["header-card__text"]}>
            <h1 className={styles["header-title"]}>التكافل الاجتماعي</h1>
            <p className={styles["header-subtitle"]}>
              نظام الدعم المالي والاجتماعي لطلاب جامعة العاصمة
            </p>
          </div>
        </div>

        {/* ── Filter tabs flush to the bottom edge ── */}
        <div className={styles["header-card__filters"]}>
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