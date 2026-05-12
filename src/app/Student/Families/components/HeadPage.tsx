"use client";
import React from "react";
import FamilyAdBanner from "./FamilyAdBanner";
import StudentHero from "../../components/StudentHero";
import "../styles/HeadPage.css";

interface HeadPageProps {
  onCreateClick?: () => void;
  onReviewClick?: () => void;
  onUnionInfoClick?: () => void;
}

export default function HeadPage({ onCreateClick, onUnionInfoClick }: HeadPageProps) {
  const handleLearnMore = () => {
    if (onCreateClick) {
      onCreateClick();
    }
  };

  return (
    <>
      <StudentHero
        title="الأسر الطلابية"
        subtitle="انضم إلى الأسر الطلابية المتنوعة وكن جزءًا من مجتمع طلابي نشط"
      />

      <div className="fam-banner-wrap">
        <FamilyAdBanner onLearnMore={handleLearnMore} />
      </div>

      {onUnionInfoClick && (
        <div className="union-info-banner">
          <button className="union-info-btn" onClick={onUnionInfoClick}>
            <span className="union-info-icon">📋</span>
            <div className="union-info-content">
              <h3>معلومات عن الإتحادات الطلابية</h3>
              <p>تعرف على دور الإتحادات الطلابية وكيفية الانضمام إليها</p>
            </div>
            <span className="union-info-arrow">←</span>
          </button>
        </div>
      )}
    </>
  );
}