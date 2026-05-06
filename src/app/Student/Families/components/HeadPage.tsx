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
      <header className="scouts-hero">
        <h1 className="scouts-hero__title">الأسر الطلابية</h1>
        <p className="scouts-hero__sub">
          انضم إلى الأسر الطلابية المتنوعة وكن جزءًا من مجتمع طلابي نشط
        </p>
      </header>

      <div className="fam-banner-wrap">
        <FamilyAdBanner onLearnMore={handleLearnMore} />
      </div>
    </>
  );
}