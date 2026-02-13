"use client";
import React, { useEffect, useState } from "react";
import styles from "../Styles/Filters.module.css";

interface FiltersProps {
  selectedFaculty: string; // Changed to string for faculty name
  setSelectedFaculty: (v: string) => void;
  selectedFamilyType: string;
  setSelectedFamilyType: (v: string) => void;
}

export default function Filters({
  selectedFaculty,
  setSelectedFaculty,
  selectedFamilyType,
  setSelectedFamilyType,
}: FiltersProps) {
  const [faculties, setFaculties] = useState<{ faculty_id: number; name: string }[]>([]);
  const [facultiesLoading, setFacultiesLoading] = useState(false);

  // Fetch faculties from API
  useEffect(() => {
    const fetchFaculties = async () => {
      setFacultiesLoading(true);
      try {
        const token = localStorage.getItem("access");
        const response = await fetch("http://localhost:8000/api/solidarity/super_dept/faculties/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setFaculties(data);
        } else {
          console.error("Failed to fetch faculties");
        }
      } catch (error) {
        console.error("Error fetching faculties:", error);
      } finally {
        setFacultiesLoading(false);
      }
    };
    fetchFaculties();
  }, []);

  // Family types with labels
  const familyTypes = [
    { value: "all", label: "الكل" },
    { value: "نوعية", label: "نوعية" },
    { value: "اصدقاء البيئة", label: "اصدقاء البيئة" },
  ];

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>الكلية:</label>
        <select
          className={styles.filterSelect}
          value={selectedFaculty}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedFaculty(value);
          }}
          disabled={facultiesLoading}
        >
          {facultiesLoading ? (
            <option value="الكل" disabled>جاري تحميل الكليات...</option>
          ) : (
            <>
              <option value="الكل">الكل</option>
              {faculties.map((f, index) => (
                <option key={`faculty-${f.faculty_id}-${index}`} value={f.name}>
                  {f.name}
                </option>
              ))}
            </>
          )}
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>نوع الأسرة:</label>
        <select
          className={styles.filterSelect}
          value={selectedFamilyType}
          onChange={(e) => {
            setSelectedFamilyType(e.target.value);
          }}
        >
          {familyTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}