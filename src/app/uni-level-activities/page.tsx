"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./styles/EventsPage.module.css";
import EventsGrid from "./component/EventsGrid";
import StatsGrid from "./component/StatsGrid";
import type { StatItem } from "./component/StatsGrid";
import { EventItem, ChipVariant } from "./component/EventCard";
import { useRouter } from "next/navigation";
import { Plus, CalendarX } from "lucide-react";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
const API_URL = getBaseUrl();

type ApiEvent = {
  event_id: number;
  title: string;
  description: string;
  st_date: string;
  end_date: string;
  location: string;
  status: Record<string, unknown>;
  type: string;
  cost: string;
  s_limit: number;
  faculty_id: number | null;
  faculty_name: string | null;
  dept_id: number;
  active?: Record<string, unknown>;
};

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
): Promise<{ ok: true; data: T } | { ok: false; message: string; status?: number; raw?: unknown }> {
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
          ((maybeJson as Record<string, unknown>).detail || (maybeJson as Record<string, unknown>).message || (maybeJson as Record<string, unknown>).error)) ||
        (typeof maybeJson === "string" ? maybeJson : "") ||
        `طلب غير ناجح (${res.status})`;

      return { ok: false, message: String(msg), status: res.status, raw: maybeJson };
    }

    return { ok: true, data: maybeJson as T };
  } catch (e: unknown) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) || "مشكلة في الاتصال" };
  }
}

function toBool(v: unknown): boolean | null {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1 ? true : v === 0 ? false : null;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true" || s === "1" || s === "yes") return true;
    if (s === "false" || s === "0" || s === "no") return false;
  }
  return null;
}

function statusVariant(status: string): ChipVariant {
  const s = (status || "").trim();
  if (s === "نشط") return "success";
  if (s === "منتظر") return "primary";
  if (s === "مكتمل") return "info";
  if (s === "غير نشط" || s === "ملغي" || s === "مرفوض") return "danger";
  return "purple";
}

function categoryVariant(): ChipVariant {
  return "info";
}

function toPriceText(cost: string) {
  const n = Number(String(cost || "").trim());
  if (!Number.isFinite(n) || n === 0) return "مجاني";
  return `${n} جنيه`;
}

function toEventItem(e: ApiEvent): EventItem {
  const apiActive = toBool(e.active);
  const statusBool = toBool(e.status);
  const statusText = typeof e.status === "string" ? e.status : "";
  const isActive = apiActive ?? statusBool ?? Boolean(statusText && statusText === "نشط");

  return {
    id: e.event_id,
    title: e.title ?? "",
    planName: e.description ?? "",
    statusLabel: statusText ?? "",
    statusVariant: statusVariant(statusText),
    categoryLabel: e.type ?? "",
    categoryVariant: categoryVariant(),
    date: e.st_date || "",
    time: e.end_date || "",
    location: e.location ?? "",
    participantsText: `الحد الأقصى: ${e.s_limit ?? 0}`,
    priceText: toPriceText(e.cost),
    isActive: Boolean(isActive),
    hideToggle: e.faculty_id !== null,
    facultyName: e.faculty_name ?? "فعالية على مستوى الجامعة",
  };
}

type NotifType = "success" | "error" | "warning";
type Faculty = { faculty_id: number; name: string };

export default function Page() {
  const router = useRouter();
  const goCreate = () => router.push("/uni-level-activities/create");

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: NotifType } | null>(null);

  const showNotification = (message: string, type: NotifType) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2500);
  };

  const fetchFaculties = async () => {
    const res = await apiFetch<Faculty[]>("/api/family/faculties/", { method: "GET" });
    if (!res.ok) { showNotification("فشل تحميل الكليات", "error"); return; }
    setFaculties(res.data);
  };

  const fetchEvents = async () => {
    setLoading(true);
    const res = await apiFetch<ApiEvent[]>("/api/event/get-events/", { method: "GET" });
    setLoading(false);
    if (!res.ok) { showNotification(res.message || "فشل تحميل الفعاليات", "error"); return; }
    const list = Array.isArray(res.data) ? res.data : [];
    setEvents(list.map((e) => toEventItem(e)));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchFaculties(); }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (faculties.length) fetchEvents(); }, [faculties]);

  const stats: StatItem[] = useMemo(() => {
    const active   = events.filter((e) => e.isActive).length;
    const inactive = events.filter((e) => !e.isActive).length;
    const total    = events.length;
    return [
      { title: "إجمالي الفعاليات",   value: String(total),    meta: "", icon: "calendar", accent: "gold"   },
      { title: "الفعاليات النشطة",    value: String(active),   meta: "", icon: "check",    accent: "green"  },
      { title: "فعاليات غير نشطة",   value: String(inactive), meta: "", icon: "clock",    accent: "indigo" },
    ];
  }, [events]);

  const onView   = (id: number) => router.push(`/uni-level-activities/${id}`);
  const onEdit   = (id: number) => router.push(`/uni-level-activities/create/${id}`);
  const onDelete = async (id: number) => {
    const prev = events;
    const res = await apiFetch<Record<string, unknown>>(`/api/event/get-events/${id}/`, { method: "DELETE" });
    if (!res.ok) { setEvents(prev); showNotification(res.message || "فشل الغاء الفعالية", "error"); return; }
    showNotification("✅ تم الغاء الفعالية بنجاح", "success");
    await fetchEvents();
  };

  return (
    <div className={styles.page}>
      {notification && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )}

      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>إدارة الفعاليات</h1>
            <p className={styles.pageSubtitle}>إنشاء وتعديل وإدارة فعاليات الجامعة</p>
          </div>
          <button className={styles.createBtnTop} onClick={goCreate}>
            <Plus size={18} />
            إنشاء فعالية جديدة
          </button>
        </div>

        <StatsGrid items={stats} />

        <div className={styles.eventsSection}>
          {/* Loading skeleton */}
          {loading && (
            <div className={styles.loadingWrap}>
              <div className={styles.spinner} />
              <p className={styles.loadingText}>جاري تحميل الفعاليات...</p>
            </div>
          )}

          {/* Empty state — only when done loading and no data */}
          {!loading && events.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <CalendarX size={52} strokeWidth={1.4} />
              </div>
              <h3 className={styles.emptyTitle}>لا توجد فعاليات حتى الآن</h3>
              <p className={styles.emptyDesc}>
                لم يتم إنشاء أي فعاليات بعد. ابدأ بإضافة فعالية جديدة لعرضها هنا.
              </p>
              <button className={styles.emptyBtn} onClick={goCreate}>
                <Plus size={16} />
                إنشاء أول فعالية
              </button>
            </div>
          )}

          {/* Events grid — only when there's data */}
          {!loading && events.length > 0 && (
            <EventsGrid
              items={events}
              onItemsChange={setEvents}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
}