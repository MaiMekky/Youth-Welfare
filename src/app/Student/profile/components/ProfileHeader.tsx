"use client";
import React from "react";

interface ProfileHeaderProps {
  onEditProfile: () => void;
}

export default function ProfileHeader({ onEditProfile }: ProfileHeaderProps) {
  return (
    <div className="profile-page-header" dir="rtl">
      <div className="profile-page-header__text">
        <h1 className="profile-page-header__title">ملفي الشخصي</h1>
        <p className="profile-page-header__subtitle">
          بياناتك الجامعية وطرق التواصل في مكان واحد
        </p>
      </div>
      <button className="profile-page-header__edit-btn" onClick={onEditProfile}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
        تعديل الملف الشخصي
      </button>
    </div>
  );
}