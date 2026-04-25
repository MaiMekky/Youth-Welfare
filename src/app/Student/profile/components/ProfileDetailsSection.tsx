"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { StudentProfile, UpdateProfileRequest } from "../types";

interface ProfileDetailsSectionProps {
  profileData: StudentProfile;
  faculties: { faculty_id: number; name: string }[];
  isEditing: boolean;
  onUpdateProfile: (data: UpdateProfileRequest) => void;
  onCancelEdit?: () => void;
}

/* ── Icons (stable references, defined outside component) ─── */
const ICON_USER = (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const ICON_MAIL = (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);
const ICON_PHONE = (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.79a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>
  </svg>
);
const ICON_LOCATION = (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const ICON_BOOK = (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);
const ICON_STAR = (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const ICON_CALENDAR = (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const ICON_HOME = (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const ICON_SECTION = (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
  </svg>
);
const ICON_SAVE = (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

/* ── Stable primitive components (OUTSIDE the main component) ── */
/* Defining these inside the component causes React to treat them
   as new component types on every render → inputs unmount/remount
   → focus lost after every keystroke.                             */

interface FieldProps {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}
function Field({ label, icon, children }: FieldProps) {
  return (
    <div className="pds-field">
      <label className="pds-field-label">
        <span className="pds-field-label__icon">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

interface PdsInputProps {
  type?: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
}
function PdsInput({ type = "text", value, onChange, placeholder }: PdsInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="pds-input"
      placeholder={placeholder}
      dir="rtl"
    />
  );
}

interface PdsSelectProps {
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  children: React.ReactNode;
}
function PdsSelect({ value, onChange, children }: PdsSelectProps) {
  return (
    <select value={value} onChange={onChange} className="pds-input" dir="rtl">
      {children}
    </select>
  );
}

/* ── Main Component ─────────────────────────────────────────── */
export default function ProfileDetailsSection({
  profileData,
  faculties,
  isEditing,
  onUpdateProfile,
  onCancelEdit,
}: ProfileDetailsSectionProps) {

  const buildBlank = useCallback((): UpdateProfileRequest => ({
    name: profileData.fullName || "",
    email: profileData.email || "",
    phone_number: profileData.phoneNumber || "",
    address: profileData.address || "",
    acd_year: profileData.acd_year || "",
    grade: profileData.grade || "",
    major: profileData.major || "",
    faculty: profileData.faculty,
    gender:
      profileData.gender === "ذكر" ? "m"
      : profileData.gender === "أنثى" ? "f"
      : profileData.gender || "",
  }), [profileData]);

  const [form, setForm] = useState<UpdateProfileRequest>(buildBlank);

  // Re-populate form whenever profileData changes (e.g. after a successful save)
  useEffect(() => {
    setForm(buildBlank());
  }, [buildBlank]);

  // Also reset form when edit mode is opened fresh
  useEffect(() => {
    if (isEditing) setForm(buildBlank());
  }, [isEditing, buildBlank]);

  const set = (field: keyof UpdateProfileRequest, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleCancel = () => {
    setForm(buildBlank());
    onCancelEdit?.();
  };

  const handleSave = () => {
    onUpdateProfile(form);
  };

  /* ── render ── */
  return (
    <div className="pds-wrapper" dir="rtl">

      {/* ── Personal ── */}
      <div className="pds-section">
        <div className="pds-section__header">
          <span className="pds-section__header-icon">{ICON_USER}</span>
          المعلومات الشخصية
        </div>
        <div className="pds-grid">

          <Field label="الاسم الكامل" icon={ICON_USER}>
            {isEditing ? (
              <PdsInput
                value={form.name || ""}
                onChange={(e) => set("name", e.target.value)}
                placeholder="أدخل الاسم الكامل"
              />
            ) : (
              <p className="pds-field-value">{profileData.fullName || "—"}</p>
            )}
          </Field>

          <Field label="كود الطالب" icon={ICON_SECTION}>
            <p className="pds-field-value">{profileData.uid || "—"}</p>
          </Field>

          <Field label="النوع" icon={ICON_USER}>
            {isEditing ? (
              <PdsSelect
                value={form.gender || ""}
                onChange={(e) => set("gender", e.target.value)}
              >
                <option value="">اختر النوع</option>
                <option value="m">ذكر</option>
                <option value="f">أنثى</option>
              </PdsSelect>
            ) : (
              <p className="pds-field-value">{profileData.gender || "—"}</p>
            )}
          </Field>

          <Field label="البريد الإلكتروني" icon={ICON_MAIL}>
            {isEditing ? (
              <PdsInput
                type="email"
                value={form.email || ""}
                onChange={(e) => set("email", e.target.value)}
                placeholder="أدخل البريد الإلكتروني"
              />
            ) : (
              <p className="pds-field-value">{profileData.email || "—"}</p>
            )}
          </Field>

          <Field label="رقم الهاتف" icon={ICON_PHONE}>
            {isEditing ? (
              <PdsInput
                type="tel"
                value={form.phone_number || ""}
                onChange={(e) => set("phone_number", e.target.value)}
                placeholder="أدخل رقم الهاتف"
              />
            ) : (
              <p className="pds-field-value">{profileData.phoneNumber || "—"}</p>
            )}
          </Field>

          <Field label="العنوان" icon={ICON_LOCATION}>
            {isEditing ? (
              <PdsInput
                value={form.address || ""}
                onChange={(e) => set("address", e.target.value)}
                placeholder="أدخل العنوان"
              />
            ) : (
              <p className="pds-field-value">{profileData.address || "—"}</p>
            )}
          </Field>

        </div>
      </div>

      {/* ── Academic ── */}
      <div className="pds-section">
        <div className="pds-section__header">
          <span className="pds-section__header-icon">{ICON_BOOK}</span>
          المعلومات الأكاديمية
        </div>
        <div className="pds-grid">

          <Field label="الكلية" icon={ICON_HOME}>
            {isEditing ? (
              <PdsSelect
                value={form.faculty ?? ""}
                onChange={(e) => set("faculty", parseInt(e.target.value, 10))}
              >
                <option value="">اختر الكلية</option>
                {faculties.map((f) => (
                  <option key={f.faculty_id} value={f.faculty_id}>
                    {f.name}
                  </option>
                ))}
              </PdsSelect>
            ) : (
              <p className="pds-field-value">{profileData.facultyName || "—"}</p>
            )}
          </Field>

          <Field label="التخصص" icon={ICON_BOOK}>
            {isEditing ? (
              <PdsInput
                value={form.major || ""}
                onChange={(e) => set("major", e.target.value)}
                placeholder="أدخل التخصص"
              />
            ) : (
              <p className="pds-field-value">{profileData.major || "—"}</p>
            )}
          </Field>

          <Field label="السنة الدراسية" icon={ICON_CALENDAR}>
            {isEditing ? (
              <PdsInput
                value={form.acd_year || ""}
                onChange={(e) => set("acd_year", e.target.value)}
                placeholder="أدخل السنة الدراسية"
              />
            ) : (
              <p className="pds-field-value">{profileData.acd_year || "—"}</p>
            )}
          </Field>

          <Field label="المعدل التراكمي" icon={ICON_STAR}>
            {isEditing ? (
              <PdsInput
                value={form.grade || ""}
                onChange={(e) => set("grade", e.target.value)}
                placeholder="أدخل المعدل التراكمي"
              />
            ) : (
              <p className="pds-field-value">{profileData.grade || "—"}</p>
            )}
          </Field>

        </div>
      </div>

      {/* ── Actions ── */}
      {isEditing && (
        <div className="pds-actions">
          <button className="pds-btn pds-btn--cancel" onClick={handleCancel}>
            إلغاء
          </button>
          <button className="pds-btn pds-btn--save" onClick={handleSave}>
            {ICON_SAVE}
            حفظ التغييرات
          </button>
        </div>
      )}
    </div>
  );
}