"use client";

import React, { useState, useEffect, useCallback } from "react";
import ProfileHeader from "./components/ProfileHeader";
import ProfileSummaryCard from "./components/ProfileSummaryCard";
import ProfileDetailsSection from "./components/ProfileDetailsSection";
import type { StudentProfile, StudentProfileAPIResponse, UpdateProfileRequest } from "./types";
import "../styles/profile.css";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";

/* ── API → UI mapper ────────────────────────────────────────── */
function mapApiToProfile(
  apiData: StudentProfileAPIResponse,
  faculties: { faculty_id: number; name: string }[],
  imageUrl: string
): StudentProfile {
  return {
    student_id: apiData.student_id,
    fullName: apiData.name,
    email: apiData.email,
    phoneNumber: apiData.phone_number || "",
    gender:
      apiData.gender?.toLowerCase() === "m" ? "ذكر"
      : apiData.gender?.toLowerCase() === "f" ? "أنثى"
      : apiData.gender || "",
    nid: apiData.nid,
    uid: apiData.uid,
    address: apiData.address || "",
    acd_year: apiData.acd_year || "",
    grade: apiData.grade || "",
    major: apiData.major || "",
    faculty: apiData.faculty,
    facultyName: faculties.find((f) => f.faculty_id === apiData.faculty)?.name || "",
    profilePicture: imageUrl,
  };
}

/* ── Page ───────────────────────────────────────────────────── */
export default function ProfilePage() {
  const [profileData, setProfileData] = useState<StudentProfile | null>(null);
  const [faculties, setFaculties] = useState<{ faculty_id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { showToast } = useToast();

  /* ── fetch blob image ── */
  const fetchProfileImage = useCallback(async (studentId: number): Promise<string> => {
    try {
      const res = await authFetch(`${getBaseUrl()}/api/files/students/${studentId}/image/`);
      if (!res.ok) return "/app/assets/profile.png";
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } catch {
      return "/app/assets/profile.png";
    }
  }, []);

  /* ── fetch faculties ── */
  useEffect(() => {
    const run = async () => {
      try {
        const res = await authFetch(`${getBaseUrl()}/api/family/faculties/`);
        if (res.ok) setFaculties(await res.json());
      } catch (e) {
        console.error("Faculties fetch error:", e);
      }
    };
    run();
  }, []);

  /* ── fetch profile (waits for faculties) ── */
  useEffect(() => {
    if (faculties.length === 0) return;
    const run = async () => {
      try {
        setLoading(true);
        const res = await authFetch(`${getBaseUrl()}/api/auth/profile/`);
        if (res.ok) {
          const apiData: StudentProfileAPIResponse = await res.json();
          const imageUrl = await fetchProfileImage(apiData.student_id);
          setProfileData(mapApiToProfile(apiData, faculties, imageUrl));
        }
      } catch (e) {
        console.error("Profile fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [faculties, fetchProfileImage]);

  /* ── image upload (optimistic preview) ── */
  const handleImageUpload = useCallback(
    async (file: File, localPreview: string) => {
      setProfileData((prev) => (prev ? { ...prev, profilePicture: localPreview } : prev));

      try {

        const formData = new FormData();
        formData.append("profile_photo", file);

        const res = await authFetch(`${getBaseUrl()}/api/auth/profile/update_profile/`, {
          method: "PATCH",
          body: formData,
        });

        if (res.ok) {
          const apiData: StudentProfileAPIResponse = await res.json();
          const imageUrl = await fetchProfileImage(apiData.student_id);
          setProfileData((prev) =>
            prev ? mapApiToProfile(apiData, faculties, imageUrl) : prev
          );
          showToast("تم تحديث الصورة بنجاح", "success");
        } else {
          showToast("حدث خطأ في رفع الصورة", "error");
        }
      } catch (e) {
        console.error("Image upload error:", e);
        showToast("حدث خطأ في رفع الصورة", "error");
      }
    },
    [faculties, fetchProfileImage, showToast]
  );

  /* ── save profile text fields ── */
  const handleSaveProfile = useCallback(
    async (updatedData: UpdateProfileRequest) => {
      try {
        if (!profileData) return;

        const formData = new FormData();

        // Only append fields accepted by the API PATCH spec:
        // faculty, phone_number, address, acd_year, grade, major
        // name, email, gender are intentionally excluded
        if (updatedData.faculty !== undefined && updatedData.faculty !== null) {
          formData.append("faculty", String(updatedData.faculty));
        }
        if (updatedData.phone_number !== undefined && updatedData.phone_number !== "") {
          formData.append("phone_number", updatedData.phone_number);
        }
        if (updatedData.address !== undefined && updatedData.address !== "") {
          formData.append("address", updatedData.address);
        }
        if (updatedData.acd_year !== undefined && updatedData.acd_year !== "") {
          formData.append("acd_year", updatedData.acd_year);
        }
        if (updatedData.grade !== undefined && updatedData.grade !== "") {
          formData.append("grade", updatedData.grade);
        }
        if (updatedData.major !== undefined && updatedData.major !== "") {
          formData.append("major", updatedData.major);
        }

        const res = await authFetch(`${getBaseUrl()}/api/auth/profile/update_profile/`, {
          method: "PATCH",
          body: formData,
        });

        if (res.ok) {
          const apiData: StudentProfileAPIResponse = await res.json();
          setProfileData((prev) => {
            const currentImage = prev?.profilePicture || "/app/assets/profile.png";
            return mapApiToProfile(apiData, faculties, currentImage);
          });
          setIsEditing(false);
          showToast("تم حفظ البيانات بنجاح", "success");
        } else {
          try {
            const errData = await res.json();
            console.error("Save error:", errData);
          } catch {}
          showToast("حدث خطأ في تحديث البيانات", "error");
        }
      } catch (e) {
        console.error("Save profile error:", e);
        showToast("حدث خطأ في تحديث البيانات", "error");
      }
    },
    [faculties, showToast]
  );

  /* ── render ── */
  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-loading__spinner" />
        <p>جاري التحميل...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-error">
        <p>حدث خطأ في تحميل البيانات</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <ProfileHeader onEditProfile={() => setIsEditing(true)} />
      <ProfileSummaryCard
        profileData={profileData}
        onImageUpload={handleImageUpload}
      />
      <ProfileDetailsSection
        profileData={profileData}
        faculties={faculties}
        isEditing={isEditing}
        onUpdateProfile={handleSaveProfile}
        onCancelEdit={() => setIsEditing(false)}
      />
    </div>
  );
}