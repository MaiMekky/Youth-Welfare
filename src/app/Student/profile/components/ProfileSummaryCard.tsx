"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import type { StudentProfile } from "../types";

interface ProfileSummaryCardProps {
  profileData: StudentProfile;
  onImageUpload: (file: File) => void;
  isEditing: boolean;
  onCancelEdit: () => void;
}

export default function ProfileSummaryCard({
  profileData,
  onImageUpload,
  isEditing,
  onCancelEdit,
}: ProfileSummaryCardProps) {
  const [profileImage, setProfileImage] = useState(profileData.profilePicture);

  // Update image when profileData changes
  useEffect(() => {
    if (profileData.profilePicture) {
      console.log("Profile image URL:", profileData.profilePicture);
      setProfileImage(profileData.profilePicture);
    }
  }, [profileData.profilePicture]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Preview the image immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload the image
      onImageUpload(file);
    }
  };

  return (
    <div className="profile-summary-card">
      <div className="profile-summary-content">
        <div className="profile-info-section">
          <div className="profile-name-email">
            <h2 className="profile-name">{profileData.fullName}</h2>
            <p className="profile-email">{profileData.email}</p>
          </div>
          <div className="profile-academic-tags">
            <span className="profile-tag profile-tag-faculty">
              {profileData.facultyName || "-"}
            </span>
            <span className="profile-tag profile-tag-major">
              {profileData.major || "-"}
            </span>
            <span className="profile-tag profile-tag-year">
              {profileData.acd_year || "-"}
            </span>
          </div>
        </div>
        <div className="profile-image-section">
          <div className="profile-image-wrapper">
            {profileImage && profileImage.trim() !== "" && profileImage !== "/app/assets/profile.png" ? (
              <img
                src={profileImage}
                alt="Profile"
                width={120}
                height={120}
                className="profile-image"
                crossOrigin="anonymous"
                onError={(e) => {
                  console.error("Image load error. URL:", profileImage);
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  // Show placeholder on error
                  const placeholder = document.querySelector('.profile-image-placeholder') as HTMLElement;
                  if (placeholder) placeholder.style.display = 'flex';
                }}
                onLoad={() => {
                  console.log("Image loaded successfully:", profileImage);
                }}
              />
            ) : null}
            {(!profileImage || profileImage.trim() === "" || profileImage === "/app/assets/profile.png") && (
              <div className="profile-image-placeholder">
                <span>صورة</span>
              </div>
            )}
            <label className="profile-image-upload">
              <Camera size={28} />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

