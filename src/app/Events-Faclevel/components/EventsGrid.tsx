"use client";

import React, { useMemo, useState } from "react";
import styles from "../styles/EventsGrid.module.css";
import EventCard, { EventItem } from "./EventCard";
import { authFetch } from "@/utils/globalFetch";

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
): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await authFetch(`${API_URL}${path}`, { ...opts, headers });
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
        (typeof maybeJson === "object" &&
          maybeJson &&
          ((maybeJson as Record<string, unknown>).detail || (maybeJson as Record<string, unknown>).message)) ||
        (typeof maybeJson === "string" ? maybeJson : "") ||
        `طلب غير ناجح (${res.status})`;
      return { ok: false, message: String(msg) };
    }

    return { ok: true, data: maybeJson as T };
  } catch (e: unknown) {
    return { ok: false, message: e instanceof Error ? e.message : "مشكلة في الاتصال" };
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

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "warning";
  } | null>(null);

  const showNotification = (message: string, type: "success" | "error" | "warning") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2500);
  };

  const onActiveChange = async (id: number, nextActive: boolean) => {
    const current = safeItems.find((x) => x.id === id);
    if (!current) return;

    // ✅ لو التوجل مخفي (يعني عنده faculty id) منعملش حاجة
    if (current.hideToggle) return;

    setBusyId(id);
    const prev = safeItems;

    onItemsChange(prev.map((e) => (e.id === id ? { ...e, isActive: nextActive } : e)));

    const res = await apiFetch<{ active: boolean }>(`/api/event/activate-events/${id}/activate/`, {
      method: "POST",
    });

    setBusyId(null);

    if (!res.ok) {
      onItemsChange(prev);
      showNotification(res.message, "error");
      return;
    }

    onItemsChange(prev.map((e) => (e.id === id ? { ...e, isActive: res.data.active } : e)));
    showNotification("تم تحديث حالة الفعالية بنجاح", "success");
  };

  return (
    <>
      {notification && (
        <div className={`${styles.notification} ${notification.type === "success" ? styles.success : styles.error}`}>
          {notification.message}
        </div>
      )}

      <div className={styles.grid}>
        {safeItems.map((e) => (
          <EventCard
            key={e.id}
            item={e}
            busy={busyId === e.id}
            hideToggle={e.hideToggle}
            onActiveChange={e.hideToggle ? undefined : onActiveChange}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </>
  );
}