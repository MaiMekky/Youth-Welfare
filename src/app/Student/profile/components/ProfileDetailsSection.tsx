"use client";

import React, { useState, useEffect } from "react";
import type { StudentProfile, UpdateProfileRequest } from "../types";

interface ProfileDetailsSectionProps {
  profileData: StudentProfile;
  faculties: { faculty_id: number; name: string }[];
  isEditing: boolean;
  onUpdateProfile: (data: UpdateProfileRequest) => void;
  onCancelEdit?: () => void;
}

export default function ProfileDetailsSection({
  profileData,
  faculties,
  isEditing,
  onUpdateProfile,
  onCancelEdit,
}: ProfileDetailsSectionProps) {
  const [editedData, setEditedData] = useState<UpdateProfileRequest>({
    name: profileData.fullName || "",
    email: profileData.email || "",
    phone_number: profileData.phoneNumber || "",
    address: profileData.address || "",
    acd_year: profileData.acd_year || "",
    grade: profileData.grade || "",
    major: profileData.major || "",
    faculty: profileData.faculty,
    gender: profileData.gender === "ذكر" ? "m" : profileData.gender === "أنثى" ? "f" : profileData.gender,
  });

  useEffect(() => {
    setEditedData({
      name: profileData.fullName || "",
      email: profileData.email || "",
      phone_number: profileData.phoneNumber || "",
      address: profileData.address || "",
      acd_year: profileData.acd_year || "",
      grade: profileData.grade || "",
      major: profileData.major || "",
      faculty: profileData.faculty,
      gender: profileData.gender === "ذكر" ? "m" : profileData.gender === "أنثى" ? "f" : profileData.gender,
    });
  }, [profileData]);

  const handleFieldChange = (field: keyof UpdateProfileRequest, value: string | number) => {
    setEditedData({ ...editedData, [field]: value });
  };

  const handleSavePersonalData = () => {
    onUpdateProfile(editedData);
  };

  return (
    <div className="profile-details-section">
      <div className="profile-personal-data">
        <div className="profile-section-header">
          <h3 className="profile-section-title">المعلومات الشخصية</h3>
        </div>

        <div className="profile-data-grid">
          <div className="profile-data-row">
            <div className="profile-data-field">
              <label className="profile-field-label">الاسم الكامل</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.name || ""}
                  onChange={(e) =>
                    handleFieldChange("name", e.target.value)
                  }
                  className="profile-field-input"
                  placeholder="أدخل الاسم الكامل"
                />
              ) : (
                <p className="profile-field-value">{profileData.fullName}</p>
              )}
            </div>
            <div className="profile-data-field">
              <label className="profile-field-label">كود الطالب</label>
              <p className="profile-field-value">{profileData.uid}</p>
            </div>
          </div>

          <div className="profile-data-row">
            <div className="profile-data-field">
              <label className="profile-field-label">النوع</label>
              {isEditing ? (
                <select
                  value={editedData.gender || ""}
                  onChange={(e) =>
                    handleFieldChange("gender", e.target.value)
                  }
                  className="profile-field-input"
                >
                  <option value="">اختر النوع</option>
                  <option value="m">ذكر</option>
                  <option value="f">أنثى</option>
                </select>
              ) : (
                <p className="profile-field-value">{profileData.gender || "-"}</p>
              )}
            </div>
            <div className="profile-data-field">
              <label className="profile-field-label">البريد الإلكتروني</label>
              {isEditing ? (
                <input
                  type="email"
                  value={editedData.email || ""}
                  onChange={(e) =>
                    handleFieldChange("email", e.target.value)
                  }
                  className="profile-field-input"
                  placeholder="أدخل البريد الإلكتروني"
                />
              ) : (
                <p className="profile-field-value">{profileData.email}</p>
              )}
            </div>
          </div>

          <div className="profile-data-row">
            <div className="profile-data-field">
              <label className="profile-field-label">رقم الهاتف</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedData.phone_number || ""}
                  onChange={(e) =>
                    handleFieldChange("phone_number", e.target.value)
                  }
                  className="profile-field-input"
                  placeholder="أدخل رقم الهاتف"
                />
              ) : (
                <p className="profile-field-value">
                  {profileData.phoneNumber || "-"}
                </p>
              )}
            </div>
            <div className="profile-data-field">
              <label className="profile-field-label">العنوان</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.address || ""}
                  onChange={(e) =>
                    handleFieldChange("address", e.target.value)
                  }
                  className="profile-field-input"
                  placeholder="أدخل العنوان"
                />
              ) : (
                <p className="profile-field-value">
                  {profileData.address || "-"}
                </p>
              )}
            </div>
          </div>

          <div className="profile-data-row">
            <div className="profile-data-field">
              <label className="profile-field-label">الكلية</label>
              {isEditing ? (
                <select
                  value={editedData.faculty || ""}
                  onChange={(e) =>
                    handleFieldChange("faculty", parseInt(e.target.value))
                  }
                  className="profile-field-input"
                >
                  <option value="">اختر الكلية</option>
                  {faculties.map((faculty) => (
                    <option key={faculty.faculty_id} value={faculty.faculty_id}>
                      {faculty.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="profile-field-value">
                  {profileData.facultyName || "-"}
                </p>
              )}
            </div>
            <div className="profile-data-field">
              <label className="profile-field-label">التخصص</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.major || ""}
                  onChange={(e) =>
                    handleFieldChange("major", e.target.value)
                  }
                  className="profile-field-input"
                  placeholder="أدخل التخصص"
                />
              ) : (
                <p className="profile-field-value">
                  {profileData.major || "-"}
                </p>
              )}
            </div>
          </div>

          <div className="profile-data-row">
            <div className="profile-data-field">
              <label className="profile-field-label">السنة الدراسية</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.acd_year || ""}
                  onChange={(e) =>
                    handleFieldChange("acd_year", e.target.value)
                  }
                  className="profile-field-input"
                  placeholder="أدخل السنة الدراسية"
                />
              ) : (
                <p className="profile-field-value">
                  {profileData.acd_year || "-"}
                </p>
              )}
            </div>
            <div className="profile-data-field">
              <label className="profile-field-label">المعدل التراكمي</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.grade || ""}
                  onChange={(e) =>
                    handleFieldChange("grade", e.target.value)
                  }
                  className="profile-field-input"
                  placeholder="أدخل المعدل التراكمي"
                />
              ) : (
                <p className="profile-field-value">
                  {profileData.grade || "-"}
                </p>
              )}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="profile-edit-actions">
            <button
              className="profile-save-btn"
              onClick={handleSavePersonalData}
            >
              حفظ التغييرات
            </button>
            {onCancelEdit && (
              <button
                className="profile-cancel-btn"
                onClick={() => {
                  // Reset edited data to original profile data
                  setEditedData({
                    name: profileData.fullName || "",
                    email: profileData.email || "",
                    phone_number: profileData.phoneNumber || "",
                    address: profileData.address || "",
                    acd_year: profileData.acd_year || "",
                    grade: profileData.grade || "",
                    major: profileData.major || "",
                    faculty: profileData.faculty,
                    gender: profileData.gender === "ذكر" ? "m" : profileData.gender === "أنثى" ? "f" : profileData.gender,
                  });
                  onCancelEdit();
                }}
              >
                إلغاء
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

