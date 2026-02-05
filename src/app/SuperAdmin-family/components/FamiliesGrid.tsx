"use client";

import React from "react";
import FamilyCard from "./FamilyCard";
import styles from "../Styles/FamilyCard.module.css";


export default function FamiliesGrid({ families, showActions }: any) {
return (
<div className={styles.familiesGrid}>
{families.length > 0 ? (
families.map((f: any) => <FamilyCard key={f.id} family={f} showActions={showActions} />)
) : (
<div className={styles.emptyState}>لا توجد أسر تطابق الفلاتر المحددة</div>
)}
</div>
);
}