"use client";

import React from "react";
import styles from "../styles/EventsGrid.module.css";
import EventCard, { EventItem } from "./EventCard";

export default function EventsGrid({
  items,
  onView,
  onEdit,
  onDelete,
}: {
  items: EventItem[];
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className={styles.grid}>
      {items.filter(Boolean).map((e) => (
        <EventCard
          key={e.id}
          item={e}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
