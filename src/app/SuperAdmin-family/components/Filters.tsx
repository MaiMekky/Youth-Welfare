"use client";

import React from "react";
import styles from "../Styles/Filters.module.css";

interface Props {
  faculties: { faculty_id: number; name: string }[];
  familyTypes: string[];
  selectedFaculty: number;
  setSelectedFaculty: (v: number) => void;
  selectedFamilyType: string;
  setSelectedFamilyType: (v: string) => void;
  selectedStatus: string;
  setSelectedStatus: (v: string) => void;
}

export default function Filters({
  faculties,
  familyTypes,
  selectedFaculty,
  setSelectedFaculty,
  selectedFamilyType,
  setSelectedFamilyType,
  selectedStatus,
  setSelectedStatus,
}: Props) {
  const familyTypeLabels: Record<string, string> = {
    all: "الكل",
    "نوعية": "نوعية",
    "اصدقاء البيئة": "اصدقاء البيئة",
  };

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>الكلية</label>
        <select
          className={styles.filterSelect}
          value={String(selectedFaculty)}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (!isNaN(val)) setSelectedFaculty(val);
          }}
        >
          {faculties.map((f, index) => (
            <option key={`faculty-${f.faculty_id}-${index}`} value={f.faculty_id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>نوع الأسرة</label>
        <select
          className={styles.filterSelect}
          value={selectedFamilyType}
          onChange={(e) => setSelectedFamilyType(e.target.value)}
        >
          {familyTypes.map((t) => (
            <option key={t} value={t}>
              {familyTypeLabels[t] || t}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>حالة الأسرة</label>
        <select
          className={styles.filterSelect}
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="all">الكل</option>
          <option value="مقبول">مقبول</option>
          <option value="مرفوض">مرفوض</option>
          <option value="موافقة مبدئية">موافقة مبدئية</option>
          <option value="منتظر">منتظر</option>
        </select>
      </div>
    </div>
  );
}
