"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./styles/EventsPage.module.css";
import EventsGrid from "./components/EventsGrid";
import StatsGrid from "./components/StatsGrid";
import type { StatItem } from "./components/StatsGrid";
import Tabs from "./components/Tabs";
import { EventItem, ChipVariant } from "./components/EventCard";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { authFetch, getBaseUrl } from "@/utils/globalFetch";

const API_URL = getBaseUrl();

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

function getAccessToken(): string | null {
  return (
    localStorage.getItem("access") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    null
  );
}

function getDepartmentsFromToken(): { dept_id: number; dept_name: string }[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("departments");
  if (!stored) return [];
  try {
    const departments = JSON.parse(stored);
    const excluded = ["التكافل الإجتماعي", "الأسر الطلابية"];
    return departments.filter((d: Record<string, unknown>) => !excluded.includes(d.dept_name as string));
  } catch (err) {
    console.error("Departments parse error:", err);
    return [];
  }
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
  if (s === "نشط") return "success";
  if (s === "منتظر") return "primary";
  if (s === "مكتمل") return "info";
  if (s === "غير نشط" || s === "ملغي") return "danger";
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

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<EventsTab>("faculty");
  const [userDepartments, setUserDepartments] = useState<Record<string, unknown>[]>([]);
  const [deptFilter, setDeptFilter] = useState<number | "all">("all");
  const [search, setSearch] = useState("");

  const showFilters = userDepartments.length > 1;

  useEffect(() => {
    const depts = getDepartmentsFromToken();
    setUserDepartments(depts);
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const res = await apiFetch<ApiEvent[]>("/api/event/get-events/");
    setLoading(false);
    if (!res.ok) return;
    setEvents(res.data.map(toEventItem));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

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
    { key: "dept", label: "فعاليات القسم", badge: deptCount },
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
    const active = visibleEvents.filter((e) => e.isActive).length;
    const inactive = visibleEvents.filter((e) => !e.isActive).length;
    return [
      {
        title: "إجمالي الفعاليات",
        value: String(visibleEvents.length),
        meta: "",
        icon: "calendar",
        accent: "gold",
      },
      {
        title: "الفعاليات النشطة",
        value: String(active),
        meta: "",
        icon: "check",
        accent: "green",
      },
      {
        title: "فعاليات غير نشطة",
        value: String(inactive),
        meta: "",
        icon: "clock",
        accent: "indigo",
      },
    ];
  }, [visibleEvents]);

  const goCreate = () => router.push("/Events-Faclevel/create");
  const onView = (id: number) => router.push(`/Events-Faclevel/${id}`);
  const onEdit = (id: number) => router.push(`/Events-Faclevel/create/${id}`);

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
          onChange={setActiveTab}
          items={tabItems}
        />

        {showFilters && (
          <div className={styles.filtersBar}>
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
              onDelete={() => {}}
            />
          )}
        </div>
      </div>

     
    </div>
  );
}
