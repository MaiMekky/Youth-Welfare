"use client";

import React, { useState } from "react";
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
            <Image
              src={profileImage || "/app/assets/profile.png"}
              alt="Profile"
              width={120}
              height={120}
              className="profile-image"
              unoptimized={profileImage?.startsWith('http://127.0.0.1') || profileImage?.startsWith('http://localhost')}
            />
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

