"use client";
import React from "react";
import "../styles/headerCard.css";

interface HeaderCardProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function HeaderCard({ activeTab, onTabChange }: HeaderCardProps) {
  return (
    <header className="header-card-container">
      <div className="header-card">
        <h1 className="header-title">التكافل الاجتماعي</h1>
        <p className="header-subtitle">نظام الدعم المالي والاجتماعي لطلاب جامعة العاصمة</p>

        <div className="header-tabs">
          <button
            className={`tab-btn${activeTab === "info"       ? " active" : ""}`}
            onClick={() => onTabChange("info")}
          >
            معلومات الدعم
          </button>
          <button
            className={`tab-btn${activeTab === "apply"      ? " active" : ""}`}
            onClick={() => onTabChange("apply")}
          >
            تقديم طلب
          </button>
          <button
            className={`tab-btn${activeTab === "myRequests" ? " active" : ""}`}
            onClick={() => onTabChange("myRequests")}
          >
            طلباتي
          </button>
        </div>
      </div>
    </header>
  );
}