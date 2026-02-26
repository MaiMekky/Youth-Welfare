"use client";

import React from "react";
import styles from "../styles/PlansGrid.module.css";
import PlanCard from "./PlanCard";
import type { PlanItem } from "../page";

export default function PlansGrid({
  items,
  onView,
  onEdit,
}: {
  items: PlanItem[];
  onView: (id: number) => void;
  onEdit: (p: PlanItem) => void;
}) {
  return (
    <div className={styles.grid}>
      {items.map((p) => (
        <PlanCard key={p.id} item={p} onView={onView} onEdit={onEdit} />
      ))}
    </div>
  );
}