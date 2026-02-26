"use client";

import React from "react";
import styles from "../styles/EventsPage.module.css";
import EventCard from "./EventCard";
import { EventRow } from "../page";

export default function EventsGrid({
  rows,
  onView,
  onEdit,
  onDelete,
  canDelete,

  onActiveChange,
  busyId,
}: {
  rows: EventRow[];
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  canDelete: boolean;

  onActiveChange?: (id: number, next: boolean) => void;
  busyId?: number | null;
}) {
  return (
    <section className={styles.cardsGrid}>
      {rows.map((e) => (
        <EventCard
          key={e.id}
          row={e}
          onEdit={onEdit}
          onView={onView}
          onDelete={onDelete}
          canDelete={canDelete}
          showToggle={e.scope === "faculty"}
          busy={busyId === e.id}
          onActiveChange={onActiveChange}
        />
      ))}

      {!rows.length && <div className={styles.empty}>لا يوجد فعاليات في هذا التبويب.</div>}
    </section>
  );
}