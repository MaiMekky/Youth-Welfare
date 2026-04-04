"use client";

import React from "react";
import FamilyCard from "./FamilyCard";
import styles from "../Styles/FamilyCard.module.css"; // Adjust path as needed

interface FamiliesGridProps {
  families: Record<string, unknown>[];
  showActions: boolean;
  activeTab: string;
  onApprove?: (familyId: number) => void;
  onReject?: (familyId: number) => void;
}
export default function FamiliesGrid({ families, showActions, activeTab, onApprove, onReject }: FamiliesGridProps) {
  if (!families || families.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
        لا توجد أسر متاحة
      </div>
    );
  }

  return (
    <div className={styles.familiesGrid}>
    {families.map((family) => (
  <FamilyCard
    key={String(family.family_id)}
    family={family}
    showActions={showActions}
    activeTab={activeTab}
    onApprove={onApprove}
    onReject={onReject}
  />
  
))}

    </div>
  );
}