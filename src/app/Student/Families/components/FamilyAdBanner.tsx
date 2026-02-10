"use client";
import React from "react";
import "../styles/FamilyAdBanner.css";

interface FamilyAdBannerProps {
    onLearnMore: () => void;
}

const FamilyAdBanner: React.FC<FamilyAdBannerProps> = ({ onLearnMore }) => {
    return (
        <div className="ad-banner-container">
            <div className="ad-banner-card">
                <div className="ad-banner-icon">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                </div>

                <div className="ad-banner-content">
                    <h2 className="ad-banner-title">تعرف على أهم الشروط لتكوين أسرتك</h2>
                    <p className="ad-banner-description">
                        اكتشف متطلبات إنشاء أسرة طلابية جديدة والخطوات اللازمة للانضمام إلى مجتمعنا الطلابي النشط
                    </p>
                </div>

                <button className="ad-banner-button" onClick={onLearnMore}>
                    <span>تعرف على المزيد</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="arrow-icon"
                    >
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default FamilyAdBanner;
