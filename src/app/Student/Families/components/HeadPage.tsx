"use client";
import React from "react";
import FamilyAdBanner from "./FamilyAdBanner";
import "../styles/HeadPage.css";

interface HeadPageProps {
  onCreateClick?: () => void;
  onReviewClick?: () => void;
}

export default function HeadPage({ onCreateClick }: HeadPageProps) {
  const handleLearnMore = () => {
    if (onCreateClick) {
      onCreateClick();
    }
  };

  return (
    <>
      <header className="header-card-container families-hero">
        <div className="header-card">
          <h1 className="header-title">الأسر الطلابية</h1>
          <p className="header-subtitle">
            انضم إلى الأسر الطلابية المتنوعة وكن جزءًا من مجتمع طلابي نشط
          </p>
        </div>
      </header>

      <div className="families-banner-wrap">
        <FamilyAdBanner onLearnMore={handleLearnMore} />
      </div>
    </>
  );
}
