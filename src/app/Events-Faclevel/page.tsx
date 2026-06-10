"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./styles/EventsPage.module.css";
import EventsGrid from "./components/EventsGrid";
import StatsGrid from "./components/StatsGrid";
import type { StatItem } from "./components/StatsGrid";
import Tabs from "./components/Tabs";
import { EventItem, ChipVariant } from "./components/EventCard";
import { useRouter } from "next/navigation";
import { Plus, Search, CalendarSearch } from "lucide-react";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";
import { getSessionMeta } from "@/utils/cookieHelpers";
import { useToast } from "@/app/context/ToastContext";

const API_URL = getBaseUrl();

const TAB_SESSION_KEY = "eventsList_activeTab";

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
  active?: boolean | string | number;
};

function getDepartmentsFromToken(): { dept_id: number; dept_name: string }[] {
  const meta = getSessionMeta();
  if (!meta?.departments?.length) return [];
  const excluded = ["التكافل الإجتماعي", "الأسر الطلابية"];
  return meta.departments.filter((d) => !excluded.includes(d.dept_name));
}

async function apiFetch<T>(
  path: string,
  opts: RequestInit = {}
): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string>),
  };
  try {
    const res = await authFetch(`${API_URL}${path}`, { ...opts, headers });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, message: data?.detail || "فشل الطلب" };
    }
    return { ok: true, data };
  } catch (e: unknown) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) || "مشكلة في الاتصال" };
  }
}

function toBool(v: unknown): boolean | null {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    const s = v.toLowerCase();
    if (["true", "1"].includes(s)) return true;
    if (["false", "0"].includes(s)) return false;
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
  const n = Number(cost);
  if (!Number.isFinite(n) || n === 0) return "مجاني";
  return `${n} جنيه`;
}

function toEventItem(e: ApiEvent): EventItem {
  const isActive = toBool(e.active) ?? toBool(e.status) ?? false;
  const isDeptEvent = e.faculty_id === null;
  return {
    id: e.event_id,
    title: e.title ?? "",
    planName: e.description ?? "",
    statusLabel: e.status ?? "",
    statusVariant: statusVariant(e.status),
    categoryLabel: e.type ?? "",
    categoryVariant: categoryVariant(),
    date: e.st_date || "",
    time: e.end_date || "",
    location: e.location ?? "",
    participantsText: `الحد الأقصى: ${e.s_limit ?? 0}`,
    priceText: toPriceText(e.cost),
    isActive: Boolean(isActive),
    faculty_id: e.faculty_id ?? null,
    dept_id: e.dept_id,
    hideToggle: isDeptEvent,
  };
}

type EventsTab = "faculty" | "dept";

