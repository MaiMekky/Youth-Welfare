"use client";

import React, { useMemo, useState } from "react";
import styles from "../styles/EventsGrid.module.css";
import EventCard, { EventItem } from "./EventCard";

const API_URL = "http://localhost:8000";

function getAccessToken(): string | null {
  return (
    localStorage.getItem("access") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    null
  );
}

async function apiFetch<T>(
  path: string,
  opts: RequestInit = {}
): Promise<{ ok: true; data: T } | { ok: false; message: string; status?: number; raw?: any }> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as any),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
    const text = await res.text();
    const maybeJson = text
      ? (() => {
          try {
            return JSON.parse(text);
          } catch {
            return text;
          }
        })()
      : null;

    if (!res.ok) {
      const msg =
        (typeof maybeJson === "object" && maybeJson && (maybeJson.detail || maybeJson.message)) ||
        (typeof maybeJson === "string" ? maybeJson : "") ||
        `طلب غير ناجح (${res.status})`;
      return { ok: false, message: String(msg), status: res.status, raw: maybeJson };
    }

    return { ok: true, data: maybeJson as T };
  } catch (e: any) {
    return { ok: false, message: e?.message || "مشكلة في الاتصال" };
  }
}

export default function EventsGrid({
  items,
  onView,
  onEdit,
  onDelete,
  onItemsChange,
}: {
  items: EventItem[];
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onItemsChange: (next: EventItem[]) => void;
}) {
  const safeItems = useMemo(() => items.filter(Boolean), [items]);
  const [busyId, setBusyId] = useState<number | null>(null);

  const onActiveChange = async (id: number, nextActive: boolean) => {
    setBusyId(id);


    const prev = safeItems;
    onItemsChange(
      prev.map((e) => (e.id === id ? { ...e, isActive: nextActive } : e))
    );

    const res = await apiFetch<any>(`/api/event/activate-events/${id}/activate/`, {
      method: "PATCH",
    });

    setBusyId(null);

    if (!res.ok) {

      onItemsChange(prev);
      window.alert(res.message);
      return;
    }

  };

  return (
    <div className={styles.grid}>
      {safeItems.map((e) => (
        <EventCard
          key={e.id}
          item={e}
          busy={busyId === e.id}
          onActiveChange={onActiveChange}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}