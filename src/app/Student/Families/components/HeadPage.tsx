"use client";
import React from "react";
import { useRouter } from "next/navigation";
import "../styles/HeadPage.css";

export default function HeadPage() {
  const router = useRouter();

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
    </div>
  );
}
