"use client";
import React from "react";
import { useRouter } from "next/navigation";
import FamilyAdBanner from "./FamilyAdBanner";
import "../styles/HeadPage.css";

interface HeadPageProps {
  onCreateClick?: () => void;
  onReviewClick?: () => void;
}

export default function HeadPage({ onCreateClick }: HeadPageProps) {
  const router = useRouter();

  const handleLearnMore = () => {
    if (onCreateClick) {
      onCreateClick();
    }
  };

  return (
    <div className="page-container">
      {/* Header Card */}
      <div className="header-card">
        <h1 className="main-title">الأسر الطلابية</h1>
        <div className="separator-line"></div>

        <p className="description-text">
          انضم إلى الأسر الطلابية المتنوعة وكن جزءًا من مجتمع طلابي نشط
        </p>
      </div>

      {/* Advertisement Banner */}
      <FamilyAdBanner onLearnMore={handleLearnMore} />
    </div>
  );
}
