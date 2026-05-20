"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./styles/EventsPage.module.css";
import EventsGrid from "./component/EventsGrid";
import StatsGrid from "./component/StatsGrid";
import type { StatItem } from "./component/StatsGrid";
import { EventItem, ChipVariant } from "./component/EventCard";
import { useRouter } from "next/navigation";
import { Plus, CalendarX, Search } from "lucide-react";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { useToast } from "@/app/context/ToastContext";
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


async function apiFetch<T>(
  path: string,
  opts: RequestInit = {}
): Promise<{ ok: true; data: T } | { ok: false; message: string; status?: number; raw?: unknown }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string>),
  };

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
  if (s === "نشط")                return "success";
  if (s === "مقبول")              return "accepted";   // emerald green
  if (s === "موافقة مبدئية")     return "pending";  // cyan/teal
  if (s === "منتظر")              return "pending";    // amber
  if (s === "مكتمل")              return "completed";  // blue
  if (s === "منتهي الصلاحية")    return "expired";    // slate/grey
  if (s === "مرفوض")             return "rejected";   // rose/red
  if (s === "ملغي")              return "cancelled";  // deep red/crimson
  if (s === "غير نشط")           return "danger";
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

type Faculty = { faculty_id: number; name: string };

export default function Page() {
  const router = useRouter();
  const { showToast } = useToast();
  const goCreate = () => router.push("/uni-level-activities/create");

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]   = useState("");

  const buildQueryString = (from: string, to: string) => {
    const params = new URLSearchParams();
    if (from) params.set("date_from", from);
    if (to)   params.set("date_to",   to);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  };

  const fetchFaculties = async () => {
    const res = await apiFetch<Faculty[]>("/api/family/faculties/", { method: "GET" });
    if (!res.ok) { showToast("فشل تحميل الكليات", "error"); return; }
    setFaculties(res.data);
  };

  const fetchEvents = async (silent = false) => {
    if (!silent) setLoading(true);
    const qs  = buildQueryString(dateFrom, dateTo);
    const res = await apiFetch<ApiEvent[]>(`/api/event/get-events/${qs}`, { method: "GET" });
    if (!silent) setLoading(false);
    if (!res.ok) { showToast(res.message || "فشل تحميل الفعاليات", "error"); return; }
    const list = Array.isArray(res.data) ? res.data : [];
    setEvents(list.map((e) => toEventItem(e)));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchFaculties(); }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (faculties.length) fetchEvents(false); }, [faculties]);

  // Date filter changes — debounce 400 ms, silent refresh (no spinner flash)
  useEffect(() => {
    if (!faculties.length) return;
    const timer = setTimeout(() => {
      const qs = buildQueryString(dateFrom, dateTo);
      apiFetch<ApiEvent[]>(`/api/event/get-events/${qs}`).then((res) => {
        if (res.ok) {
          const list = Array.isArray(res.data) ? res.data : [];
          setEvents(list.map((e) => toEventItem(e)));
        }
      });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo]);

  const visibleEvents = useMemo(() => {
    let list = events;
    if (search.trim()) {
      list = list.filter((e) =>
        e.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    return list;
  }, [events, search]);

  const stats: StatItem[] = useMemo(() => {
    const active   = visibleEvents.filter((e) => e.isActive).length;
    const inactive = visibleEvents.filter((e) => !e.isActive).length;
    const total    = visibleEvents.length;
    return [
      { title: "إجمالي الفعاليات",   value: String(total),    meta: "", icon: "calendar", accent: "gold"   },
      { title: "الفعاليات النشطة",    value: String(active),   meta: "", icon: "check",    accent: "green"  },
      { title: "فعاليات غير نشطة",   value: String(inactive), meta: "", icon: "clock",    accent: "indigo" },
    ];
  }, [visibleEvents]);

  const onView   = (id: number) => router.push(`/uni-level-activities/${id}`);
  const onEdit   = (id: number) => router.push(`/uni-level-activities/create/${id}`);
  const onDelete = async (id: number) => {
    const prev = events;
    const res = await apiFetch<Record<string, unknown>>(`/api/event/get-events/${id}/`, { method: "DELETE" });
    if (!res.ok) { setEvents(prev); showToast(res.message || "فشل الغاء الفعالية", "error"); return; }
    showToast("✅ تم الغاء الفعالية بنجاح", "success");
    await fetchEvents();
  };

  const onMarkCompleted = async (id: number) => {
    const res = await apiFetch<Record<string, unknown>>(
      `/api/event/manage-events/${id}/mark-completed/`,
      { method: "PATCH" }
    );
    if (!res.ok) {
      showToast(res.message || "فشل تغيير حالة الفعالية", "error");
      return;
    }
    showToast("✅ تم إتمام الفعالية بنجاح", "success");
    await fetchEvents();
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

        <div className={styles.filtersBar}>
          {/* Search */}
          <div className={styles.searchBox}>
            <Search size={16} />
            <input
              placeholder="ابحث باسم الفعالية..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

           {/* Date from */}
          <div className={styles.dateGroup}>
            <label className={styles.dateLabel}>من تاريخ</label>
            <div className={styles.dateBox}>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
          </div>

          {/* Date to */}
          <div className={styles.dateGroup}>
            <label className={styles.dateLabel}>إلى تاريخ</label>
            <div className={styles.dateBox}>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
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
          {!loading && visibleEvents.length === 0 && (
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
          {!loading && visibleEvents.length > 0 && (
            <EventsGrid
              items={visibleEvents}
              onItemsChange={setEvents}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onMarkCompleted={onMarkCompleted}
            />
          )}
        </div>
      </div>
    </div>
  );
}