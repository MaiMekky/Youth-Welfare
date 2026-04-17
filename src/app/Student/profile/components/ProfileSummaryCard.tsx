"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import type { StudentProfile } from "../types";

interface ProfileSummaryCardProps {
  profileData: StudentProfile;
  onImageUpload: (file: File) => void;
}

export default function ProfileSummaryCard({
  profileData,
  onImageUpload,
}: ProfileSummaryCardProps) {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Preload image safely (no errors in console)
  useEffect(() => {
    if (profileData.profilePicture) {
      setIsLoading(true);

      const img = new window.Image();
      img.src = profileData.profilePicture;

      img.onload = () => {
        setProfileImage(profileData.profilePicture);
        setIsLoading(false);
      };

      img.onerror = () => {
        setProfileImage(null);
        setIsLoading(false);
      };
    } else {
      setProfileImage(null);
    }
  }, [profileData.profilePicture]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Preview instantly
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);

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
            {profileImage && !isLoading ? (
              <Image
                src={profileImage}
                alt="Profile"
                width={120}
                height={120}
                className="profile-image"
                unoptimized
              />
            ) : (
              <div className="profile-image-placeholder">
                <span>{isLoading ? "Loading..." : "صورة"}</span>
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