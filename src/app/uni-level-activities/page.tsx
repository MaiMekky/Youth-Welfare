"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./styles/EventsPage.module.css";
import EventsGrid from "./component/EventsGrid";
import StatsGrid from "./component/StatsGrid";
import type { StatItem } from "./component/StatsGrid";
import { EventItem, ChipVariant } from "./component/EventCard";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

const API_URL = "http://localhost:8000";

type ApiEvent = {
  event_id: number;
  title: string;
  description: string;
  st_date: string;
  end_date: string;
  location: string;
  status: string;
  type: string;
  cost: string;
  s_limit: number;
  faculty_id: number | null;
  dept_id: number;
  active?: boolean;
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
  const apiActive =
    typeof e.active === "boolean"
      ? e.active
      : null;

  const isActive = apiActive ?? (e.status === "نشط"); 

  return {
    id: e.event_id,
    title: e.title ?? "",
    planName: e.description ?? "",
    statusLabel: e.status ?? "",
    statusVariant: statusVariant(e.status),
    categoryLabel: e.type ?? "",
    categoryVariant: categoryVariant(e.type),
    date: e.st_date || "",
    time: e.end_date || "",
    location: e.location ?? "",
    participantsText: `الحد الأقصى: ${e.s_limit ?? 0}`,
    priceText: toPriceText(e.cost),
    isActive,
  };
}

export default function Page() {
  const router = useRouter();
  const goCreate = () => router.push("/uni-level-activities/create");

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    const res = await apiFetch<ApiEvent[]>("/api/event/get-events/", { method: "GET" });
    setLoading(false);

    if (!res.ok) {
      window.alert(res.message);
      return;
    }

    const list = Array.isArray(res.data) ? res.data : [];
    setEvents(list.map(toEventItem));
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats: StatItem[] = useMemo(() => {
    const waiting = events.filter((e) => e.statusLabel === "منتظر").length;
    const active = events.filter((e) => e.isActive).length;
    const inactive = events.filter((e) => !e.isActive).length;

    // تقديري: إجمالي السعة
    const totalLimit = events.reduce((acc, e) => {
      const m = String(e.participantsText).match(/(\d+)/);
      const n = m ? Number(m[1]) : 0;
      return acc + (Number.isFinite(n) ? n : 0);
    }, 0);

 const total = events.length;

return [
  { title: "إجمالي الفعاليات", value: String(total), meta: "", icon: "calendar", accent: "gold" },
  { title: "الفعاليات النشطة", value: String(active), meta: "", icon: "check", accent: "green" },
  { title: "فعاليات غير نشطة", value: String(inactive), meta: "", icon: "clock", accent: "indigo" },
];
  }, [events]);

  const onView = (id: number) => router.push(`/uni-level-activities/${id}`);
  const onEdit = (id: number) => router.push(`/uni-level-activities/create/${id}`);
  const onDelete = (id: number) => {
    if (confirm("هل تريد حذف الفعالية؟")) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }
  };

  return (
    <div className={styles.page}>
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
          {loading && <div style={{ fontWeight: 800, opacity: 0.8, marginBottom: 12 }}>جاري تحميل الفعاليات...</div>}

          <EventsGrid
            items={events}
            onItemsChange={setEvents}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
}