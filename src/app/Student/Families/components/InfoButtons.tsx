"use client";
import React from "react";
import "../styles/InfoButtons.css";

interface InfoButtonsProps {
  onFamilyInfoClick?: () => void;
  onUnionInfoClick?: () => void;
}

export default function InfoButtons({ onFamilyInfoClick, onUnionInfoClick }: InfoButtonsProps) {
  return (
    <div className="info-buttons-container">
      <div className="info-buttons-wrapper">
        {/* Button 1: Family Creation Info */}
        {onFamilyInfoClick && (
          <button className="info-btn info-btn-family" onClick={onFamilyInfoClick}>
            <span className="info-btn-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
            <div className="info-btn-content">
              <h3>تعرف على شروط تكوين أسرة</h3>
              <p>اكتشف متطلبات إنشاء أسرة طلابية جديدة</p>
            </div>
            <span className="info-btn-arrow">←</span>
          </button>
        )}

        {/* Button 2: Union Info */}
        {onUnionInfoClick && (
          <button className="info-btn info-btn-union" onClick={onUnionInfoClick}>
            <span className="info-btn-icon">📋</span>
            <div className="info-btn-content">
              <h3>معلومات عن اتحاد الطلبة</h3>
              <p>تعرف على دور الإتحادات الطلابية</p>
            </div>
            <span className="info-btn-arrow">←</span>
          </button>
        )}
      </div>
    </div>
  );
}
