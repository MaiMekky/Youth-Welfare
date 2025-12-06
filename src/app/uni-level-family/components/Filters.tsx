"use client";
import React from "react";
import styles from "../Styles/Filters.module.css";


interface Props {
faculties: string[];
familyTypes: string[];
selectedFaculty: string;
setSelectedFaculty: (v: string) => void;
selectedFamilyType: string;
setSelectedFamilyType: (v: string) => void;
}


export default function Filters({ faculties, familyTypes, selectedFaculty, setSelectedFaculty, selectedFamilyType, setSelectedFamilyType }: Props) {
return (
<div className={styles.filtersContainer}>
<div className={styles.filterGroup}>
<label className={styles.filterLabel}>الكلية:</label>
<select
className={styles.filterSelect}
value={selectedFaculty}
onChange={(e) => setSelectedFaculty(e.target.value)}
>
{faculties.map((f) => (
<option key={f} value={f === 'الكل' ? 'all' : f}>
{f}
</option>
))}
</select>
</div>


<div className={styles.filterGroup}>
<label className={styles.filterLabel}>نوع الأسرة:</label>
<select
className={styles.filterSelect}
value={selectedFamilyType}
onChange={(e) => setSelectedFamilyType(e.target.value)}
>
{familyTypes.map((t) => (
<option key={t} value={t === 'الكل' ? 'all' : t}>
{t}
</option>
))}
</select>
</div>
</div>
);
}