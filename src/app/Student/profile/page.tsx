"use client";

import React, { useState, useEffect } from "react";
import ProfileHeader from "./components/ProfileHeader";
import ProfileSummaryCard from "./components/ProfileSummaryCard";
import ProfileDetailsSection from "./components/ProfileDetailsSection";
import type { StudentProfile, StudentProfileAPIResponse, UpdateProfileRequest } from "./types";
import "../styles/profile.css";

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<StudentProfile | null>(null);
  const [faculties, setFaculties] = useState<{ faculty_id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch faculties list
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const token = localStorage.getItem("access");
        if (!token) return;
        
        const response = await fetch(
          "http://127.0.0.1:8000/api/solidarity/super_dept/faculties/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setFaculties(data);
        }
      } catch (error) {
        console.error("Error fetching faculties:", error);
      }
    };

    fetchFaculties();
  }, []);

  // Fetch profile data from API
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access");
        if (!token) {
          console.error("No access token found");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "http://127.0.0.1:8000/api/auth/profile/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const apiData: StudentProfileAPIResponse = await response.json();
          // Map API response to UI format
          const facultyName = faculties.find(f => f.faculty_id === apiData.faculty)?.name || "";
          // Convert relative URL to absolute if needed
          let profilePictureUrl = apiData.profile_photo_url || "/app/assets/profile.png";
          if (profilePictureUrl && !profilePictureUrl.startsWith('http') && !profilePictureUrl.startsWith('/')) {
            // If it's a relative URL, make it absolute
            profilePictureUrl = `http://127.0.0.1:8000${profilePictureUrl.startsWith('/') ? '' : '/'}${profilePictureUrl}`;
          } else if (profilePictureUrl && profilePictureUrl.startsWith('/media/')) {
            // If it starts with /media/, add the base URL
            profilePictureUrl = `http://127.0.0.1:8000${profilePictureUrl}`;
          }
          
          const mappedData: StudentProfile = {
            student_id: apiData.student_id,
            fullName: apiData.name,
            email: apiData.email,
            phoneNumber: apiData.phone_number || "",
            gender: apiData.gender === "m" ? "ذكر" : apiData.gender === "f" ? "أنثى" : apiData.gender,
            nid: apiData.nid,
            uid: apiData.uid,
            address: apiData.address || "",
            acd_year: apiData.acd_year || "",
            grade: apiData.grade || "",
            major: apiData.major || "",
            faculty: apiData.faculty,
            facultyName: facultyName,
            profilePicture: profilePictureUrl,
          };
          setProfileData(mappedData);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("Error fetching profile:", errorData);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have faculties loaded or if faculties array is empty (will retry)
    if (faculties.length > 0) {
      fetchProfileData();
    }
  }, [faculties]);

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleImageUpload = async (file: File) => {
    try {
      const token = localStorage.getItem("access");
      if (!token || !profileData) return;

      const formData = new FormData();
      formData.append("profile_photo", file);

      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/profile/update_profile/",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const apiData: StudentProfileAPIResponse = await response.json();
        // Map API response to UI format
        const facultyName = faculties.find(f => f.faculty_id === apiData.faculty)?.name || "";
        
        // Convert relative URL to absolute if needed
        let profilePictureUrl = apiData.profile_photo_url || "/app/assets/profile.png";
        if (profilePictureUrl && profilePictureUrl.startsWith('/media/')) {
          // If it starts with /media/, add the base URL
          profilePictureUrl = `http://127.0.0.1:8000${profilePictureUrl}`;
        } else if (profilePictureUrl && !profilePictureUrl.startsWith('http') && !profilePictureUrl.startsWith('/app/')) {
          // If it's a relative URL (not starting with /app/), make it absolute
          profilePictureUrl = `http://127.0.0.1:8000${profilePictureUrl.startsWith('/') ? '' : '/'}${profilePictureUrl}`;
        }
        
        const mappedData: StudentProfile = {
          student_id: apiData.student_id,
          fullName: apiData.name,
          email: apiData.email,
          phoneNumber: apiData.phone_number || "",
          gender: apiData.gender === "m" ? "ذكر" : apiData.gender === "f" ? "أنثى" : apiData.gender,
          nid: apiData.nid,
          uid: apiData.uid,
          address: apiData.address || "",
          acd_year: apiData.acd_year || "",
          grade: apiData.grade || "",
          major: apiData.major || "",
          faculty: apiData.faculty,
          facultyName: facultyName,
          profilePicture: profilePictureUrl,
        };
        setProfileData(mappedData);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error uploading image:", errorData);
        alert("حدث خطأ في رفع الصورة");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("حدث خطأ في رفع الصورة");
    }
  };

  const handleSaveProfile = async (updatedData: UpdateProfileRequest) => {
    try {
      const token = localStorage.getItem("access");
      if (!token || !profileData) return;

      const formData = new FormData();
      
      // Only append fields that have values (excluding profile_photo)
      if (updatedData.name !== undefined && updatedData.name !== "") {
        formData.append("name", updatedData.name);
      }
      if (updatedData.email !== undefined && updatedData.email !== "") {
        formData.append("email", updatedData.email);
      }
      if (updatedData.faculty !== undefined) {
        formData.append("faculty", updatedData.faculty.toString());
      }
      if (updatedData.gender !== undefined && updatedData.gender !== "") {
        formData.append("gender", updatedData.gender);
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

      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/profile/update_profile/",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const apiData: StudentProfileAPIResponse = await response.json();
        // Map API response to UI format
        const facultyName = faculties.find(f => f.faculty_id === apiData.faculty)?.name || "";
        
        // Convert relative URL to absolute if needed
        let profilePictureUrl = apiData.profile_photo_url || "/app/assets/profile.png";
        if (profilePictureUrl && profilePictureUrl.startsWith('/media/')) {
          // If it starts with /media/, add the base URL
          profilePictureUrl = `http://127.0.0.1:8000${profilePictureUrl}`;
        } else if (profilePictureUrl && !profilePictureUrl.startsWith('http') && !profilePictureUrl.startsWith('/app/')) {
          // If it's a relative URL (not starting with /app/), make it absolute
          profilePictureUrl = `http://127.0.0.1:8000${profilePictureUrl.startsWith('/') ? '' : '/'}${profilePictureUrl}`;
        }
        
        const mappedData: StudentProfile = {
          student_id: apiData.student_id,
          fullName: apiData.name,
          email: apiData.email,
          phoneNumber: apiData.phone_number || "",
          gender: apiData.gender === "m" ? "ذكر" : apiData.gender === "f" ? "أنثى" : apiData.gender,
          nid: apiData.nid,
          uid: apiData.uid,
          address: apiData.address || "",
          acd_year: apiData.acd_year || "",
          grade: apiData.grade || "",
          major: apiData.major || "",
          faculty: apiData.faculty,
          facultyName: facultyName,
          profilePicture: profilePictureUrl,
        };
        setProfileData(mappedData);
        setIsEditing(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error updating profile:", errorData);
        alert("حدث خطأ في تحديث البيانات");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("حدث خطأ في تحديث البيانات");
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
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
      <ProfileHeader
        onEditProfile={handleEditProfile}
      />
      <ProfileSummaryCard
        profileData={profileData}
        onImageUpload={handleImageUpload}
        isEditing={isEditing}
        onCancelEdit={handleCancelEdit}
      />
      <ProfileDetailsSection
        profileData={profileData}
        faculties={faculties}
        isEditing={isEditing}
        onUpdateProfile={handleSaveProfile}
        onCancelEdit={handleCancelEdit}
      />
    </div>
  );
}
