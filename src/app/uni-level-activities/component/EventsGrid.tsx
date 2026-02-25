"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "../styles/EventsGrid.module.css";
import EventCard, { EventItem } from "./EventCard";

type Decision = "approved" | "rejected";

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
  // ✅ local decisions state (id -> approved/rejected)
  const [decisions, setDecisions] = useState<Record<number, Decision>>({});

  // ✅ initialize decisions from items (مرة أو عند تغيير items)
  useEffect(() => {
    setDecisions((prev) => {
      const next = { ...prev };
      for (const e of items.filter(Boolean)) {
        // لو مفيش قيمة قبل كده، حط default rejected
        if (!next[e.id]) next[e.id] = "rejected";
      }
      return next;
    });
  }, [items]);

  const safeItems = useMemo(() => items.filter(Boolean), [items]);

  return (
    <div className={styles.grid}>
      {safeItems.map((e) => (
        <EventCard
          key={e.id}
          item={e}
          decision={decisions[e.id] ?? "rejected"}
          onDecisionChange={(id, v) => {
            setDecisions((prev) => ({ ...prev, [id]: v }));
            console.log("decision changed:", id, v);

            // ✅ لو حابة تبعتي API هنا بعدين:
            // await fetch(`/api/events/${id}/decision`, { method:"PATCH", body: JSON.stringify({ decision: v }) })
          }}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}