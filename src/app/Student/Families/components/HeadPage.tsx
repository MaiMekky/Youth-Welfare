"use client";
import React from "react";
import { useRouter } from "next/navigation";
import "../styles/HeadPage.css";

interface HeadPageProps {
  onCreateClick?: () => void;
  onReviewClick?: () => void;
}

const HeadPage: React.FC<HeadPageProps> = ({ onCreateClick, onReviewClick }) => {
  const router = useRouter();

  const handleReviewClick = () => {
    if (onReviewClick) {
      onReviewClick();
    } else {
      router.push("/Student/families/TrackRequest");
    }
  };

  const handleCreateClick = () => {
    if (onCreateClick) {
      onCreateClick();
    } else {
      router.push("/Student/families/CreateFamForm");
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

      {/* Buttons */}
      <div className="button-group">
        <button
          className="action-button button-secondary"
          onClick={handleCreateClick}
        >
          <span className="icon">+</span>
          انشاء طلب تكوين اسرة
        </button>
        <button
          className="action-button button-primary"
          onClick={handleReviewClick}
        >
          <span className="icon">📄</span>
          مراجعة طلب إنشاء أسرتك
        </button>
      </div>
    </div>
  );
};

export default HeadPage;
