"use client";
import React from "react";
import styles from "../Styles/Filters.module.css";

interface FiltersProps {
  faculties: string[];
  selectedFaculty: string;
  setSelectedFaculty: (faculty: string) => void;
}

export default function Filters({
  faculties,
  selectedFaculty,
  setSelectedFaculty,
}: FiltersProps) {
  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>الكلية:</label>
        <select
          className={styles.filterSelect}
          value={selectedFaculty}
          onChange={(e) => setSelectedFaculty(e.target.value)}
        >
          {faculties.map((faculty, index) => (
            <option key={index} value={faculty === "الكل" ? "all" : faculty}>
              {faculty}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}