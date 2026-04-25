"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import type { StudentProfile } from "../types";

interface ProfileSummaryCardProps {
  profileData: StudentProfile;
  onImageUpload: (file: File, localPreview: string) => void;
}

export default function ProfileSummaryCard({
  profileData,
  onImageUpload,
}: ProfileSummaryCardProps) {
  const [profileImage, setProfileImage] = useState(profileData.profilePicture);

  // Keep in sync when parent updates profileData (e.g. after API confirms upload)
  useEffect(() => {
    if (profileData.profilePicture) setProfileImage(profileData.profilePicture);
  }, [profileData.profilePicture]);

  const hasValidImage =
    profileImage &&
    profileImage.trim() !== "" &&
    profileImage !== "/app/assets/profile.png";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = reader.result as string;
      // Show instantly in local state
      setProfileImage(preview);
      // Pass both file and preview up so parent can optimistically update profileData too
      onImageUpload(file, preview);
    };
    reader.readAsDataURL(file);
  };

  const initials = profileData.fullName ? profileData.fullName.charAt(0) : "ط";

  return (
    <div className="profile-summary-card" dir="rtl">
      {/* Avatar + upload */}
      <div className="profile-summary-card__avatar-wrap">
        {hasValidImage ? (
          <Image
            src={profileImage!}
            alt="Profile"
            width={96}
            height={96}
            className="profile-summary-card__avatar-img"
            crossOrigin="anonymous"
            onError={() => setProfileImage("")}
          />
        ) : (
          <div className="profile-summary-card__avatar-placeholder">
            {initials}
          </div>
        )}
        <label className="profile-summary-card__camera-btn" title="تغيير الصورة">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          <input type="file" accept="image/*" onChange={handleImageChange} hidden />
        </label>
      </div>

      {/* Name / email */}
      <div className="profile-summary-card__info">
        <h2 className="profile-summary-card__name">{profileData.fullName}</h2>
        <p className="profile-summary-card__email">{profileData.email}</p>
      </div>

      {/* Divider */}
      <div className="profile-summary-card__divider" />

      {/* Academic tags */}
      <div className="profile-summary-card__tags">
        {profileData.facultyName && (
          <span className="profile-tag profile-tag--faculty">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            {profileData.facultyName}
          </span>
        )}
        {profileData.major && (
          <span className="profile-tag profile-tag--major">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            {profileData.major}
          </span>
        )}
        {profileData.acd_year && (
          <span className="profile-tag profile-tag--year">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {profileData.acd_year}
          </span>
        )}
        {profileData.uid && (
          <span className="profile-tag profile-tag--uid">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            {profileData.uid}
          </span>
        )}
      </div>
    </div>
  );
}