export default function Page() {
  const router = useRouter();
  const { showToast } = useToast();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Always "faculty" on first render (matches server)
const [activeTab, setActiveTab] = useState<EventsTab>("faculty");

// Then restore saved tab after mount (client-only)
useEffect(() => {
  const saved = sessionStorage.getItem(TAB_SESSION_KEY);
  if (saved === "faculty" || saved === "dept") {
    setActiveTab(saved);
  }
}, []);

  const [userDepartments, setUserDepartments] = useState<Record<string, unknown>[]>([]);
  const [deptFilter, setDeptFilter] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]   = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleTabChange = (tab: EventsTab) => {
    setActiveTab(tab);
    sessionStorage.setItem(TAB_SESSION_KEY, tab);
  };

  const showFilters = userDepartments.length > 1;

  useEffect(() => {
    const depts = getDepartmentsFromToken();
    setUserDepartments(depts);
  }, []);

  const buildQueryString = (from: string, to: string) => {
    const params = new URLSearchParams();
    if (from) params.set("date_from", from);
    if (to)   params.set("date_to",   to);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  };

  // silent=true -> refresh list in background without showing the loading spinner
  const fetchEvents = async (silent = false) => {
    if (!silent) setLoading(true);
    const qs  = buildQueryString(dateFrom, dateTo);
    const res = await apiFetch<ApiEvent[]>(`/api/event/get-events/${qs}`);
    if (!silent) setLoading(false);
    if (!res.ok) return;
    setEvents(res.data.filter((e) => e.status !== "منتظر").map(toEventItem));
  };

  // Initial load — show spinner
  useEffect(() => {
    fetchEvents(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Date filter changes — debounce 400 ms, silent refresh (no spinner flash)
  useEffect(() => {
    const timer = setTimeout(() => {
      const qs = buildQueryString(dateFrom, dateTo);
      apiFetch<ApiEvent[]>(`/api/event/get-events/${qs}`).then((res) => {
        if (res.ok) setEvents(res.data.filter((e) => e.status !== "منتظر").map(toEventItem));
      });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo]);

  const facultyCount = useMemo(
    () => events.filter((e) => e.faculty_id !== null).length,
    [events]
  );

  const deptCount = useMemo(
    () => events.filter((e) => e.faculty_id === null).length,
    [events]
  );

  const tabItems: { key: EventsTab; label: string; badge: number }[] = [
    { key: "faculty", label: "فعاليات الكلية", badge: facultyCount },
    { key: "dept",    label: "فعاليات القسم",  badge: deptCount },
  ];

  const visibleEvents = useMemo(() => {
    let list = events;
    if (activeTab === "faculty") {
      list = list.filter((e) => e.faculty_id !== null);
    } else {
      list = list.filter((e) => e.faculty_id === null);
    }
    if (deptFilter !== "all") {
      list = list.filter((e) => e.dept_id === deptFilter);
    }
    if (search.trim()) {
      list = list.filter((e) =>
        e.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    return list;
  }, [events, activeTab, deptFilter, search]);
  const stats: StatItem[] = useMemo(() => {
    const total     = visibleEvents.length;
    const accepted  = visibleEvents.filter((e) => e.statusLabel === "مقبول").length;
    const pending   = visibleEvents.filter((e) => e.statusLabel === "منتظر" || e.statusLabel === "موافقة مبدئية").length;
    const cancelled = visibleEvents.filter((e) => e.statusLabel === "ملغي").length;
    const rejected  = visibleEvents.filter((e) => e.statusLabel === "مرفوض").length;
    const completed = visibleEvents.filter((e) => e.statusLabel === "مكتمل").length;

    return [
      { title: "إجمالي الفعاليات", value: String(total),     icon: "calendar", accent: "gold"   },
      { title: "مقبول",            value: String(accepted),  icon: "check",    accent: "green"  },
      { title: "منتظر",            value: String(pending),   icon: "clock",    accent: "amber"  },
      { title: "مرفوض",            value: String(rejected),  icon: "clock",    accent: "indigo" },
      { title: "ملغي",             value: String(cancelled), icon: "clock",    accent: "amber"  },
      { title: "مكتمل",            value: String(completed), icon: "check",    accent: "green"  },
    ];
  }, [visibleEvents]);

  const goCreate = () => router.push("/Events-Faclevel/create");

  const onView = (id: number) => {
    sessionStorage.setItem(TAB_SESSION_KEY, activeTab);
    sessionStorage.setItem("eventDetails_from", "/Events-Faclevel");
    router.push(`/Events-Faclevel/${id}`);
  };

  const onEdit = (id: number) => router.push(`/Events-Faclevel/create/${id}`);

  const onDelete = async (id: number) => {
    const prev = events;
    const res  = await apiFetch<Record<string, unknown>>(
      `/api/event/get-events/${id}/`,
      { method: "DELETE" }
    );
    if (!res.ok) {
      setEvents(prev);
      showToast(res.message || "فشل الغاء الفعالية", "error");
      return;
    }
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

  const onJoinEvent = async (id: number) => {
    const res = await apiFetch<Record<string, unknown>>(
      `/api/event/manage-events/${id}/join/`,
      { method: "POST" }
    );
    if (!res.ok) {
      showToast(res.message || "فشل الانضمام للفعالية", "error");
      return;
    }
    showToast("✅ تم الانضمام للفعالية بنجاح", "success");
    await fetchEvents();
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>إدارة الفعاليات</h1>
            <p className={styles.pageSubtitle}>
              إنشاء وتعديل وإدارة فعاليات الجامعة
            </p>
          </div>
          <button className={styles.createBtnTop} onClick={goCreate}>
            <Plus size={18} />
            إنشاء فعالية جديدة
          </button>
        </div>

        <Tabs<EventsTab>
          value={activeTab}
          onChange={handleTabChange}
          items={tabItems}
        />
          {/* Dept filter — only when user has >1 dept */}
          {showFilters && (
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


            <select
              value={deptFilter}
              className={styles.searchBox}
              onChange={(e) =>
                setDeptFilter(
                  e.target.value === "all" ? "all" : Number(e.target.value)
                )
              }
            >
              <option value="all">كل الأقسام</option>
              {userDepartments.map((d: Record<string, unknown>) => (
                <option key={d.dept_id as number} value={d.dept_id as number}>
                  {d.dept_name as string}
                </option>
              ))}
            </select>
         
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
        )}
        
        <StatsGrid items={stats} />

        <div className={styles.eventsSection}>
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "64px 0",
                color: "#9ca3af",
                fontSize: "2rem",
                fontWeight: 600,
              }}
            >
              جاري تحميل الفعاليات...
            </div>
          ) : visibleEvents.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "64px 0",
                color: "#9ca3af",
                fontSize: "2rem",
                fontWeight: 600,
              }}
            >
              لا يوجد فعاليات حتي الان
            </div>
          ) : (
            <EventsGrid
              items={visibleEvents}
              onItemsChange={setEvents}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onMarkCompleted={onMarkCompleted}
              onJoinEvent={onJoinEvent}
            />
          )}
        </div>
      </div>
    </div>
  );
}