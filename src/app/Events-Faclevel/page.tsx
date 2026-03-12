"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./styles/EventsPage.module.css";
import EventsGrid from "./components/EventsGrid";
import StatsGrid from "./components/StatsGrid";
import type { StatItem } from "./components/StatsGrid";
import Tabs from "./components/Tabs";
import { EventItem, ChipVariant } from "./components/EventCard";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Footer from "@/app/FacLevel/components/Footer";
import { authFetch } from "@/utils/globalFetch";

const API_URL = "http://localhost:8000";

type ApiEvent = {
  event_id: number;
  title: string;
  description: string;
  st_date: string;
  end_date: string;
  location: string;
  status: any;
  type: string;
  cost: string;
  s_limit: number;
  faculty_id: number | null;
  dept_id: number;
  active?: any;
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
): Promise<{ ok: true; data: T } | { ok: false; message: string; status?: number; raw?: any }> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as any),
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
          ((maybeJson as any).detail || (maybeJson as any).message || (maybeJson as any).error)) ||
        (typeof maybeJson === "string" ? maybeJson : "") ||
        `طلب غير ناجح (${res.status})`;

      return { ok: false, message: String(msg), status: res.status, raw: maybeJson };
    }

    return { ok: true, data: maybeJson as T };
  } catch (e: any) {
    return { ok: false, message: e?.message || "مشكلة في الاتصال" };
  }
}

function toBool(v: any): boolean | null {
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

function categoryVariant(_type: string): ChipVariant {
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

  const isActive = apiActive ?? statusBool ?? statusText === "نشط";

  // ✅ dept event = faculty_id === null => hide toggle
  const isDeptEvent = e.faculty_id === null;

  return {
    id: e.event_id,
    title: e.title ?? "",
    planName: e.description ?? "",
    statusLabel: statusText ?? "",
    statusVariant: statusVariant(statusText),
    categoryLabel: e.type ?? "",
    categoryVariant: categoryVariant(e.type),
    date: e.st_date || "",
    time: e.end_date || "",
    location: e.location ?? "",
    participantsText: `الحد الأقصى: ${e.s_limit ?? 0}`,
    priceText: toPriceText(e.cost),
    isActive: Boolean(isActive),

    // ✅ keep ids for tabs filtering
    faculty_id: e.faculty_id ?? null,
    dept_id: e.dept_id,

    // ✅ remove toggle for dept events only
    hideToggle: isDeptEvent,
  };
}

type NotifType = "success" | "error" | "warning";
type EventsTab = "faculty" | "dept";

export default function Page() {
  const router = useRouter();
  const goCreate = () => router.push("/Events-Faclevel/create");

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Tabs
  const [activeTab, setActiveTab] = useState<EventsTab>("faculty");

  // ✅ Notification (Toast)
  const [notification, setNotification] = useState<{ message: string; type: NotifType } | null>(null);
  const showNotification = (message: string, type: NotifType) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2500);
  };

  const fetchEvents = async () => {
    setLoading(true);
    const res = await apiFetch<ApiEvent[]>("/api/event/get-events/", { method: "GET" });
    setLoading(false);

    if (!res.ok) {
      showNotification(res.message || "فشل تحميل الفعاليات", "error");
      return;
    }

    const list = Array.isArray(res.data) ? res.data : [];
    setEvents(list.map(toEventItem));
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Counts for badges
  const facultyCount = useMemo(() => events.filter((e) => e.faculty_id !== null).length, [events]);
  const deptCount = useMemo(() => events.filter((e) => e.faculty_id === null).length, [events]);

  const tabItems = useMemo(
    () => [
      { key: "faculty" as const, label: "فعاليات الكلية", badge: facultyCount },
      { key: "dept" as const, label: "فعاليات القسم", badge: deptCount },
    ],
    [facultyCount, deptCount]
  );

  // ✅ Filter by tab
  const visibleEvents = useMemo(() => {
    if (activeTab === "faculty") return events.filter((e) => e.faculty_id !== null);
    return events.filter((e) => e.faculty_id === null);
  }, [events, activeTab]);

  // ✅ Stats based on current tab list
  const stats: StatItem[] = useMemo(() => {
    const active = visibleEvents.filter((e) => e.isActive).length;
    const inactive = visibleEvents.filter((e) => !e.isActive).length;
    const total = visibleEvents.length;

    return [
      { title: "إجمالي الفعاليات", value: String(total), meta: "", icon: "calendar", accent: "gold" },
      { title: "الفعاليات النشطة", value: String(active), meta: "", icon: "check", accent: "green" },
      { title: "فعاليات غير نشطة", value: String(inactive), meta: "", icon: "clock", accent: "indigo" },
    ];
  }, [visibleEvents]);

  const onView = (id: number) => router.push(`/Events-Faclevel/${id}`);
  const onEdit = (id: number) => router.push(`/Events-Faclevel/create/${id}`);

  const onDelete = async (id: number) => {
    const prev = events;

    const res = await apiFetch<any>(`/api/event/get-events/${id}/`, {
      method: "DELETE",
    });

    if (!res.ok) {
      setEvents(prev);
      showNotification(res.message || "فشل الغاء الفعالية", "error");
      return;
    }

    showNotification("✅ تم الغاء الفعالية بنجاح", "success");
    await fetchEvents();
  };

  return (
    <div className={styles.page}>


      {/* ✅ Notification */}
      {notification && (
        <div
          className={`${styles.notification} ${
            notification.type === "success"
              ? styles.success
              : notification.type === "warning"
              ? styles.warning
              : styles.error
          }`}
        >
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

        {/* ✅ Tabs */}
        <Tabs<EventsTab> value={activeTab} onChange={setActiveTab} items={tabItems} />

        <StatsGrid items={stats} />

        <div className={styles.eventsSection}>
          {loading && (
            <div style={{ fontWeight: 800, opacity: 0.8, marginBottom: 12 }}>
              جاري تحميل الفعاليات...
            </div>
          )}

          <EventsGrid
            items={visibleEvents}
            onItemsChange={setEvents}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}