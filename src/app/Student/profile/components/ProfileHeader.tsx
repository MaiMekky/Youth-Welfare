"use client";

import React from "react";
import { Edit } from "lucide-react";

interface ProfileHeaderProps {
  onEditProfile: () => void;
}

export default function ProfileHeader({
  onEditProfile,
}: ProfileHeaderProps) {
  return (
    <header className="profile-header header-card-container profile-hero">
      <div className="header-card profile-hero-card">
        <div className="profile-hero-main">
          <div className="profile-hero-text">
            <h1 className="header-title">ملفي الشخصي</h1>
            <p className="header-subtitle">
              بياناتك الجامعية وطرق التواصل في مكان واحد
            </p>
          </div>
          <div className="profile-header-actions">
            <button
              className="profile-btn profile-btn-primary profile-hero-edit"
              onClick={onEditProfile}
            >
              <Edit size={18} />
              <span>تعديل الملف الشخصي</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

