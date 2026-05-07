"use client";
import React from "react";
import FamilyAdBanner from "./FamilyAdBanner";
import StudentHero from "../../components/StudentHero";

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
      <StudentHero
        title="الأسر الطلابية"
        subtitle="انضم إلى الأسر الطلابية المتنوعة وكن جزءًا من مجتمع طلابي نشط"
      />

      <div className="fam-banner-wrap">
        <FamilyAdBanner onLearnMore={handleLearnMore} />
      </div>
    </>
  );
}