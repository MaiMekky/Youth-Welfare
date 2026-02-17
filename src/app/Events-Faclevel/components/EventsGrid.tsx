"use client";

import React from "react";
import styles from "../styles/EventsPage.module.css";
import EventCard from "./EventCard";
import { EventRow } from "../page";
export default function EventsGrid({
  rows,
  onView,
  onDelete,
  canDelete,
}: {
  rows: EventRow[];
  onView: (id: number) => void;
  onDelete: (id: number) => void;
  canDelete: boolean;
}) {
  return (
    <section className={styles.cardsGrid}>
      {rows.map((e) => (
        <EventCard
          key={e.id}
          row={e}
          onView={onView}
          onDelete={onDelete}
          canDelete={canDelete}
        />
      ))}

      {!rows.length && <div className={styles.empty}>لا يوجد فعاليات في هذا التبويب.</div>}
    </section>
  );
}