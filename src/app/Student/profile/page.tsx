"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
    student_id:     apiData.student_id,
    fullName:       apiData.name,
    email:          apiData.email,
    phoneNumber:    apiData.phone_number || "",
    gender:
      apiData.gender?.toLowerCase() === "m" ? "ذكر"
      : apiData.gender?.toLowerCase() === "f" ? "أنثى"
      : apiData.gender || "",
    nid:            apiData.nid,
    uid:            apiData.uid,
    address:        apiData.address || "",
    acd_year:       apiData.acd_year || "",
    grade:          apiData.grade || "",
    major:          apiData.major || "",
    faculty:        apiData.faculty,
    facultyName:    faculties.find((f) => f.faculty_id === apiData.faculty)?.name ?? "",
    profilePicture: imageUrl,
  };
}

/* ── Page ───────────────────────────────────────────────────── */
export default function ProfilePage() {
  const [profileData, setProfileData] = useState<StudentProfile | null>(null);
  const [faculties, setFaculties]     = useState<{ faculty_id: number; name: string }[]>([]);
  const [loading, setLoading]         = useState(true);
  const [isEditing, setIsEditing]     = useState(false);
  const { showToast }                 = useToast();

  // Prevents the bootstrap effect from running more than once
  const didFetchRef = useRef(false);

  /* ── fetch blob image — stable, called only on explicit actions ── */
  const fetchProfileImage = useCallback(async (studentId: number): Promise<string> => {
    try {
      const res = await authFetch(`${getBaseUrl()}/api/files/students/${studentId}/image/`);
      // Treat ANY non-2xx (including 500 when no photo exists yet) as "no photo"
      if (!res.ok) return "/app/assets/profile.png";
      const blob = await res.blob();
      // Sanity-check the content type so we never create a broken object URL
      if (!blob.type.startsWith("image/")) return "/app/assets/profile.png";
      return URL.createObjectURL(blob);
    } catch {
      return "/app/assets/profile.png";
    }
  }, []); // no deps — never recreated, never causes effect re-runs

  /* ── one-time bootstrap: faculties → profile → image ── */
  useEffect(() => {
    // Hard guard: run exactly once per mount, no matter how deps resolve
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    const run = async () => {
      try {
        setLoading(true);

        // 1. Faculties (needed for name resolution)
        let fetchedFaculties: { faculty_id: number; name: string }[] = [];
        try {
          const facRes = await authFetch(`${getBaseUrl()}/api/family/faculties/`);
          if (facRes.ok) {
            fetchedFaculties = await facRes.json();
            setFaculties(fetchedFaculties);
          }
        } catch (e) {
          console.error("Faculties fetch error:", e);
        }

        // 2. Profile data
        const profileRes = await authFetch(`${getBaseUrl()}/api/auth/profile/`);
        if (!profileRes.ok) return;
        const apiData: StudentProfileAPIResponse = await profileRes.json();

        // 3. Image — fetched exactly once here; fallback handled inside fetchProfileImage
        const imageUrl = await fetchProfileImage(apiData.student_id);

        setProfileData(mapApiToProfile(apiData, fetchedFaculties, imageUrl));
      } catch (e) {
        console.error("Profile fetch error:", e);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [fetchProfileImage]); // fetchProfileImage is stable → effect runs once

  /* ── image upload (optimistic preview) ── */
  const handleImageUpload = useCallback(
    async (file: File, localPreview: string) => {
      setProfileData((prev) => (prev ? { ...prev, profilePicture: localPreview } : prev));

      try {
        const formData = new FormData();
        formData.append("profile_photo", file);

        const res = await authFetch(`${getBaseUrl()}/api/auth/profile/update_profile/`, {
          method: "PATCH",
          body:   formData,
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
      if (!profileData) return;

      try {
        const formData = new FormData();

        // Faculty: Django expects `faculty_id` in multipart FormData for FK fields.
        // Guard against NaN / 0 / null from the select.
        const facultyId = Number(updatedData.faculty);
        if (!isNaN(facultyId) && facultyId > 0) {
          formData.append("faculty_id", String(facultyId));
        }

        if (updatedData.phone_number) formData.append("phone_number", updatedData.phone_number);
        if (updatedData.address)      formData.append("address",      updatedData.address);
        if (updatedData.acd_year)     formData.append("acd_year",     updatedData.acd_year);
        if (updatedData.grade)        formData.append("grade",        updatedData.grade);
        if (updatedData.major)        formData.append("major",        updatedData.major);

        const res = await authFetch(`${getBaseUrl()}/api/auth/profile/update_profile/`, {
          method: "PATCH",
          body:   formData,
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
    [faculties, showToast, profileData]
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