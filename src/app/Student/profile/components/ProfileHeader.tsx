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
    <div className="profile-header">
      <div className="profile-header-content">
        <div className="profile-header-text">
          <h1 className="profile-title">ملفي الشخصي</h1>
        </div>
        <div className="profile-header-actions">
          <button
            className="profile-btn profile-btn-primary"
            onClick={onEditProfile}
          >
            <Edit size={18} />
            <span>تعديل الملف الشخصي</span>
          </button>
        </div>
      </div>
    </div>
  );
}

