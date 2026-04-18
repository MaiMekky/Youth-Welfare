"use client";
import React, { useEffect, useState } from "react";
import styles from "../Styles/Filters.module.css";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";

interface FiltersProps {
  selectedFaculty: string;
  setSelectedFaculty: (v: string) => void;
  selectedFamilyType: string;
  setSelectedFamilyType: (v: string) => void;
  selectedStatus: string;
  setSelectedStatus: (v: string) => void;
  readyOnly: "all" | "true" | "false";
  setReadyOnly: (v: "all" | "true" | "false") => void;
}

export default function Filters({
  selectedFaculty,
  setSelectedFaculty,
  selectedFamilyType,
  setSelectedFamilyType,
  selectedStatus,
  setSelectedStatus,
  readyOnly,
  setReadyOnly,
}: FiltersProps) {
  const [faculties, setFaculties] = useState<{ faculty_id: number; name: string }[]>([]);
  const [facultiesLoading, setFacultiesLoading] = useState(false);

  useEffect(() => {
    const fetchFaculties = async () => {
      setFacultiesLoading(true);
      try {
        const token = localStorage.getItem("access");
        const response = await authFetch(`${getBaseUrl()}/api/family/faculties/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setFaculties(data);
        }
      } catch (error) {
        console.error("Error fetching faculties:", error);
      } finally {
        setFacultiesLoading(false);
      }
    };
    fetchFaculties();
  }, []);

  return (
    <div className={styles.filtersContainer}>
      {/* الكلية */}
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>الكلية</label>
        <select
          className={styles.filterSelect}
          value={selectedFaculty}
          onChange={(e) => setSelectedFaculty(e.target.value)}
          disabled={facultiesLoading}
        >
          <option value="الكل">الكل</option>
          {faculties.map((f) => (
            <option key={f.faculty_id} value={f.name}>{f.name}</option>
          ))}
        </select>
      </div>

      {/* نوع الأسرة */}
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>نوع الأسرة</label>
        <select
          className={styles.filterSelect}
          value={selectedFamilyType}
          onChange={(e) => setSelectedFamilyType(e.target.value)}
        >
          <option value="all">الكل</option>
          <option value="نوعية">نوعية</option>
          <option value="اصدقاء البيئة">اصدقاء البيئة</option>
        </select>
      </div>

      {/* حالة الأسرة */}
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

      {/* جاهزة للاعتماد */}
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>
          عرض الأسر الجاهزة للاعتماد النهائي (وصل عدد الاعضاء إلى الحد الأدنى)
        </label>
        <select
          className={styles.filterSelect}
          value={readyOnly}
          onChange={(e) => setReadyOnly(e.target.value as "all" | "true" | "false")}
        >
          <option value="all">الكل</option>
          <option value="true">نعم</option>
          <option value="false">لا</option>
        </select>
      </div>
    </div>
  );
}
