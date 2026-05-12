"use client";
import React from "react";
import InfoButtons from "./InfoButtons";
import StudentHero from "../../components/StudentHero";
import "../styles/HeadPage.css";

interface HeadPageProps {
  onCreateClick?: () => void;
  onReviewClick?: () => void;
  onUnionInfoClick?: () => void;
}

export default function HeadPage({ onCreateClick, onUnionInfoClick }: HeadPageProps) {
  return (
    <>
      <StudentHero
        title="الأسر الطلابية"
        subtitle="انضم إلى الأسر الطلابية المتنوعة وكن جزءًا من مجتمع طلابي نشط"
      />

      <InfoButtons 
        onFamilyInfoClick={onCreateClick}
        onUnionInfoClick={onUnionInfoClick}
      />
    </>
  );
}